import { Subscription } from "rxjs";
import { Injectable } from "@angular/core";

import { Player } from "@/models/types";

import { GameState } from "@/services/BroadcastService/BroadcastService.types";
import { StorageService } from "@/services/StorageService";
import { BroadcastService, CardService, ElementalService, TimerService } from "@/services/GameServices";

import BaseStore, { StoreState as StoreState } from "../BaseStore";
import { UserStore } from "../UserStore";
import { onDeclareRoundWinner, onFinishGame, onPlayCard, onSendCard, onUpdateGameState } from './events';
import Timer from "@/services/TimerService/Timer";

const DEFAULT_ROUND_DURATION_SECONDS = 30;

type State = {
  gameState: GameState;
  players: Array<Player>;
  lastWinner: Player | null;
};

@Injectable({ providedIn: 'root' })
@StoreState<State>({
  gameState: 'idle',
  players: [],
  lastWinner: null
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

  private get gameState() {
    return this.state.gameState;
  }
  private set gameState(state: GameState) {
    this.state.gameState = state;
    this.broadcastService.emit('updateGameState', state);
  }
  private timer = new Timer(
    this.findAndDeclareRoundWinner.bind(this), 
    DEFAULT_ROUND_DURATION_SECONDS
  );

  // #region Exposed Actions
  public startGame() {
    if (this.state.players.length === 1) throw new Error('Cannot start game with only one player');

    this.gameState = 'deal';
  }
  public playCard(player: Player, cardIndex: number) {
    if (this.gameState !== 'play') throw new Error('Cannot play card when not in play state');

    const card = player.cards[cardIndex];
    player.activeCard = card;
    this.updatePlayer(player);
  }
  // #endregion

  // #region Player Actions
  protected addPlayer(username: string) {
    this.state.players = [
      ...this.state.players,
      {
        name: username,
        wins: [],
        activeCard: null,
        cards: [],
      }
    ];
  }
  protected updatePlayer(player: Player) {
    this.state.players = this.state.players.map(p => p.name === player.name ? player : p);

    if (this.state.players.every(p => p.activeCard)) {
      this.gameState = 'check';
    }
  }
  protected removePlayer(player: Player) {
    this.state.players = this.state.players.filter(p => p !== player);
  }
  // #endregion

  // #region Broadcast Event Handlers
  private _subscriptions: Array<Subscription> = [];
  private _registerBroadcastEvents(broadcastService: BroadcastService) {
    this._subscriptions = [
      broadcastService.on('finishGame', onFinishGame(this)),
      broadcastService.on('playCard', onPlayCard(this)),
      broadcastService.on('sendCard', onSendCard(this)),
      broadcastService.on('declareRoundWinner', onDeclareRoundWinner(this)),
      broadcastService.on('updateGameState', onUpdateGameState(this))
    ];
  }

  protected dealCards() {
    this.state.players = this.state.players.map(player => ({
      ...player,
      cards: this.cardService.generateCardDeck()
    }));

    this.gameState = 'play';
  }
  protected startNewRound() {
    this.state.players = this.state.players.map(player => ({
      ...player,
      activeCard: null
    }));

    this.timer.restart();
  }
  protected findAndDeclareRoundWinner() {
    const winner = this.state.players
      .sort((a, b) => {
        if (!a.activeCard || !b.activeCard) return 0;
        else if (!a.activeCard) return 1;
        else if (!b.activeCard) return -1;
        
        const winnerCard = this.cardService.determineWinner(a.activeCard, b.activeCard);
        return winnerCard === a.activeCard ? -1 : 1;
      })
      .shift() ?? null;

    this.state.lastWinner = winner;
    this.broadcastService.emit('declareRoundWinner', winner, winner?.activeCard ?? null);

    this.gameState = 'play';
  }
  // #endregion

  // #region Lifecycle Hooks
  public onInit() {
    this.addPlayer(this.userStore.state.username);
    this._registerBroadcastEvents(this.broadcastService);
  }
  public onDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
  // #endregion

  // #region Game Settings
  public setRoundTimer(seconds: number) {
    this.timer.setSeconds(seconds);
    return this;
  }
  public setCardDeckSize(size: number) {
    this.cardService.setDeckSize(size);
  }
  public setMaxCardValue(value: number) {
    this.cardService.setMaxCardValue(value);
  }
  // #endregion
}