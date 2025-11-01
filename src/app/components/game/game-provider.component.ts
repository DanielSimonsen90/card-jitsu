import { Component } from '@angular/core';
import { GameStore } from '@/stores';
import { CardService } from '@/services/GameServices';

@Component({
  standalone: true,
  providers: [
    GameStore,
    CardService, 
  ],
  selector: 'app-game-provider',
  templateUrl: './game-provider.component.html'
})

export class GameProvider {}