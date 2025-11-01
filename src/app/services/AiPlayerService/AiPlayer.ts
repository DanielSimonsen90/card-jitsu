import { Player } from "@/models/types";
import { GameStore } from "@/stores";
import { MAX_WAIT_TIME_BEFORE_PLAY_CARD } from "./AiPlayerService.constants";
import { Card } from "../CardService/CardService.types";

export default class AiPlayer implements Pick<Player, 'name'> {
  constructor(
    public name: string,
    protected gameStore: GameStore,
  ) {
    gameStore.on('updateGameState', async state => {
      switch (state) {
        case 'play': {
          const shouldRedraw = Math.random() < 1 / 5; // 1 of 5 chance to redraw

          if (shouldRedraw && this.player) await new Promise<void>(resolve => setTimeout(() => {
            if (!this.player) return resolve();

            const randomCard = this.player.cards
              .filter((c): c is Card => c !== null)
              .sort(() => 0.5 - Math.random())
            [0];

            gameStore.redraw(this.player, randomCard);
            resolve();
          }, Math.random() * MAX_WAIT_TIME_BEFORE_PLAY_CARD));
          
          setTimeout(() => this.playCard(), Math.random() * MAX_WAIT_TIME_BEFORE_PLAY_CARD);
        }; break;
      }
    });
  }

  public player: Player | null = null;

  private playCard() {
    if (!this.player) throw new Error('Player not registered');

    // Get available cards (non-null cards)
    const availableCards = this.player.cards.filter(card => card !== null);
    if (availableCards.length === 0) {
      console.warn('AI Player has no available cards to play');
      return;
    }

    // Select a random available card instead of using infinite loop
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const playedCard = availableCards[randomIndex];

    return this.gameStore.playCard(
      this.player,
      playedCard,
    );
  }
}