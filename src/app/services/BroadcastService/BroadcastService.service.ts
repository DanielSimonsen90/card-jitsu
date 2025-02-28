import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { Broadcast, GameState } from "./BroadcastService.types";

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

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private readonly broadcast: Record<keyof Broadcast, Subject<any>> = {
    updateGameState: new Subject<GameState>(),
    finishGame: new Subject(),
    playCard: new Subject(),
    sendCard: new Subject(),
    declareRoundWinner: new Subject(),
    message: new Subject(),
  };

  public emit<TEvent extends keyof Broadcast>(key: TEvent, ...args: Broadcast[TEvent]) {
    const subject = this.broadcast[key];
    if (!subject) throw new Error(`Invalid key: ${key}`);
    subject.next(args);
  }

  public on<TEvent extends keyof Broadcast>(key: TEvent, callback: (...args: Broadcast[TEvent]) => void): Subscription {
    const subject = this.broadcast[key];
    if (!subject) throw new Error(`Invalid key: ${key}`);

    const observable = subject.asObservable();
    return observable.subscribe(args => callback(...args));
  }
}

export default BroadcastService;