import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { Broadcast, BroadcastEventCallback, GameState } from "./BroadcastService.types";
import LoggerService from "../LoggerService";

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
  private readonly logger = LoggerService.createLogger('BroadcastService');
  private readonly broadcast: Record<keyof Broadcast, Subject<any>> = {
    updateGameState: new Subject<GameState>(),
    finishGame: new Subject(),
    playCard: new Subject(),
    gainRedraw: new Subject(),
    redrawGained: new Subject(),
    redrawCard: new Subject(),
    declareRoundWinner: new Subject(),
    settingsChanged: new Subject(),
  };

  public emit<TEvent extends keyof Broadcast>(key: TEvent, ...args: Broadcast[TEvent]) {
    // this.logger.info('emit', key, args);
    const subject = this.broadcast[key];
    if (!subject) throw new Error(`Invalid key: ${key}`);
    subject.next(args);
  }

  public on<TEvent extends keyof Broadcast>(key: TEvent, callback: BroadcastEventCallback<TEvent>): Subscription {
    // if (key !== 'declareRoundWinner') this.logger.info('on', key, { callback });
    const subject = this.broadcast[key];
    if (!subject) throw new Error(`Invalid key: ${key}`);

    const observable = subject.asObservable();
    return observable.subscribe(args => callback(...args));
  }
}

export default BroadcastService;