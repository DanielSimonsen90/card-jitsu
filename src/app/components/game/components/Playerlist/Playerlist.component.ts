import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Player } from '@/models/types';
import { PlayerEntryComponent } from '../PlayerEntry';
import { ModalComponent } from '@/components/shared/modal';
import { SettingsContentComponent } from './components/SettingsContent';

@Component({
  standalone: true,
  selector: 'playerlist',
  templateUrl: 'Playerlist.component.html',
  styleUrl: 'Playerlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PlayerEntryComponent, ModalComponent, SettingsContentComponent],
})

export class PlayerlistComponent {
  protected gameStore = inject(GameStore);
  public isSettingsModalOpen = false;
  
  public get players() {
    return this.gameStore.players;
  }

  public removePlayer(player: Player) {
    const currentPlayer = this.gameStore.getCurrentPlayer();
    if (player === currentPlayer) return; // Can't remove yourself

    this.gameStore.removePlayer(player);
  }
  
  public onAddAiPlayerClicked() {
    this.gameStore.addAiPlayer();
  }
  
  public onOpenSettingsClicked() {
    this.isSettingsModalOpen = true;
  }
  
  public onCloseSettingsModal() {
    this.isSettingsModalOpen = false;
  }

  trackByPlayer = (index: number, player: Player) => player.name;
}