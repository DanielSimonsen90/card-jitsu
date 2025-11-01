import { Card } from "@/services/CardService/CardService.types";

export type Player = {
  name: string;
  cards: Array<Card | null>;
  availableRedraws: number;  
  wins: Array<Card>;
  activeCard: Card | null;
  isAi: boolean;
  pfp: string;
};
