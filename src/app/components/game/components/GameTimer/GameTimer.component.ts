import { GameStore } from '@/stores';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'game-timer',
  templateUrl: 'GameTimer.component.html',
  styleUrl: 'GameTimer.component.scss',
  imports: [CommonModule],
})

export class GameTimerComponent {
  protected gameStore = inject(GameStore);
  
  public timeLeft$ = this.gameStore.timeLeft$;
}