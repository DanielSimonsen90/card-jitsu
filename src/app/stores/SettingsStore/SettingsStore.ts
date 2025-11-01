import { StorageService } from "@/services/StorageService";
import { ValidationService } from "@/services/ValidationService";
import BroadcastService from "@/services/BroadcastService";
import BaseStore from "../BaseStore";
import { DeckLocation, RedrawGainMethod, Settings } from "./SettingsStore.types";
import DEFAULT_SETTINGS from "./DefaultSettings";
import { Injectable } from "@angular/core";
import { StoreState } from "@/decorators";

type State = {
  settings: Settings;
};

@Injectable({ providedIn: 'root' })
@StoreState<State>({
  settings: DEFAULT_SETTINGS
})
export default class SettingsStore extends BaseStore<State> {
  constructor(
    storageService: StorageService,
    protected broadcastService: BroadcastService,
  ) {
    super(storageService, 'Settings');
  }

  // #region Cards
  public get cards(): Settings['cards'] {
    return this.__state.settings.cards;
  }
  public set cards(value: Partial<Settings['cards']>) {
    this.updatePartialSetting('cards', value, () => {
      // Validate individual card values
      for (const [key, cardValue] of Object.entries(value)) {
        ValidationService.validateWholePositiveNumber(cardValue, `Card ${key}`);
      }

      // Validate min/max range
      const min = value.minValue ?? this.cards.minValue ?? DEFAULT_SETTINGS.cards.minValue;
      const max = value.maxValue ?? this.cards.maxValue ?? DEFAULT_SETTINGS.cards.maxValue;
      ValidationService.throwIfInvalidMinMaxRange(min, max, 'Card min value', 'Card max value');
    });
  }
  // #endregion

  // #region Deck
  public get deck(): Settings['deck'] {
    return this.__state.settings.deck;
  }
  public set deck(value: Partial<Settings['deck']>) {
    this.updatePartialSetting('deck', value, () => {
      if (value.size !== undefined) ValidationService.validateWholePositiveWithMin(value.size, 1, 'Deck size');
      if (value.locationPreference !== undefined) {
        const validLocations: Array<DeckLocation> = ['top', 'bottom'];
        ValidationService.throwIfInvalidEnum(value.locationPreference, validLocations, 'Deck location preference');
      }
    });
  }
  // #endregion

  // #region Redraw
  public get redraw(): Settings['redraw'] {
    return this.__state.settings.redraw;
  }
  public set redraw(value: Partial<Settings['redraw']>) {
    this.updatePartialSetting('redraw', value, () => {
      if (value.amountOfCards !== undefined) {
        ValidationService.validateWholePositiveNumber(value.amountOfCards, 'Redraw amount of cards');
        ValidationService.throwIfInvalidMinMaxRange(value.amountOfCards, this.deck.size, 'Redraw amount of cards', 'Deck size');
      }

      if (value.defaultRedraws !== undefined) {
        ValidationService.validateWholePositiveNumber(value.defaultRedraws, 'Default redraws');
      }

      if (value.gainMethod !== undefined) {
        const validMethods: Array<RedrawGainMethod> = [
          'end-of-round', 'end-of-game',
          'round-won', 'game-won',
          'round-lost', 'game-lost'
        ];
        ValidationService.throwIfInvalidEnum(value.gainMethod, validMethods, 'Redraw gain method');
      }
    });
  }
  // #endregion

  // #region Round Timer
  public get roundTimerSeconds(): Settings['roundTimerSeconds'] {
    return this.__state.settings.roundTimerSeconds;
  }
  public set roundTimerSeconds(value: Settings['roundTimerSeconds']) {
    this.updateSetting('roundTimerSeconds', value, () => {
      ValidationService.validateWholePositiveWithMin(value, 5, 'Round timer seconds');
    });
  }
  // #endregion

  // #region State Updaters
  private updatePartialSetting<K extends keyof Settings>(
    key: K,
    value: Partial<Settings[K]>,
    validator?: () => void
  ): void {
    const currentValue = this.__state.settings[key];

    this.__logger.groupCollapsed(`updatePartialSetting: ${key}`, {
      current: currentValue,
      update: value
    });

    try {
      validator?.();
      this.__logger.info('Validation passed', { key, value });
    } catch (error) {
      this.__logger.error('Validation failed', { key, value, error });
      throw error;
    }


    if (typeof currentValue === 'object' && currentValue !== null) {
      this.__state.settings[key] = {
        ...currentValue,
        ...value
      } as Settings[K];
    } else {
      this.__state.settings[key] = value as Settings[K];
    }

    this.__logger.info('State updated', this.__state.settings[key]);

    this.save();
    this.emitChange(key);

    this.__logger.groupEnd();
  }
  private updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K],
    validator?: () => void
  ): void {
    validator?.();
    this.__state.settings[key] = value;
    this.save();
    this.emitChange(key);
  }

  private emitChange(changedKey: keyof Settings): void {
    this.__logger.info('Emitting change', { key: changedKey, state: this.__state.settings });
    this.broadcastService.emit('settingsChanged', this.__state.settings, changedKey);
  }
  // #endregion
}