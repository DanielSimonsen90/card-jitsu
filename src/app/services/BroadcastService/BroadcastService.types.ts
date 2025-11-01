import { Player } from "@/models/types";
import { Card } from "../CardService/CardService.types";
import { Settings } from "@/stores/SettingsStore/SettingsStore.types";

export type GameState = 'idle' | 'deal' | 'play' | 'check' | 'finish';
export type WinState = 'win' | 'loss' | 'draw';
type RedrawState = 'all' | 'winner' | 'losers';
export type Broadcast = {
  updateGameState: [state: GameState];
  finishGame: [winner: Player | null];
  playCard: [player: Player, card: Card];
  
  gainRedraw: [amount: number, winner: Player, state: RedrawState];
  redrawGained: [players: Array<Player>];
  redrawCard: [player: Player, cards: Array<Card>, redrawnCard: Card];
  
  declareRoundWinner: [state: WinState, winner: Player | null, card: Card | null];
  
  settingsChanged: [settings: Settings, changedKey: keyof Settings];
};

export type BroadcastEventCallback<TEvent extends keyof Broadcast> = (...args: Broadcast[TEvent]) => void;