import { GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { GameCardComponent } from "../GameCard/GameCard.component";
import { Player } from '@/models/types';
import { PlayerEntryComponent } from '../PlayerEntry';
import { PlayerWinsComponent } from '../PlayerWins';

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

export class PlayerDeckComponent implements OnInit {
  @Input() public player: Player = undefined as any;
  @Input() public showContent: boolean = true;
  protected gameStore = inject(GameStore);

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

  public ngOnInit(): void {
    if (!this.player) {
      const currentPlayer = this.gameStore.getCurrentPlayer();
      if (!currentPlayer) throw new Error('No player provided and no current player found in GameStore.');

      this.player = currentPlayer;
    }
  }
}