import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { SITE_NAME } from '@/constants';
import { GameStore } from '@/stores';
import LoggerService from '@/services/LoggerService';
import { GameCard } from '@/services/CardService/CardService.types';

import { 
  PlayerlistComponent, PlayerWinsComponent, 
  GameTimerComponent, GameCardComponent, 
  PlayerDeckComponent 
} from '../game/components';
import { AutoSubscribeWithCallback } from '@/decorators';

const Logger = LoggerService.createComponentLogger('Main');

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrl: 'main.component.scss',
  imports: [
    CommonModule,
    PlayerlistComponent,

    PlayerWinsComponent, GameTimerComponent,
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

  public SITE_NAME = SITE_NAME;
  public get isActive() {
    return this.gameStore.isActive;
  }
  public get shouldShowActiveCardContent() {
    return (
      this.gameStore.state.gameState !== 'deal'
      && this.gameStore.state.gameState !== 'play'
    );
  }

  public get opponents() {
    return this.gameStore.state.players
      .filter(p => p !== this.currentPlayer);
  }
  public get currentPlayer() {
    const player = this.gameStore.getCurrentPlayer();
    if (player) return player;

    Logger.error('No current player', {
      getCurrentPlayerResult: player,
      players: this.gameStore.state.players,
      gameStore: this.gameStore,
    });
    throw new Error('No current player');
  }
  public get activeCards() {
    return this.gameStore.state.players
      // sort so currentPlayer is first in list
      .sort((a, b) => a === this.currentPlayer ? 1 : -1)
      // Only include players with active cards
      .filter(player => player.activeCard)
      // Map to Card to GameCard
      .map(player => ({
        ...player.activeCard,
        selected: true
      }) as GameCard);

  }

  public roundConclusionText: string | undefined = undefined;

  public ngOnInit(): void {
    this.gameStore.onInit();
  }
  public ngOnDestroy(): void {
    this.gameStore.onDestroy();
  }

  public onStartGameClicked() {
    this.gameStore.startGame();
  }
}