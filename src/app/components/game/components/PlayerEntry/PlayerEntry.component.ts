import { Player } from '@/models/types';
import { UserStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';

@Component({
  selector: 'app-player-entry',
  templateUrl: 'PlayerEntry.component.html',
  styleUrl: 'PlayerEntry.component.scss',
  standalone: true,
  imports: [CommonModule]
})

export class PlayerEntryComponent {
  @Input() public player!: Player;

  public readonly userStore = inject(UserStore);

  public get user() {
    if (this.player.isAi) return null;
    return this.userStore.user;
  }

  public getPlayerImageSrc(): string {
    const folder = this.player.isAi ? 'mascots' : 'pfps';
    const extension = this.player.isAi ? 'webp' : 'png';
    // Convert display name (with spaces) to filename (with underscores)
    const filename = this.player.pfp.replace(/ /g, '_');
    const encodedPfp = encodeURIComponent(filename);
    return `/assets/${folder}/${encodedPfp}.${extension}`;
  }
}