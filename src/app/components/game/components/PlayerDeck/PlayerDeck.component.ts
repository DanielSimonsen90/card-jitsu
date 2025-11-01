import { Card, GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { GameCardComponent } from "../GameCard/GameCard.component";
import { Player } from '@/models/types';
import { PlayerEntryComponent } from '../PlayerEntry';
import { PlayerWinsComponent } from '../PlayerWins';
import { StoreState } from '@/decorators';

type State = {
  redrawMode: boolean;
}

@Component({
  standalone: true,
  selector: 'player-deck',
  templateUrl: 'PlayerDeck.component.html',
  styleUrl: 'PlayerDeck.component.scss',
  imports: [
    CommonModule,
    GameCardComponent,
    PlayerEntryComponent,
    PlayerWinsComponent
  ],
})
@StoreState<State>({
  redrawMode: false
})
export class PlayerDeckComponent implements OnInit {
  @Input() public player: Player = undefined as any;
  @Input() public showContent: boolean = true;

  protected gameStore = inject(GameStore);
  protected __state: State = {
    redrawMode: false
  }

  public get deck(): Array<GameCard | null> {
    const player = this.player ?? this.gameStore.getCurrentPlayer();
    const cards = player?.cards ?? [];
    
    return cards.map(card => card === null ? card : ({
      ...card,
      selected: (player?.activeCard === card) || false
    }));
  }
  public get isOpponent(): boolean {
    const currentPlayer = this.gameStore.getCurrentPlayer();
    if (!currentPlayer) return false;

    return this.player.name !== currentPlayer.name;
  }

  public get redraws(): number {
    const player = this.player ?? this.gameStore.getCurrentPlayer();
    return player?.availableRedraws ?? 0;
  }

  public onRedrawToggle(): void {
    this.__state.redrawMode = !this.__state.redrawMode;
  }
  public onRequestRedraw(card: Card): void {
    this.onRedrawToggle();
    this.gameStore.redraw(this.player, card);
  }

  public ngOnInit(): void {
    if (!this.player) {
      const currentPlayer = this.gameStore.getCurrentPlayer();
      if (!currentPlayer) throw new Error('No player provided and no current player found in GameStore.');

      this.player = currentPlayer;
    }
  }
}