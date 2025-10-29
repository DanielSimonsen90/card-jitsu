import { Card } from "@/services/CardService/CardService.types";

export type Player = {
  name: string;
  cards: Array<Card | null>;
  wins: Array<Card>;
  activeCard: Card | null;
};
