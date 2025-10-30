import { Player } from '@/models/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-entry',
  templateUrl: 'PlayerEntry.component.html',
  styleUrl: 'PlayerEntry.component.scss',
})

export class PlayerEntryComponent {
  @Input() public player!: Player;
}