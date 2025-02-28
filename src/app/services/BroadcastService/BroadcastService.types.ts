import { Player } from "@/models/types";
import { Card } from "../CardService/CardService.types";

export type GameState = 'deal' | 'play' | 'check' | 'finish';
export type Broadcast = {
  updateGameState: [state: GameState];
  finishGame: [winner: Player];
  playCard: [player: Player, card: Card];
  sendCard: [player: Player, card: Card];
  declareRoundWinner: [winner: Player, card: Card];
  
  message: [message: string, time: Date];
};