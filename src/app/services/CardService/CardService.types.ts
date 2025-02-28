import { ElementalType } from "../ElementalService/ElementalService.types";

export type Card = {
  value: number;
  type: ElementalType;
  color: Color;
};

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';