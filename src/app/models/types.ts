export type Card = {
  value: number;
  type: ElementalType;
  color: Color;
}

export type ElementalType = 'fire' | 'water' | 'ice';
export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export type Player = {
  name: string;
  cards: Array<Card>;
  wins: Array<Card>;
}

export type GameState = 'deal' | 'play' | 'check' | 'finish';
export type Broadcast = {
  actions: {
    updateGameState: [state: GameState];
    finishGame: [winner: Player];
    playCard: [player: Player, card: Card];
    sendCard: [player: Player, card: Card];
    declareRoundWinner: [winner: Player, card: Card];

    send: [message: string, time: Date];
  },
  events: {
    gameStateChanged: [state: GameState];
    gameOver: [winner: Player];
    cardPlayed: [player: Player, card: Card];
    cardRecieved: [player: Player, card: Card];
    roundEnded: [winner: Player, card: Card];

    message: [message: string, time: Date];
  }
}