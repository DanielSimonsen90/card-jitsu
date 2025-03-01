import { BroadcastService, CardService, ElementalService } from '@/services/GameServices';
import { GameStore } from '@/stores/GameStore/GameStore';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrl: 'main.component.scss',
  providers: [
    BroadcastService, CardService, ElementalService,
    GameStore
  ]
})

export class MainComponent {
  
}