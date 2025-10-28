import { GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GameCardComponent } from "../GameCard/GameCard.component";

@Component({
  standalone: true,
  selector: 'player-deck',
  templateUrl: 'PlayerDeck.component.html',
  styleUrl: 'PlayerDeck.component.scss',
  imports: [
    CommonModule,
    GameCardComponent
  ],
})

export class PlayerDeckComponent {
  constructor(
    protected gameStore: GameStore
  ) { }

  public get deck(): Array<GameCard> {
    const cards = this.gameStore.getCurrentPlayer()?.cards ?? [];

    return cards.map(card => ({
      ...card,
      selected: (this.gameStore.getCurrentPlayer()?.activeCard === card) || false
    }));
  }
}