import { GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  protected gameStore = inject(GameStore);

  public get deck(): Array<GameCard> {
    const player = this.gameStore.getCurrentPlayer();
    const cards = player?.cards ?? [];
    
    return cards.map(card => ({
      ...card,
      selected: (player?.activeCard === card) || false
    }));
  }
}