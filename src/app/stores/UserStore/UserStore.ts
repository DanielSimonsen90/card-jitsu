import { computed, Injectable } from "@angular/core";

import { StoreState } from "@/decorators";
import { StorageService } from "@/services/StorageService";

import BaseStore from "../BaseStore";
import User from "./User";
import { BroadcastService } from "@/services/BroadcastService/BroadcastService.service";

/**
 * # UserStore
 * 
 * This store is responsible for managing the current user's data, including:
 * * Username
 * * Wins
 * * Losses
 */

@Injectable({ providedIn: 'root' })
@StoreState<User>({
  username: '',
  wins: 0,
  gamesPlayed: 0,
})
export default class UserStore extends BaseStore<User> {
  constructor(
    storageService: StorageService,
    broadcastService: BroadcastService
  ) {
    super(storageService, 'User');

    broadcastService.on('finishGame', winner => {
      if (winner) {
        if (winner.name === this.__state.username) this.__state.wins++;
        this.__state.gamesPlayed++;

        this.save();
      }
    })

    this.__logger.disable();
  }

  public get user(): User {
    const user = {
      username: this.__state.username,
      wins: this.__state.wins,
      gamesPlayed: this.__state.gamesPlayed,
    };

    this.__logger.info('User value requested', user);

    return user;
  }

  public getWinPercentage = computed(() => {
    const { wins, gamesPlayed } = this.__state;
    if (gamesPlayed === 0) return 0;

    const winPercentage = Math.round((wins / gamesPlayed) * 100);

    this.__logger.info('Win percentage calculated:', winPercentage);

    return winPercentage;
  });

  public hasValidUser = computed(() => this.__state.username !== undefined && this.__state.username !== '');

  public createUser(username: string) {
    this.__logger.info('Creating user with username:', username);

    this.__state.username = username;
    this.__logger.info('SAVING', this.__state);
    this.save();
  }

  public override toJSON() {
    const { username, wins, gamesPlayed } = this.__state;
    
    return {
      username,
      wins,
      gamesPlayed,
    }
  }
}
