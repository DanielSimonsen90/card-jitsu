import { BroadcastService, CardService, ElementalService } from '@/services/GameServices';
import { GameStore } from '@/stores';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AddAiButtonComponent, PlayerlistComponent, StartGameButtonComponent } from '../game';
import { CommonModule } from '@angular/common';
import { PlayerDeckComponent } from "../game/PlayerDeck/PlayerDeck.component";

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
    PlayerlistComponent,
    StartGameButtonComponent,
    PlayerDeckComponent
],
})

export class MainComponent implements OnInit, OnDestroy {
  protected gameStore = inject(GameStore);

  public get isActive() {
    return this.gameStore.isActive;
  }

  public ngOnInit(): void {
    this.gameStore.onInit();
  }
  public ngOnDestroy(): void {
    this.gameStore.onDestroy();
  }
}