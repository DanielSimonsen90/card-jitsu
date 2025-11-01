import { DeckLocation, RedrawGainMethod, Settings } from "./SettingsStore.types";

export default {
  cards: {
    minValue: 1,
    maxValue: 20,
  },
  deck: {
    size: 5,
    locationPreference: 'bottom'
  },
  redraw: {
    amountOfCards: 1,
    defaultRedraws: 0,
    gainMethod: 'round-won'
  },
  roundTimerSeconds: 30,
} satisfies Settings;

export const SETTINGS_OPTIONS = {
  deck: {
    locationPreference: [
      'top',
      'bottom'
    ] as Array<DeckLocation>,
  },
  redraw: {
    gainMethod: [
      'end-of-round',
      'end-of-game',
      'game-won',
      'game-lost',
      'round-won',
      'round-lost',
    ] as Array<RedrawGainMethod>
  }
};