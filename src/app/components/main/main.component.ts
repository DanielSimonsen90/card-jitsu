import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';

import { SITE_NAME } from '@/constants';
import { GameStore, SettingsStore } from '@/stores';
import LoggerService from '@/services/LoggerService';
import { Card, GameCard } from '@/services/CardService/CardService.types';

import { 
  PlayerlistComponent, 
  GameTimerComponent, GameCardComponent, 
  PlayerDeckComponent 
} from '../game/components';
import { ReadmeDisplayComponent } from '../shared/readme-display';
import { AutoSubscribeWithCallback } from '@/decorators';
import { Player } from '@/models/types';

const Logger = LoggerService.createComponentLogger('Main');

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrl: 'main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PlayerlistComponent,
    ReadmeDisplayComponent,

    GameTimerComponent,
    GameCardComponent, PlayerDeckComponent,
  ],
})

@AutoSubscribeWithCallback(MainComponent, 'declareRoundWinner', (component, state) => {
  component.roundConclusionText = `${state.substring(0, 1).toUpperCase()}${state.substring(1)}!`;
})
@AutoSubscribeWithCallback(MainComponent, 'updateGameState', (component, state) => {
  if (state === 'play') component.roundConclusionText = undefined;
})
@AutoSubscribeWithCallback(MainComponent, 'finishGame', (component, winner) => {
  component.roundConclusionText = winner
    ? `${winner.name} wins!`
    : `It's a tie!`;
})
export class MainComponent implements OnInit, OnDestroy {
  protected gameStore = inject(GameStore);
  protected settingsStore = inject(SettingsStore);

  public SITE_NAME = SITE_NAME;
  public get isActive() {
    return this.gameStore.isActive;
  }
  public get shouldShowActiveCardContent() {
    return (
      this.gameStore.gameState !== 'deal'
      && this.gameStore.gameState !== 'play'
    );
  }

  public get currentPlayer() { return this._currentPlayer(); }
  private _currentPlayer = computed(() => {
    const player = this.gameStore.getCurrentPlayer();
    if (player) return player;

    Logger.error('No current player', {
      getCurrentPlayerResult: player,
      players: this.gameStore.players,
      gameStore: this.gameStore,
    });
    throw new Error('No current player');
  });

  public get opponents() { return this._opponents(); }
  private _opponents = computed(() => {
    return this.gameStore.players
      .filter(p => p !== this._currentPlayer());
  });

  public get activeCards() { return this._activeCards(); }
  private _activeCards = computed(() => {
    const preferFirst = this.settingsStore.deck.locationPreference === 'top';
    const currentPlayer = this._currentPlayer();

    return this.gameStore.players
      // sort so currentPlayer is first in list
      .sort((a, b) => a === currentPlayer && preferFirst ? -1 : b === currentPlayer && !preferFirst ? -1 : 1)
      // Only include players with active cards
      .filter(player => player.activeCard)
      // Map to Card to GameCard
      .map(player => ({
        ...player.activeCard,
        selected: true
      }) as GameCard);
  });

  public roundConclusionText: string | undefined = undefined;

  public ngOnInit(): void {
    this.gameStore.onInit();
    this.settingsStore.load();
  }
  public ngOnDestroy(): void {
    this.gameStore.onDestroy();
  }

  public onStartGameClicked() {
    this.gameStore.startGame();
  }

  // TrackBy functions for performance
  trackByPlayer = (index: number, player: Player) => player.name || index;
  trackByCard = (index: number, card: Card) => card ? `${card.type}-${card.value}-${card.color}` : index;
}