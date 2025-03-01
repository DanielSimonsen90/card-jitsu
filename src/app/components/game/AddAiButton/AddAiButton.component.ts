import { GameStore } from '@/stores';
import { Component, inject } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'add-ai-button',
  templateUrl: 'AddAiButton.component.html'
})

export class AddAiButtonComponent {
  private _gameStore = inject(GameStore);

  public onClick() {
    this._gameStore.addAiPlayer();
  }
}