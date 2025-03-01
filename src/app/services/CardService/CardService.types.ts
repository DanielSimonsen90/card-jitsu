import { ElementalType } from "../ElementalService/ElementalService.types";

export type Card = {
  value: number;
  type: ElementalType;
  color: Color;
};

export type GameCard = Card & {
  selected: boolean;
};

export type GameWins = Record<ElementalType, Array<Color>>;

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';