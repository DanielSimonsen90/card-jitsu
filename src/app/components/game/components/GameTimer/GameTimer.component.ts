import { GameStore } from '@/stores';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'game-timer',
  templateUrl: 'GameTimer.component.html',
  styleUrl: 'GameTimer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})

export class GameTimerComponent {
  protected gameStore = inject(GameStore);
  
  public timeLeft$ = this.gameStore.timeLeft$;
}