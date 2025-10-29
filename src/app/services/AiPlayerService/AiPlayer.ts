import { Player } from "@/models/types";
import BroadcastService from "../BroadcastService";
import { GameStore } from "@/stores";
import { MAX_WAIT_TIME_BEFORE_PLAY_CARD } from "./AiPlayerService.constants";
import { Card } from "../CardService/CardService.types";

export default class AiPlayer implements Pick<Player, 'name'> {
  constructor(
    public name: string,
    broadcastService: BroadcastService,
    protected gameStore: GameStore,
  ) {
    broadcastService.on('updateGameState', state => {
      switch (state) {
        case 'play': setTimeout(() => this.playCard(), Math.random() * MAX_WAIT_TIME_BEFORE_PLAY_CARD); break;
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