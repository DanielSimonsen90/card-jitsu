import { Component } from '@angular/core';
import { GameStore } from '@/stores';
import { BroadcastService, CardService, ElementalService } from '@/services/GameServices';
import { TimerService } from '@/services/TimerService';

@Component({
  standalone: true,
  providers: [
    GameStore,
    BroadcastService,
    CardService, 
    ElementalService,
    TimerService
  ],
  selector: 'app-game-provider',
  templateUrl: './game-provider.component.html'
})

export class GameProvider {}