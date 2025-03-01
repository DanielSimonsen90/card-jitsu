import { Player } from "@/models/types";
import BroadcastService from "../BroadcastService";
import { GameStore } from "@/stores";

export default class AiPlayer implements Pick<Player, 'name'> {
  constructor(
    public name: string,
    broadcastService: BroadcastService,
    protected gameStore: GameStore,
  ) {
    broadcastService.on('updateGameState', state => {
      switch (state) {
        case 'play': this.playCard(); break;
      }
    });
  }

  public player: Player | null = null;

  private playCard() {
    if (!this.player) throw new Error('Player not registered');

    return this.gameStore.playCard(
      this.player,
      this.player.cards.random()
    );
  }
}