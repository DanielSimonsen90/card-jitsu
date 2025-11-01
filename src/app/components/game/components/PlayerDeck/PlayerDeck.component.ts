import { Card, GameCard } from '@/services/CardService/CardService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GameCardComponent } from "../GameCard/GameCard.component";
import { Player } from '@/models/types';
import { PlayerEntryComponent } from '../PlayerEntry';
import { PlayerWinsComponent } from '../PlayerWins';
import { StoreState } from '@/decorators';
import BroadcastService from '@/services/BroadcastService';
import { Subscription } from 'rxjs';

type State = {
  redrawMode: boolean;
};

@Component({
  standalone: true,
  selector: 'player-deck',
  templateUrl: 'PlayerDeck.component.html',
  styleUrl: 'PlayerDeck.component.scss',
  imports: [
    CommonModule,
    GameCardComponent,
    PlayerEntryComponent,
    PlayerWinsComponent
  ],
})
@StoreState<State>({
  redrawMode: false
})
export class PlayerDeckComponent implements OnInit, OnDestroy {
  @Input() public player: Player = undefined as any;
  @Input() public showContent: boolean = true;

  protected gameStore = inject(GameStore);
  protected broadcastService = inject(BroadcastService);
  protected cdr = inject(ChangeDetectorRef);

  protected __state: State = {
    redrawMode: false
  };

  private subscriptions: Array<Subscription> = [];

  public get deck(): Array<GameCard | null> {
    const player = this.player ?? this.gameStore.getCurrentPlayer();
    const cards = player?.cards ?? [];

    return cards.map(card => card === null ? card : ({
      ...card,
      selected: (player?.activeCard === card) || false
    }));
  }
  public get isOpponent(): boolean {
    const currentPlayer = this.gameStore.getCurrentPlayer();
    if (!currentPlayer) return false;

    return this.player.name !== currentPlayer.name;
  }

  public get redraws(): number {
    const player = this.player ?? this.gameStore.getCurrentPlayer();
    return player?.availableRedraws ?? 0;
  }

  public onRedrawToggle(): void {
    this.__state.redrawMode = !this.__state.redrawMode;
  }
  public onRequestRedraw(card: Card): void {
    this.onRedrawToggle();
    this.gameStore.redraw(this.player, card);
  }

  public ngOnInit(): void {
    if (!this.player) {
      const currentPlayer = this.gameStore.getCurrentPlayer();
      if (!currentPlayer) throw new Error('No player provided and no current player found in GameStore.');

      this.player = currentPlayer;
    }

    this.subscriptions = [
      this.broadcastService.on('redrawGained', players => {
        const updatedPlayer = players.find(p => p.name === this.player.name);
        if (updatedPlayer) {
          this.player = updatedPlayer;
          // this.cdr.markForCheck();
        }
      }),
      this.broadcastService.on('redrawCard', (player, cards) => {
        if (player.name !== this.player.name) return;
        this.player = player;
      })
    ];
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}