import { Player } from '@/models/types';
import CardService from '@/services/CardService';
import { ElementalType } from '@/services/ElementalService/ElementalService.types';
import { GameStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'player-wins',
  templateUrl: 'PlayerWins.component.html',
  styleUrl: 'PlayerWins.component.scss',
  imports: [
    CommonModule
  ],
})
export class PlayerWinsComponent {
  @Input() public player!: Player;

  constructor(
    protected gameStore: GameStore,
    protected cardService: CardService
  ) { }

  public get wins() {
    return this.cardService.getWinsFromCards(this.player.wins);
  }

  public get elementalTypes(): Array<ElementalType> {
    return Object.keys(this.wins) as Array<ElementalType>;
  }
}