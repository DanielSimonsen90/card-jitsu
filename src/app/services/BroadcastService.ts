/**
 * # BroadcastService
 * 
 * This service is in charge of emitting Game actions & events, such as:
 * * updateGameState => gameStateChanged: [state: GameState]
 * * finishGame => gameOver: [winner: Player]
 * * playCard => cardPlayed: [player: Player, card: Card]
 * * sendCard => cardRecieved: [player: Player, card: Card]
 * * declareRoundWinner => roundEnded: [winner: Player, card: Card]
 */

import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription } from "rxjs";
import { Broadcast, GameState } from "../models/types";

@Injectable({ providedIn: 'root' })
export default class BroadcastService {
  private readonly broadcast: Record<keyof Broadcast, Record<string, Subject<any>>> = {
    actions: {
      updateGameState: new Subject(),
      finishGame: new Subject(),
      playCard: new Subject(),
      sendCard: new Subject(),
      declareRoundWinner: new Subject(),
      send: new Subject()
    },
    events: {
      gameStateChanged: new Subject(),
      gameOver: new Subject(),
      cardPlayed: new Subject(),
      cardRecieved: new Subject(),
      roundEnded: new Subject(),
      message: new Subject()
    }
  };

  private readonly actions = this.broadcast.actions;
  private readonly events = this.broadcast.events;

  init() {
    this.subscribe('send', (message, time) => {
      this.emitEvent('message', message, time);
    });
  }

  public getObservable<TAction extends keyof Broadcast['actions']>(action: TAction): Observable<Broadcast['actions'][TAction]>;
  public getObservable<TEvent extends keyof Broadcast['events']>(event: TEvent): Observable<Broadcast['events'][TEvent]>;
  public getObservable<TAction extends keyof Broadcast['actions'] | keyof Broadcast['events']>(key: TAction) {
    const subject = key in this.broadcast.actions ? this.broadcast.actions[key] : this.broadcast.events[key];
    if (!subject) throw new Error(`Invalid key: ${key}`);
    return subject.asObservable();
  }

  public sendAction<TAction extends keyof Broadcast['actions']>(action: TAction, ...args: Broadcast['actions'][TAction]): void {
    this.broadcast.actions[action].next(args);
  }

  public emitEvent<TEvent extends keyof Broadcast['events']>(event: TEvent, ...args: Broadcast['events'][TEvent]): void {
    this.broadcast.events[event].next(args);
  }

  public subscribe<TAction extends keyof Broadcast['actions']>(action: TAction, callback: (...args: Broadcast['actions'][TAction]) => void): Subscription;
  public subscribe<TEvent extends keyof Broadcast['events']>(event: TEvent, callback: (...args: Broadcast['events'][TEvent]) => void): Subscription;
  public subscribe<TAction extends keyof (Broadcast['actions'] | keyof Broadcast['events'])>(key: TAction, callback: (...args: any[]) => void): Subscription {
    const observable = this.getObservable(key);
    return observable.subscribe((args: Array<any>) => callback(...args));
  }
}