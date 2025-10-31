import { StorageService } from "@/services/StorageService";
import BaseStore from "../BaseStore";
import { DeckLocation, RedrawGainMethod, Settings } from "./SettingsStore.types";
import DEFAULT_SETTINGS from "./DefaultSettings";

type State = {
  settings: Settings
};

export default class SettingsStore extends BaseStore<State> {
  constructor(
    storageService: StorageService
  ) {
    super(storageService, 'Settings');
  }

  // #region Cards
  public get cards(): Settings['cards'] {
    return this.__state.settings.cards;
  }
  public set cards(value: Partial<Settings['cards']>) {
    for (const [key, cardValue] of Object.entries(value)) {
      if (isNaN(cardValue) || !Number.isInteger(cardValue)) throw new Error(`Card ${key} must be a whole number`);
      if (cardValue < 0 || cardValue >= Infinity) throw new Error(`Card ${key} must be a positive number`);
    }

    const min = value.minValue ?? this.cards.minValue ?? DEFAULT_SETTINGS.cards.minValue;
    const max = value.maxValue ?? this.cards.maxValue ?? DEFAULT_SETTINGS.cards.maxValue;
    if (min >= max) throw new Error('Card min value must be less than max value');
    else if (max <= min) throw new Error('Card max value must be greater than min value');

    this.__state.settings.cards = {
      ...this.__state.settings.cards,
      ...value
    };

    this.save();
  }
  // #endregion

  // #region Deck
  public get deck(): Settings['deck'] {
    return this.__state.settings.deck;
  }
  public set deck(value: Partial<Settings['deck']>) {
    // Handle size
    if (value.size !== undefined) {
      if (isNaN(value.size) || !Number.isInteger(value.size)) throw new Error('Deck size must be a whole number');
      if (value.size < 1 || value.size >= Infinity) throw new Error('Deck size must be a positive number');
    }

    // handle locationPreference
    if (value.locationPreference !== undefined) {
      const validLocations: Array<DeckLocation> = ['top', 'bottom'];
      if (!validLocations.includes(value.locationPreference)) throw new Error(`Deck location preference must be one of: ${validLocations.join(', ')}`);
    }

    this.__state.settings.deck = {
      ...this.__state.settings.deck,
      ...value
    };
    
    this.save();
  }
  // #endregion

  // #region Redraw
  public get redraw(): Settings['redraw'] {
    return this.__state.settings.redraw;
  }

  public set redraw(value: Partial<Settings['redraw']>) {
    // Handle amountOfCards
    if (value.amountOfCards !== undefined) {
      if (isNaN(value.amountOfCards) || !Number.isInteger(value.amountOfCards)) throw new Error('Redraw amount of cards must be a whole number');
      if (value.amountOfCards < 0 || value.amountOfCards >= Infinity) throw new Error('Redraw amount of cards must be a positive number');
    }

    // handle gainMethod
    if (value.gainMethod !== undefined) {
      const validMethods: Array<RedrawGainMethod> = [
        'end-of-round', 'end-of-game',
        'round-won', 'game-won',
        'round-lost', 'game-lost'
      ];
      if (!validMethods.includes(value.gainMethod)) throw new Error(`Redraw gain method must be one of: ${validMethods.join(', ')}`);
    }

    this.__state.settings.redraw = {
      ...this.__state.settings.redraw,
      ...value
    };

    this.save();
  }
  // #endregion

  // #region Round Timer
  public get roundTimerSeconds(): Settings['roundTimerSeconds'] {
    return this.__state.settings.roundTimerSeconds;
  }

  public set roundTimerSeconds(value: Settings['roundTimerSeconds']) {
    if (isNaN(value) || !Number.isInteger(value)) throw new Error('Round timer seconds must be a whole number');
    if (value < 5 || value >= Infinity) throw new Error('Round timer seconds must be a positive number');
    
    this.__state.settings.roundTimerSeconds = value;

    this.save();
  }
}