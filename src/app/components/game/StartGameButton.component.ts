import { SITE_NAME } from '@/constants';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'start-game-button',
  templateUrl: 'StartGameButton.component.html'
})

export default class StartGameButtonComponent {
  public SITE_NAME = SITE_NAME;

  @Output() click = new EventEmitter<void>();

  public onClick() {
    this.click.emit();
  }
}