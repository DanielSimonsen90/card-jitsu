import { Component, Input } from '@angular/core';
import { GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { Player } from '@/models/types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'gamecard',
  templateUrl: 'GameCard.component.html',
  styleUrl: 'GameCard.component.scss',
  imports: [
    CommonModule
  ],
})

export class GameCardComponent {
  @Input() public card!: GameCard;
  @Input() public showContent: boolean = false;

  public isWinner = false;
  protected player: Player;

  constructor(
    protected gameStore: GameStore
  ) {
    const player = this.gameStore.getCurrentPlayer();
    if (player) this.player = player;
    else throw new Error('Current player not found');

    gameStore.on('declareRoundWinner', (state, winner) => {
      this.isWinner = winner?.name === this.player.name;
    })
  }

  public onClick() {
    if (this.card.selected || !this.showContent) return;
    this.gameStore.playCard(this.player, this.card);
  }
}