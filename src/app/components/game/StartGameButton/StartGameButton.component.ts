import { SITE_NAME } from '@/constants';
import { GameStore } from '@/stores';
import { Component, inject } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'start-game-button',
  templateUrl: 'StartGameButton.component.html'
})

export class StartGameButtonComponent {
  private _gameStore = inject(GameStore);
  public SITE_NAME = SITE_NAME;

  public onClick() {
    try {
      this._gameStore.startGame();
    } catch (error) {
      alert((error as Error).message);
    }
  }
}