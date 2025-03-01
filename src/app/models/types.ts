import { Card } from "@/services/CardService/CardService.types";

export type Player = {
  name: string;
  cards: Array<Card>;
  wins: Array<Card>;
  activeCard: Card | null;
};
