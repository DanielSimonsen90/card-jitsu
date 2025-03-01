import AiPlayer from "./AiPlayer";
import BroadcastService from "../BroadcastService";
import { ClubPenguinNames } from "./AiPlayerService.constants";
import { GameStore } from "@/stores";
import { Player } from "@/models/types";

export class AiPlayerService {
  private aiPlayers: AiPlayer[] = [];

  public createAiPlayer(gameStore: GameStore, broadcastService: BroadcastService) {
    const player = new AiPlayer(
      this.generateAiPlayerName(), 
      broadcastService, 
      gameStore
    );
    
    this.aiPlayers.push(player);
    return player;
  }

  public updateAiPlayers(gamePlayers: Array<Player>) {
    this.aiPlayers.forEach(ai => {
      const gamePlayer = gamePlayers.find(p => p.name === ai.name);
      if (gamePlayer) ai.player = gamePlayer;
    });
  }

  public removeAiPlayer(player: Player) {
    this.aiPlayers = this.aiPlayers.filter(p => p.name !== player.name);
  }

  public isAiPlayer(player: Player) {
    return this.aiPlayers.some(p => p.name === player.name);
  }

  private generateAiPlayerName() {
    let name = '';
    while (name === '' || this.aiPlayers.some(p => p.name.startsWith(name))) {
      name = ClubPenguinNames.random();
    }

    return name + `-${Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')}`;
  }
}