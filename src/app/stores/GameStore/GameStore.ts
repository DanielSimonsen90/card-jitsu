import { Subscription } from "rxjs";
import { Injectable } from "@angular/core";

import { StoreState } from "@/decorators";

import type { Player } from "@/models/types";
import type { Broadcast, BroadcastEventCallback, GameState, WinState } from "@/services/BroadcastService/BroadcastService.types";
import type { Card } from "@/services/CardService/CardService.types";

import { AiPlayerService } from "@/services/AiPlayerService";
import { StorageService } from "@/services/StorageService";
import { TimerService } from "@/services/TimerService";
import { BroadcastService, CardService, ElementalService } from "@/services/GameServices";

import BaseStore from "../BaseStore";
import UserStore from "../UserStore";
import SettingsStore from "../SettingsStore";

import {
  onDeclareRoundWinner, onFinishGame,
  onPlayCard, onGainRedraw,
  onSettingsChanged, onUpdateGameState
} from './events';

export const ROUND_END_DELAY_SECONDS = 3;

type State = {
  gameState: GameState;
  players: Array<Player>;
  lastWinner: Player | null;
};

@Injectable()
@StoreState<State>({
  gameState: 'idle',
  players: [],
  lastWinner: null,
})
export class GameStore extends BaseStore<State> {
  constructor(
    storageService: StorageService,

    protected userStore: UserStore,
    protected settingsStore: SettingsStore,

    protected cardService: CardService,
    protected broadcastService: BroadcastService,
  ) {
    super(storageService, 'Game');

    this.onTimerExpired = this.onTimerExpired.bind(this);
  }

  protected aiPlayerService = new AiPlayerService();
  protected elementalService = new ElementalService();
  protected timerService = new TimerService();

  // #region Getters & Setters
  public get gameState() {
    // this.Logger.info('[GET] gameState', this.state.gameState);
    return this.__state.gameState;
  }
  protected set gameState(state: GameState) {
    this.__logger.groupCollapsed('[SET] gameState', state);

    if (this.__state.gameState === state) {
      this.__logger.warn('Attempted to set same game state, skipping', state);
      this.__logger.groupEnd();
      return;
    }

    this.__state.gameState = state;

    // this.Logger.info('Broadcasting updateGameState', state);
    this.broadcastService.emit('updateGameState', state);
    this.__logger.groupEnd();
  }

  public get players() {
    const players = this.__state.players;
    // this.Logger.info('[GET] players', players);

    if (!players.length && this.gameState !== 'idle') {
      this.__logger.error('No players found!', players);
      this.gameState = 'idle';
      throw new Error('No players found! Game state reset to "idle"');
    }

    return players;
  }
  public set players(players: Array<Player>) {
    // this.Logger.info('[SET] players', players);
    this.__state.players = players;
    // this.Logger.info('Updated players', players).groupEnd();
  }

  public get isActive() {
    const isActive = this.gameState !== 'idle' && this.gameState !== 'finish';
    // this.Logger.info('[GET] isActive', isActive, this);
    return isActive;
  }
  public get timeLeftOfRound() {
    const timeLeft = this.timerService.timeLeft;
    this.__logger.info('[GET] timeLeftOfRound', timeLeft);
    return timeLeft;
  }

  public get timeLeft$() {
    return this.timerService.timeLeft$;
  }
  // #endregion

  // #region Lifecycle Actions
  public startGame() {
    this.__logger.groupCollapsed('[ACTION] startGame');
    if (this.players.length === 1) {
      this.__logger.error('Cannot start game with only one player!').groupEnd();
      throw new Error('Cannot start game with only one player');
    }

    this.__logger.info('Updating gameState to "deal".',).groupEnd();
    this.gameState = 'deal';
  }
  public playCard(player: Player, cardResolvable: number | Card) {
    this.__logger.groupCollapsed('[ACTION] playCard', player, cardResolvable);
    if (this.gameState !== 'play') {
      this.__logger.error('Cannot play card when not in play state').groupEnd();
      throw new Error('Cannot play card when not in play state');
    }

    const card = typeof cardResolvable === 'number'
      ? player.cards[cardResolvable]
      : player.cards.find(c => c && this.cardService.isSameCard(c, cardResolvable));

    if (!card) {
      this.__logger.error('Card not found in player deck!', { card, player }).groupEnd();
      throw new Error('Card not found in player deck');
    }

    player.activeCard = card;
    player.cards.splice(player.cards.indexOf(card), 1, null);

    this.__logger.info('Updating player state with activeCard', player);
    this.updatePlayer(player);

    this.__logger.info('Checking if ready to update gameState...');
    if (this.players.every(p => p.activeCard)) {
      this.__logger.info('Check returned true - updating gameState to "check"').groupEnd();
      this.gameState = 'check';
    } else {
      this.__logger.info(`Check returned false - gameState remains "${this.__state.gameState}"`).groupEnd();
    }
  }

  public redraw(receivedPlayer: Player, card: Card) {
    this.__logger.groupCollapsed('[ACTION] redraw', receivedPlayer, card);
    if (this.gameState !== 'play') {
      this.__logger.error('Cannot redraw card when not in play state').groupEnd();
      throw new Error('Cannot redraw card when not in play state');
    }

    const player = this.players.find(p => p.name === receivedPlayer.name);
    if (!player) {
      this.__logger.error('Player not found in game store', receivedPlayer).groupEnd();
      throw new Error('Player not found in game store');
    }

    if (player.availableRedraws <= 0) {
      this.__logger.error('Player has no available redraws', player).groupEnd();
      throw new Error('Player has no available redraws');
    }

    if (player.cards.some(card => card === null)) {
      this.__logger.error('Player has already played this round and cannot redraw yet', player).groupEnd();
      throw new Error('Player has already played this round and cannot redraw yet');
    }

    const previousCards = [...player.cards];
    player.cards = this.cardService.redrawCard(card, player.cards.filter((c): c is Card => c !== null));
    player.availableRedraws -= 1;

    this.__logger.info('Updated player state after redraw', player);

    this.updatePlayer(player);

    this.__logger.info('Broadcasting redrawCard event');
    this.broadcastService.emit('redrawCard',
      player,
      player.cards as Array<Card>,
      player.cards.find(c => !previousCards.includes(c)) as Card
    );

    this.__logger.groupEnd();
  }
  public gainRedraw(amount: number, players: Player[]) {
    for (const player of players) {
      player.availableRedraws += amount;
      this.updatePlayer(player);
    }

    this.broadcastService.emit('redrawGained', players);
  }

  protected resetGame(forceToIdle = false) {
    this.resetPlayers();
    this.__state.lastWinner = null;

    if (forceToIdle) this.gameState = 'idle';
    this.timerService.stopTimer();
  }
  // #endregion

  // #region Player Actions
  protected addPlayer(username: string, isAi = false): Player {
    this.__logger.groupCollapsed('[PLAYER ACTION] addPlayer', username);

    this.players = [
      ...this.players,
      {
        name: username,
        wins: [],
        activeCard: null,
        cards: [],
        availableRedraws: this.settingsStore.redraw.defaultRedraws,
        pfp: isAi ? this.aiPlayerService.getAiPlayernameWithoutSuffix(username) : this.selectRandomPfp(),
        isAi,
      }
    ];

    const addedPlayer = this.players.find(p => p.name === username);
    if (!addedPlayer) throw new Error('Failed to add player!');

    this.__logger.info('Added player', {
      players: this.players,
      addedPlayer
    }).groupEnd();

    return addedPlayer;
  }
  public getCurrentPlayer() {
    return this.players.find(p => p.name === this.userStore.user.username);
  }
  protected updatePlayer(player: Player) {
    this.__logger.groupCollapsed('[PLAYER ACTION] updatePlayer', player);

    this.players = this.players.map(p => p.name === player.name ? player : p);
    this.__logger.info('Updated player', {
      players: this.players,
      player
    }).groupEnd();
  }
  protected resetPlayers() {
    this.__logger.groupCollapsed('[PLAYER ACTION] resetPlayers');

    this.players = this.players.map(player => ({
      ...player,
      activeCard: null,
      cards: [],
      wins: [],
    }) as Player);

    this.__logger.info('Reset players', this.players).groupEnd();
  }
  public removePlayer(player: Player) {
    this.__logger.groupCollapsed('[PLAYER ACTION] removePlayer', player);

    const playerLength = this.players.length;
    this.players = this.players.filter(p => p !== player);
    const updatedPlayerLength = this.players.length;

    if (playerLength !== updatedPlayerLength) this.__logger.info('Removed player', {
      players: this.players,
      removedPlayer: player
    });
    else this.__logger.error('Player was not removed!', {
      players: this.players,
      removedPlayer: player
    });

    this.__logger.info('Checking if player was an AI player...');
    if (this.aiPlayerService.isAiPlayer(player)) {
      this.__logger.info('Player was an AI player - removing from AI player list');
      this.aiPlayerService.removeAiPlayer(player);
    } else {
      this.__logger.info('Player was not an AI player');
    }

    this.__logger.groupEnd();
  }

  public addAiPlayer() {
    this.__logger.groupCollapsed('[ACTION] addAiPlayer');

    const aiPlayer = this.aiPlayerService.createAiPlayer(this);
    const player = this.addPlayer(aiPlayer.name, true);
    aiPlayer.player = player;

    this.__logger.info('Added AI player', aiPlayer).groupEnd();
  }
  // #endregion

  // #region Broadcast Events
  private _subscriptions: Array<Subscription> = [];
  private _registerBroadcastEvents(broadcastService: BroadcastService) {
    // this.Logger.groupCollapsed('Registering BroadcastEvents...', this._subscriptions);
    this._subscriptions = [
      broadcastService.on('finishGame', onFinishGame(this)),
      broadcastService.on('playCard', onPlayCard(this)),
      broadcastService.on('declareRoundWinner', onDeclareRoundWinner(this)),
      broadcastService.on('gainRedraw', onGainRedraw(this)),
      broadcastService.on('settingsChanged', onSettingsChanged(this)),
      broadcastService.on('updateGameState', onUpdateGameState(this)),
    ];
    // this.Logger.info('Registered BroadcastEvents', this._subscriptions).groupEnd();
  }

  public on<TEvent extends keyof Broadcast>(event: TEvent, callback: BroadcastEventCallback<TEvent>) {
    return this.broadcastService.on(event, callback);
  }

  protected dealCards() {
    this.__logger.groupCollapsed('[GAME ACTION] dealCards');

    this.players = this.players.map(player => ({
      ...player,
      cards: this.cardService.generateCardDeck()
    }));
    this.aiPlayerService.updateAiPlayers(this.players);

    this.__logger.info('Dealt cards to players', this.players);
    
    this.__logger.info('Updating gameState to "play"').groupEnd();
    this.gameState = 'play';
  }
  protected startNewRound() {
    this.__logger.groupCollapsed('[GAME ACTION] startNewRound');

    this.players = this.players.map(player => {
      const selectedCardIndex = player.cards.findIndex(c => c === null);

      while (selectedCardIndex !== -1) {
        const newCard = this.cardService.generateCard();

        if (player.activeCard && this.cardService.isSameCard(newCard, player.activeCard)) {
          this.__logger.info('Regenerating card to avoid same active card', { oldCard: player.activeCard, newCard });
          continue;
        } else if (player.cards.some(c => c && this.cardService.isSameCard(c, newCard))) {
          this.__logger.info('Regenerating card to avoid duplicate in deck', { deck: player.cards, newCard });
          continue;
        }

        player.cards[selectedCardIndex] = newCard;
        break;
      }

      return {
        ...player,
        activeCard: null,
      };
    });

    this.__logger.info('Updated card state for players', this.players);

    this.__logger.info('Starting round timer...');
    this.timerService.startTimer(this.settingsStore.roundTimerSeconds, this.onTimerExpired);
    this.__logger.info('Round timer started').groupEnd();
  }
  private onTimerExpired() {
    this.gameState = 'check';
  }
  protected async findAndDeclareRoundWinner() {
    this.__logger.groupCollapsed('[GAME ACTION] findAndDeclareRoundWinner');

    await new Promise(resolve => setTimeout(resolve, ROUND_END_DELAY_SECONDS * 1000));

    this.__logger.groupCollapsed('Sorting winners...');
    const players = [...this.players];
    const winners = players
      .sort(() => Math.random() - 0.5) // Shuffle to prevent entry order bias
      .sort((a, b) => {
        if (!a.activeCard && !b.activeCard) {
          this.__logger.warn('Players have no cards!', { a, b }).groupEnd();
          return 0;
        }
        else if (!a.activeCard) {
          this.__logger.warn('Player A has no card!', { a, b }).groupEnd();
          // Player B wins
          return 1;
        }
        else if (!b.activeCard) {
          this.__logger.warn('Player B has no card!', { a, b }).groupEnd();
          // Player A wins
          return -1;
        }

        const winnerCard = this.cardService.determineWinner(a.activeCard, b.activeCard);
        this.__logger.info('Determined winner', {
          winner: winnerCard === a.activeCard ? a : winnerCard === b.activeCard ? b : null,
          card: winnerCard
        });

        return winnerCard === a.activeCard ? -1 : winnerCard === b.activeCard ? 1 : 0;
      });

    const [a, b] = winners;
    const winnerCard = (
      a.activeCard && b.activeCard
        ? this.cardService.determineWinner(a.activeCard, b.activeCard)
        : a.activeCard || b.activeCard
    );
    const winner = (winnerCard === a.activeCard) ? a : (winnerCard === b.activeCard) ? b : null;

    this.__logger
      .info(`${winner?.name ?? 'No one'} wins`, { winnerCard, a, b })
      .groupEnd()
      .info('Winner found', { winner, winnerCard });
    this.__state.lastWinner = winner;

    if (winner && winner.activeCard) {
      winner.wins.push(winner.activeCard);
      this.updatePlayer(winner);
    }

    const winState: WinState = (
      !winner ? 'draw' :
        winner.name === this.userStore.user.username ? 'win' :
          'loss'
    );

    this.__logger.info('Broadcasting winner', { winner, winState }).groupEnd();
    this.broadcastService.emit('declareRoundWinner', winState, winner, winner?.activeCard ?? null);
  }
  protected checkGameWinner() {
    this.__logger.groupCollapsed('[GAME ACTION] checkGameWinner', this.players.map(p => ({
      wins: p.wins,
      name: p.name,
    })));

    for (const player of this.players) {
      const { wins } = player;
      if (wins.length < 3) continue;

      const elementMap = this.cardService.getWinsFromCards(wins);

      // Check if player has 3 of the same element or map size is 3
      const hasThreeOfSameElement = Object
        .values(elementMap)
        .some(colors => colors.length >= 3);

      // Check if player has 3 different elements but not of the same color
      const hasThreeDifferentElements = Object.keys(elementMap).length === 3 && Object
        .values(elementMap)
        .flat()
        .filter((color, index, arr) => arr.indexOf(color) === index) // Get unique colors
        .length >= 3;

      if (!hasThreeOfSameElement && !hasThreeDifferentElements) continue;

      // Declare game winner
      this.__logger.info('Game winner found', player, { hasThreeDifferentElements, hasThreeOfSameElement, wins, elementMap });

      // Broadcast of game winner is handled in onGameStateChange, that later calls onFinishGame
      this.__state.lastWinner = player;
      this.gameState = 'finish';
      return;
    }

    this.__logger.info('No game winners found yet - updating gameState back to "play" after delay.').groupEnd();

    // Add a small delay to prevent rapid state cycling
    setTimeout(() => {
      this.gameState = 'play';
    }, 500);
  }
  // #endregion

  // #region Lifecycle Hooks
  public onInit() {
    this.__logger.groupCollapsed('[LifeCycle] onInit');

    this.addPlayer(this.userStore.user.username);
    this._registerBroadcastEvents(this.broadcastService);

    this.__logger.groupEnd();
  }
  public onDestroy() {
    this.__logger.groupCollapsed('[LifeCycle] onDestroy');
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];
    this.__logger.info('Unsubscribed from BroadcastEvents', this._subscriptions).groupEnd();
  }
  // #endregion

  protected selectRandomPfp() {
    const pfps = [
      'Beta',
      'Birthday',
      'Christmas',
      'The Blogger',
      'The Sithlord',
      'Winter'
    ];

    return pfps[Math.floor(Math.random() * pfps.length)];
  }
}

export default GameStore;