import { Injectable } from "@angular/core";
import ElementalService from "../ElementalService";
import { Card, Color, GameWins } from "./CardService.types";
import { ElementalType } from "../ElementalService/ElementalService.types";
import SettingsStore from "@/stores/SettingsStore/SettingsStore";
import { Broadcast } from "../BroadcastService/BroadcastService.types";
import BroadcastService from "../BroadcastService";

/**
 * CardService is in charge of generating and dealing cards for the players
 * Additionally, also responsible to determine which card wins a duel, by using the ElementalService
 * 
 * A card should:
 *  - Have a value between 1 and 20, usually based around the middle of the range
 *  - Have a type, which is one of the ElementalType values
 *  - Have a color, which is one of the Color values
 */

@Injectable()
export default class CardService {
  constructor(
    private readonly settingsStore: SettingsStore,
  ) {
    this.subscribeToRedrawEvents();
  }

  protected readonly colors: Array<Color> = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  protected readonly elementalService = new ElementalService();
  private readonly broadcastService = new BroadcastService();


  // #region Generate card
  public generateCardDeck(): Array<Card> {
    return Array.from(
      { length: this.settingsStore.deck.size }, 
      () => this.generateCard()
    );
  }

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
   * Redraws a card from a player's deck
   * @param card The card to redraw
   * @param cards The player's current cards
   * @returns The new set of cards with the redrawn card replaced
   */
  public redrawCard(card: Card, cards: Array<Card>): Array<Card> {
    const cardIndex = cards.indexOf(card);
    if (cardIndex === -1) throw new Error('RedrawService: Card to redraw not found in player cards');

    cards.splice(cardIndex, 1, this.generateCard());

    return cards;
  }

  /**
   * Generates a random value between 1 and 20
   */
  private generateValue(): number {
    const { minValue, maxValue } = this.settingsStore.cards;
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
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

  // #region Uility functions
  /**
   * Sort wins by elements in a map of element -> count. 
   * There must only be one of each color per element.
   * @param cards Cards to sort
   * @returns A map of unique elements with no duplicate colors
   */
  public getWinsFromCards(cards: Array<Card>): GameWins {
    const gameWins = cards.reduce((acc, card) => {
      const element = card.type;
      if (!acc[element]) acc[element] = [];
      else if (acc[element].includes(card.color)) return acc;

      acc[element].push(card.color);
      return acc;
    }, {} as GameWins)

    return this.elementalService.sortGameWinsByElementalType(gameWins);
  }

  public isSameCard(a: Card, b: Card): boolean {
    return (
      a.value === b.value &&
      a.type === b.type &&
      a.color === b.color
    )
  }

  private subscribeToRedrawEvents() {
    const { amountOfCards, gainMethod } = this.settingsStore.redraw;
    const eventName: keyof Broadcast | null = (() => {
      switch (gainMethod) {
        case 'end-of-round': return 'declareRoundWinner';
        case 'round-lost': return 'declareRoundWinner';
        case 'round-won': return 'declareRoundWinner';

        case 'end-of-game': return 'finishGame';
        case 'game-lost': return 'finishGame';
        case 'game-won': return 'finishGame';

        default: return null;
      }
    })();

    if (!eventName) throw new Error(`RedrawService: Unsupported gain method "${gainMethod}"`);

    this.broadcastService.on(eventName, (...args) => {
      const winner = eventName === 'declareRoundWinner' ? args[1] : eventName === 'finishGame' ? args[0] : undefined;
      if (!winner || typeof winner !== 'object') return;

      switch (gainMethod) {
        case 'end-of-round':
        case 'end-of-game': {
          this.broadcastService.emit('gainRedraw', amountOfCards, winner, 'all');
          break;
        }
        case 'round-lost':
        case 'game-lost': {
          this.broadcastService.emit('gainRedraw', amountOfCards, winner, 'losers');
          break;
        }
        case 'round-won':
        case 'game-won': {
          this.broadcastService.emit('gainRedraw', amountOfCards, winner, 'winner');
          break;
        }
        default: throw new Error(`RedrawService: Unsupported gain method "${gainMethod}"`);
      }
    });
  }
  // #endregion
}