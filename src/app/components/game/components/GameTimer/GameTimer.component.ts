import { GameStore } from '@/stores';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'game-timer',
  templateUrl: 'GameTimer.component.html',
  styleUrl: 'GameTimer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})

export class GameTimerComponent implements OnInit, OnDestroy {
  protected gameStore = inject(GameStore);
  protected interval: NodeJS.Timeout | null = null;
  protected updateGameStateSubscription: Subscription | null = null;
  protected changeDetectorRef = inject(ChangeDetectorRef);

  public get timeLeftOfRound() {
    return this.gameStore.timeLeftOfRound;
  }

  protected startInterval() {
    this.stopInterval(); // Prevent multiple intervals

    this.interval = setInterval(() => {
      this.changeDetectorRef.markForCheck();
    }, 1000);
  }

  protected stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public ngOnInit() {
    this.updateGameStateSubscription = this.gameStore.on('updateGameState', state => {
      switch (state) {
        case 'play': {
          this.startInterval();
          break;
        }
        case 'finish': case 'check': {
          this.stopInterval();
          break;
        }
      }
    })
  }

  public ngOnDestroy() {
    this.stopInterval();
    this.updateGameStateSubscription?.unsubscribe();
  }
}