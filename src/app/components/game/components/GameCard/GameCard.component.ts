import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { Player } from '@/models/types';
import { AutoSubscribeWithCallback } from '@/decorators';

@Component({
  standalone: true,
  selector: 'gamecard',
  templateUrl: 'GameCard.component.html',
  styleUrl: 'GameCard.component.scss',
  imports: [CommonModule],
})

@AutoSubscribeWithCallback(GameCardComponent, 'declareRoundWinner', (component, state, winner) => {
  component.isWinner = winner?.name === component.player?.name;
})
export class GameCardComponent implements OnInit {
  @Input() public card: GameCard | null = null;
  @Input() public showContent: boolean = false;
  @Input() public showRedrawButton: boolean = false;
  @Output() public onRedraw = new EventEmitter<GameCard>();

  public isWinner = false;
  protected player: Player | null = null;

  protected gameStore = inject(GameStore);

  public ngOnInit() {
    const player = this.gameStore.getCurrentPlayer();
    if (!player) return;

    this.player = player;
  }

  public onClick() {
    if (!this.card || this.card.selected || !this.showContent || !this.player) return;
    this.gameStore.playCard(this.player, this.card);
  }

  public onRedrawClick(event: Event) {
    event.stopPropagation();
    if (this.card) this.onRedraw.emit(this.card);
  }
}