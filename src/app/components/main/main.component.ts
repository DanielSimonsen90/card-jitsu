import { BroadcastService, CardService, ElementalService } from '@/services/GameServices';
import { GameStore } from '@/stores';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PlayerlistComponent, StartGameButtonComponent } from '../game';
import { CommonModule } from '@angular/common';
import { PlayerDeckComponent } from "../game/PlayerDeck/PlayerDeck.component";
import { GameCardComponent } from "../game/GameCard/GameCard.component";
import { GameCard } from '@/services/CardService/CardService.types';
import { PlayerWinsComponent } from "../game/PlayerWins/PlayerWins.component";
import { GameTimerComponent } from "../game/GameTimer/GameTimer.component";
import LoggerService from '@/services/LoggerService';

const Logger = LoggerService.createComponentLogger('Main')

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrl: 'main.component.scss',
  providers: [
    BroadcastService, CardService, ElementalService,
    GameStore
  ],
  imports: [
    CommonModule,
    PlayerlistComponent, StartGameButtonComponent,

    PlayerWinsComponent, GameTimerComponent,
    GameCardComponent, PlayerDeckComponent,
  ],
})

export class MainComponent implements OnInit, OnDestroy {
  protected gameStore = inject(GameStore);

  public get isActive() {
    return this.gameStore.isActive;
  }
  public get shouldShowActiveCardContent() {
    return this.gameStore.state.gameState === 'check';
  }

  public get opponents() {
    return this.gameStore.state.players
      .filter(p => p !== this.currentPlayer);
  }
  public get currentPlayer() {
    const player = this.gameStore.getCurrentPlayer();
    if (!player) {
      Logger.error('No current player', {
        getCurrentPlayerResult: player,
        players: this.gameStore.state.players,
        gameStore: this.gameStore,
      });
      throw new Error('No current player');
    }
    return player;
  }
  public get activeCards() {
    return this.gameStore.state.players
      // sort so currentPlayer is last in list
      .sort((a, b) => a === this.currentPlayer ? 1 : -1)
      // Only include players with active cards
      .filter(player => player.activeCard)
      // Map to Card to GameCard
      .map(player => ({
        ...player.activeCard,
        selected: true
      }) as GameCard);

  }

  public ngOnInit(): void {
    this.gameStore.onInit();
  }
  public ngOnDestroy(): void {
    this.gameStore.onDestroy();
  }
}