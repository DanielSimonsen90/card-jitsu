import { Injectable } from "@angular/core";
import ElementalService from "../ElementalService";
import { Card, Color } from "./CardService.types";
import { ElementalType } from "../ElementalService/ElementalService.types";

/**
 * CardService is in charge of generating and dealing cards for the players
 * Additionally, also responsible to determine which card wins a duel, by using the ElementalService
 * 
 * A card should:
 *  - Have a value between 1 and 20, usually based around the middle of the range
 *  - Have a type, which is one of the ElementalType values
 *  - Have a color, which is one of the Color values
 */

@Injectable({ providedIn: 'root' })
export default class CardService {
  constructor(
    private readonly elementalService: ElementalService
  ) {}

  private readonly colors: Array<Color> = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

  // #region Generate card
  /**
   * Generates a random card
   */
  public generateCard(): Card {
    return {
      value: this.generateValue(),
      type: this.generateType(),
      color: this.generateColor()
    };
  }

  /**
   * Generates a random value between 1 and 20
   */
  private generateValue(): number {
    const randomNumber = () => Math.floor(Math.random() * 20) + 1;
    const values = Array.from({ length: 5 }, randomNumber);
    const result = values.reduce((acc, value) => acc + value, 0) / values.length;
    return Math.round(result);
  }

  /**
   * Generates a random type
   */
  private generateType(): ElementalType {
    return this.elementalService.getRandomType();
  }

  /**
   * Generates a random color
   */
  private generateColor(): Color {
    return this.colors.random();
  }

  // #endregion

  // #region Determine winner
  /**
   * Determines which card wins a duel
   * A card is a winner determined by the Order of precedence:
   * - Elemental type (fire > ice > water)
   * - Value
   * 
   * @param card1 The first card
   * @param card2 The second card
   * @returns The winning card
   */
  public determineWinner(a: Card, b: Card): Card | undefined {
    // If elemental types are identical AND values are identical, it's a draw
    if (a.type === b.type && a.value === b.value) return undefined;

    // If elemental types are identical, the card with the highest value wins
    if (a.type === b.type) return this.determineWinnerByValue(a, b);

    // If elemental types are different, the card with the highest elemental precedence wins
    return this.determineWinnerByElementalType(a, b);
  }

  private determineWinnerByValue(a: Card, b: Card): Card {
    return a.value > b.value ? a : b;
  }
  private determineWinnerByElementalType(a: Card, b: Card): Card {
    return this.elementalService.getHighestPrecedence(a.type, b.type) === a.type ? a : b;
  }

  // #endregion
}