import { Subscription } from "rxjs";
import { Injectable } from "@angular/core";

import type { Player } from "@/models/types";

import type { Broadcast, BroadcastEventCallback, GameState, WinState } from "@/services/BroadcastService/BroadcastService.types";
import type { Card, Color } from "@/services/CardService/CardService.types";
import type { ElementalType } from "@/services/ElementalService/ElementalService.types";

import { AiPlayerService } from "@/services/AiPlayerService";
import { StorageService } from "@/services/StorageService";
import { TimerService } from "@/services/TimerService";
import { BroadcastService, CardService, ElementalService } from "@/services/GameServices";

import BaseStore, { StoreState } from "../BaseStore";
import { UserStore } from "../UserStore";

import { onDeclareRoundWinner, onFinishGame, onPlayCard, onUpdateGameState } from './events';

const DEFAULT_ROUND_DURATION_SECONDS = 30;

type State = {
  gameState: GameState;
  players: Array<Player>;
  lastWinner: Player | null;
  aiPlayerNames: Array<string>;
};

@Injectable({ providedIn: 'root' })
@StoreState<State>({
  gameState: 'idle',
  players: [],
  lastWinner: null,
  aiPlayerNames: [],
})
export class GameStore extends BaseStore<State> {
  constructor(
    storageService: StorageService,
    protected userStore: UserStore,
    protected broadcastService: BroadcastService,
    protected cardService: CardService,
    protected elementalService: ElementalService,
  ) {
    super(storageService, 'Game');
  }

  protected aiPlayerService = new AiPlayerService();
  protected timer = TimerService.createTimer(
    this.findAndDeclareRoundWinner.bind(this),
    DEFAULT_ROUND_DURATION_SECONDS
  );

  // #region Getters & Setters
  private get _gameState() {
    this.Logger.info('[GET] gameState', this.state.gameState);
    return this.state.gameState;
  }
  private set _gameState(state: GameState) {
    this.Logger.groupCollapsed('[SET] gameState', state);
    this.state.gameState = state;

    this.Logger.info('Broadcasting updateGameState', state);
    this.broadcastService.emit('updateGameState', state);
    this.Logger.groupEnd();
  }

  public get players() {
    const players = this.state.players;
    this.Logger.info('[GET] players', players);
    if (!players.length && this._gameState !== 'idle') {
      this.Logger.error('No players found!', players);
      this._gameState = 'idle';
      throw new Error('No players found! Game state reset to "idle"');
    }

    return players;
  }
  public set players(players: Array<Player>) {
    this.Logger.info('[SET] players', players);
    this.state.players = players;
    this.Logger.info('Updated players', players).groupEnd();
  }

  public get isActive() {
    const isActive = this._gameState !== 'idle' && this._gameState !== 'finish';
    this.Logger.info('[GET] isActive', isActive, this);
    return isActive;
  }
  public get timeLeftOfRound() {
    const timeLeft = this.timer.timeLeft;
    this.Logger.info('[GET] timeLeftOfRound', timeLeft);
    return timeLeft;
  }
  // #endregion

  // #region Exposed Actions
  public startGame() {
    this.Logger.groupCollapsed('[ACTION] startGame');
    if (this.players.length === 1) {
      this.Logger.error('Cannot start game with only one player!').groupEnd();
      throw new Error('Cannot start game with only one player');
    }

    this.Logger.info('Updating gameState to "deal".',).groupEnd();
    this._gameState = 'deal';
  }
  public playCard(player: Player, cardResolvable: number | Card) {
    this.Logger.groupCollapsed('[ACTION] playCard', player, cardResolvable);
    if (this._gameState !== 'play') {
      this.Logger.error('Cannot play card when not in play state').groupEnd();
      throw new Error('Cannot play card when not in play state');
    }

    const card = typeof cardResolvable === 'number'
      ? player.cards[cardResolvable]
      : player.cards.find(c => this.cardService.isSameCard(c, cardResolvable));

    if (!card) {
      this.Logger.error('Card not found in player deck!', { card, player }).groupEnd();
      throw new Error('Card not found in player deck');
    }

    player.activeCard = card;

    this.Logger.info('Updating player state with activeCard', player);
    this.updatePlayer(player);

    this.Logger.info('Checking if ready to update gameState...');
    if (this.players.every(p => p.activeCard)) {
      this.Logger.groupCollapsed('Check returned true - updating gameState to "check"').groupEnd();
      this._gameState = 'check';
    } else {
      this.Logger.info(`Check returned false - gameState remains "${this.state.gameState}"`).groupEnd();
    }
  }
  // #endregion

  // #region Player Actions
  protected addPlayer(username: string) {
    this.Logger.groupCollapsed('[PLAYER ACTION] addPlayer', username);

    this.players = [
      ...this.players,
      {
        name: username,
        wins: [],
        activeCard: null,
        cards: [],
      }
    ];

    const addedPlayer = this.players.find(p => p.name === username);
    if (!addedPlayer) throw new Error('Failed to add player!');

    this.Logger.info('Added player', {
      players: this.players,
      addedPlayer
    }).groupEnd();

    return addedPlayer;
  }
  public getCurrentPlayer() {
    return this.players.find(p => p.name === this.userStore.state.username);
  }
  protected updatePlayer(player: Player) {
    this.Logger.groupCollapsed('[PLAYER ACTION] updatePlayer', player);

    this.players = this.players.map(p => p.name === player.name ? player : p);
    this.Logger.info('Updated player', {
      players: this.players,
      player
    }).groupEnd();
  }
  public removePlayer(player: Player) {
    this.Logger.groupCollapsed('[PLAYER ACTION] removePlayer', player);

    const playerLength = this.players.length;
    this.players = this.players.filter(p => p !== player);
    const updatedPlayerLength = this.players.length;

    if (playerLength !== updatedPlayerLength) this.Logger.info('Removed player', {
      players: this.players,
      removedPlayer: player
    });
    else this.Logger.error('Player was not removed!', {
      players: this.players,
      removedPlayer: player
    });

    this.Logger.info('Checking if player was an AI player...');
    if (this.aiPlayerService.isAiPlayer(player)) {
      this.Logger.info('Player was an AI player - removing from AI player list');
      this.aiPlayerService.removeAiPlayer(player);
    } else {
      this.Logger.info('Player was not an AI player');
    }

    this.Logger.groupEnd();
  }

  public addAiPlayer() {
    this.Logger.groupCollapsed('[ACTION] addAiPlayer');

    const aiPlayer = this.aiPlayerService.createAiPlayer(this, this.broadcastService);
    const player = this.addPlayer(aiPlayer.name);
    aiPlayer.player = player;

    this.Logger.info('Added AI player', aiPlayer).groupEnd();
  }
  // #endregion

  // #region Broadcast Events
  private _subscriptions: Array<Subscription> = [];
  private _registerBroadcastEvents(broadcastService: BroadcastService) {
    this.Logger.groupCollapsed('Registering BroadcastEvents...', this._subscriptions);
    this._subscriptions = [
      broadcastService.on('finishGame', onFinishGame(this)),
      broadcastService.on('playCard', onPlayCard(this)),
      broadcastService.on('declareRoundWinner', onDeclareRoundWinner(this)),
      broadcastService.on('updateGameState', onUpdateGameState(this))
    ];
    this.Logger.info('Registered BroadcastEvents', this._subscriptions).groupEnd();
  }

  public on<TEvent extends keyof Broadcast>(event: TEvent, callback: BroadcastEventCallback<TEvent>) {
    return this.broadcastService.on(event, callback);
  }

  protected dealCards() {
    this.Logger.groupCollapsed('[GAME ACTION] dealCards');

    this.players = this.players.map(player => ({
      ...player,
      cards: this.cardService.generateCardDeck()
    }));
    this.aiPlayerService.updateAiPlayers(this.players);

    this.Logger.info('Dealt cards to players', this.players);

    this.Logger.info('Updating gameState to "play"').groupEnd();
    this._gameState = 'play';
  }
  protected startNewRound() {
    this.Logger.groupCollapsed('[GAME ACTION] startNewRound');

    this.players = this.players.map(player => ({
      ...player,
      activeCard: null,
      cards: player.cards.map(card => (
        player.activeCard && this.cardService.isSameCard(card, player.activeCard)
          ? this.cardService.generateCard()
          : card
      ))
    }));

    this.Logger.info('Updated card state for players', this.players).groupEnd();

    this.Logger.info('Starting round timer...');
    this.timer.restart();
    this.Logger.info('Round timer started', this.timer);
  }
  protected findAndDeclareRoundWinner() {
    this.Logger.groupCollapsed('[GAME ACTION] findAndDeclareRoundWinner');

    this.Logger.groupCollapsed('Sorting winners...');
    const winner = this.players
      .sort((a, b) => {
        if (!a.activeCard || !b.activeCard) {
          this.Logger.warn('Players have no cards!', { a, b }).groupEnd();
          return 0;
        }
        else if (!a.activeCard) {
          this.Logger.warn('Player A has no card!', { a, b }).groupEnd();
          // Player B wins
          return 1;
        }
        else if (!b.activeCard) {
          this.Logger.warn('Player B has no card!', { a, b }).groupEnd();
          // Player A wins
          return -1;
        }

        const winnerCard = this.cardService.determineWinner(a.activeCard, b.activeCard);
        this.Logger.info('Determined winner', {
          winner: winnerCard === a.activeCard ? a : b,
          card: winnerCard
        });

        return winnerCard === a.activeCard ? -1 : 1;
      })[0]!;

    this.Logger.groupEnd().info('Winner found', winner);
    this.state.lastWinner = winner;

    if (winner && winner.activeCard) {
      winner.wins.push(winner.activeCard);
      this.updatePlayer(winner);
    }

    const winState: WinState = (
      !winner ? 'draw' :
        winner.name === this.userStore.user.username ? 'win' :
          'loss'
    );

    this.Logger.info('Broadcasting winner', { winner, winState });
    this.broadcastService.emit('declareRoundWinner', winState, winner, winner?.activeCard ?? null);

    this.checkGameWinner();
  }
  protected checkGameWinner() {
    this.Logger.groupCollapsed('[GAME ACTION] checkGameWinner', this.players.map(p => ({
      wins: p.wins,
      name: p.name,
    })));

    for (const player of this.players) {
      const { wins } = player;
      if (wins.length < 3) continue;

      const elementMap = this.cardService.getWinsFromCards(wins);

      // Check if player has 3 of the same element or map size is 3
      const hasThreeOfSameElement = Object.values(elementMap).some(colors => colors.length === 3);
      const hasThreeDifferentElements = Object.values(elementMap).flat()
        .filter((color, i, arr) => arr.indexOf(color) === i) // Remove duplicates
        .length === 3;
      if (!hasThreeOfSameElement && !hasThreeDifferentElements) continue;

      // Declare game winner
      this.Logger.info('Game winner found', player);

      // Broadcast of game winner is handled in onGameStateChange, that later calls onFinishGame
      this.state.lastWinner = player;
      this._gameState = 'finish';
      return;
    }

    this.Logger.info('No game winners found yet - updating gameState back to "play".').groupEnd();
    this._gameState = 'play';
  }
  // #endregion

  // #region Lifecycle Hooks
  public onInit() {
    this.Logger.groupCollapsed('[LifeCycle] onInit');

    this.addPlayer(this.userStore.state.username);
    this._registerBroadcastEvents(this.broadcastService);

    this.Logger.groupEnd();
  }
  public onDestroy() {
    this.Logger.groupCollapsed('[LifeCycle] onDestroy');
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];
    this.Logger.info('Unsubscribed from BroadcastEvents', this._subscriptions).groupEnd();
  }
  // #endregion

  // #region Game Settings
  public setRoundTimer(seconds: number) {
    this.timer.setSeconds(seconds);
    this.Logger.info(`Updated round timer to ${seconds} seconds`, this.timer);
    return this;
  }
  public setCardDeckSize(size: number) {
    this.cardService.setDeckSize(size);
    this.Logger.info(`Updated card deck size to ${size}`, this.cardService);
    return this;
  }
  public setMaxCardValue(value: number) {
    this.cardService.setMaxCardValue(value);
    this.Logger.info(`Updated max card value to ${value}`, this.cardService);
    return this;
  }
  // #endregion
}

export default GameStore;