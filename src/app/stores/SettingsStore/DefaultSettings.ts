import { Settings } from "./SettingsStore.types";

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
    gainMethod: 'round-won'
  },
  roundTimerSeconds: 30,
} satisfies Settings