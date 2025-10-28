import { Player } from "@/models/types";
import BroadcastService from "../BroadcastService";
import { GameStore } from "@/stores";
import { MAX_WAIT_TIME_BEFORE_PLAY_CARD } from "./AiPlayerService.constants";

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

    return this.gameStore.playCard(
      this.player,
      this.player.cards.random()
    );
  }
}