import { BroadcastService, CardService, ElementalService } from '@/services/GameServices';
import { GameStore } from '@/stores';
import { Component, inject } from '@angular/core';
import StartGameButtonComponent from '../game';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrl: 'main.component.scss',
  providers: [
    BroadcastService, CardService, ElementalService,
    GameStore
  ],
  imports: [
    CommonModule,
    StartGameButtonComponent
  ],
})

export class MainComponent {
  protected gameStore = inject(GameStore);

  public get isActive() {
    return this.gameStore.isActive;
  }

  public onStartGameClick() {
    this.gameStore.startGame();
  }
}