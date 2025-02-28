import { Injectable } from "@angular/core";
import { ElementalType } from "./ElementalService.types";

/**
 * ElementalService is in charge of determining which elemental type wins a duel
 * It is responsible for:
 * - Determining which elemental type wins a duel
 * - Providing a valid elemental type to be used in the game
 */
@Injectable({ providedIn: 'root' })
export class ElementalService {
  private readonly types: Array<ElementalType> = ['fire', 'water', 'ice'];

  /**
   * Determines which elemental type wins a duel
   * A type is a winner determined by the Order of precedence:
   * - Fire wins against Ice
   * - Ice wins against Water
   * - Water wins against Fire
   * 
   * @param a The first type
   * @param b The second type
   * @returns The winning type
   */
  public getHighestPrecedence(a: ElementalType, b: ElementalType): ElementalType {
    switch (a) {
      case 'fire':
        switch (b) {
          case 'water': return b;
          case 'ice': return a;
        }
        break;
      case 'water':
        switch (b) {
          case 'fire': return a;
          case 'ice': return b;
        }
        break;
      case 'ice':
        switch (b) {
          case 'fire': return b;
          case 'water': return a;
        }
        break;
    }

    return a;
  }

  /**
   * Provides a random type
   */
  public getRandomType(): ElementalType {
    return this.types.random();
  }
}

export default ElementalService;