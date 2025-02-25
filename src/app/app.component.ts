import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import BroadcastService from './services/BroadcastService';
import CardService from './services/CardService';
import ElementalService from './services/ElementalService';

import TestComponent from './components/test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BroadcastService, CardService, ElementalService],
})

export class AppComponent {
}
