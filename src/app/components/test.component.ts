import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import BroadcastService from '../services/BroadcastService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'test',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export default class TestComponent implements OnInit, OnDestroy {
  public message: string = '';
  private eventSubscription: Subscription | undefined;

  constructor(private _broadcastService: BroadcastService) {}

  ngOnInit(): void {
    this._broadcastService.init();
    this.eventSubscription = this._broadcastService.subscribe('message', (message, time) => {
      console.log(`[${time.toLocaleTimeString()}] ${message}`);
    })
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
  }

  public onSubmit() {
    const time = new Date();
    this._broadcastService.sendAction('send', this.message, time);
    this.message = '';
  }
}
