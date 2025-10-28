
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Timer from "./Timer";
import { TimerCallback } from "./Timer.types";

/**
 * # Timer Service
 * 
 * This service is responsible for managing the game timer.
 * Through public functions like `startTimer` and `stopTimer`, the timer can be controlled.
 * Additionally, provides an observable stream of time updates.
 */
@Injectable()
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  private interval: any = null;
  private callbacks: TimerCallback[] = [];
  
  public timeLeft$: Observable<number> = this.timerSubject.asObservable();
  
  public get timeLeft(): number {
    return this.timerSubject.value;
  }
  
  public startTimer(seconds: number, callback?: TimerCallback): void {
    this.stopTimer();
    
    if (callback) this.callbacks.push(callback);
    
    let timeLeft = seconds;
    this.timerSubject.next(timeLeft);
    
    this.interval = setInterval(() => {
      timeLeft--;
      this.timerSubject.next(timeLeft);
      
      if (timeLeft <= 0) {
        this.stopTimer();
        this.onTimerComplete();
      }
    }, 1000);
  }
  
  public stopTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  public addCallback(callback: TimerCallback): void {
    this.callbacks.push(callback);
  }
  
  private onTimerComplete(): void {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Timer callback error:', error);
      }
    });
    
    this.callbacks = [];
  }
  
  // Legacy static method for backwards compatibility
  public static createTimer(callback?: TimerCallback, seconds?: number) {
    return new Timer(callback, seconds);
  }
}