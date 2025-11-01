export type DeckLocation = 'top' | 'bottom';
export type RedrawGainMethod = (
  | 'end-of-round' | 'end-of-game'
  | 'round-won' | 'game-won'
  | 'round-lost' | 'game-lost'
);


export type Settings = {
  roundTimerSeconds: number;
  deck: {
    locationPreference: DeckLocation;
    size: number;
  };
  cards: {
    minValue: number;
    maxValue: number;
  };
  redraw: {
    amountOfCards: number;
    defaultRedraws: number;
    gainMethod: RedrawGainMethod;
  };
};