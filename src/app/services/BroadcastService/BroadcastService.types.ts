import { Player } from "@/models/types";
import { Card } from "../CardService/CardService.types";

export type GameState = 'idle' | 'deal' | 'play' | 'check' | 'finish';
export type WinState = 'win' | 'loss' | 'draw';
export type Broadcast = {
  updateGameState: [state: GameState];
  finishGame: [winner: Player | null];
  playCard: [player: Player, card: Card];
  declareRoundWinner: [state: WinState, winner: Player | null, card: Card | null];
  
  message: [message: string, time: Date];
};

export type BroadcastEventCallback<TEvent extends keyof Broadcast> = (...args: Broadcast[TEvent]) => void;