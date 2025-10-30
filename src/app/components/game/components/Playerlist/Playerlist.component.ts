import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Player } from '@/models/types';
import { PlayerEntryComponent } from '../PlayerEntry';

@Component({
  standalone: true,
  selector: 'playerlist',
  templateUrl: 'Playerlist.component.html',
  styleUrl: 'Playerlist.component.scss',
  imports: [CommonModule, PlayerEntryComponent],
})

export class PlayerlistComponent {
  protected gameStore = inject(GameStore);

  public get players() {
    return this.gameStore.state.players;
  }

  public removePlayer(player: Player) {
    const currentPlayer = this.gameStore.getCurrentPlayer();
    if (player === currentPlayer) return; // Can't remove yourself

    this.gameStore.removePlayer(player);
  }
  public onAddAiPlayerClicked() {
    this.gameStore.addAiPlayer();
  }
}