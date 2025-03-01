import { SITE_NAME } from '@/constants';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'start-game-button',
  templateUrl: 'StartGameButton.component.html'
})

export default class StartGameButtonComponent {
  public SITE_NAME = SITE_NAME;
}