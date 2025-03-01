import { GameStore, UserStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddAiButtonComponent } from "../AddAiButton/AddAiButton.component";
import { Player } from '@/models/types';

@Component({
  standalone: true,
  selector: 'playerlist',
  templateUrl: 'Playerlist.component.html',
  styleUrl: 'Playerlist.component.scss',
  imports: [
    CommonModule,
    AddAiButtonComponent
  ],
})

export class PlayerlistComponent {
  constructor(
    protected userStore: UserStore,
    protected gameStore: GameStore
  ) { }

  public get players() {
    return this.gameStore.state.players;
  }

  public removePlayer(player: Player) {
    const currentPlayer = this.gameStore.state.players.find(p => p.name === this.userStore.user.username);
    if (player === currentPlayer) return; // Can't remove yourself

    this.gameStore.removePlayer(player);
  }
}