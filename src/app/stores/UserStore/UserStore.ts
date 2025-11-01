import { computed, Injectable } from "@angular/core";

import { StoreState } from "@/decorators";
import { StorageService } from "@/services/StorageService";

import BaseStore from "../BaseStore";
import User from "./User";

/**
 * # UserStore
 * 
 * This store is responsible for managing the current user's data, including:
 * * Username
 * * Wins
 * * Losses
 */

type State = {
  username: string;
  wins: number;
  losses: number;
}

@Injectable({ providedIn: 'root' })
@StoreState<State>({
  username: '',
  wins: 0,
  losses: 0,
})
export default class UserStore extends BaseStore<State> {
  constructor(storageService: StorageService) {
    super(storageService, 'User');

    this.__logger.disable();
  }

  public get user(): User {
    const user = {
      username: this.__state.username,
      wins: this.__state.wins,
      losses: this.__state.losses,
    };

    this.__logger.info('User value requested', user);

    return user;
  }

  public getWinPercentage = computed(() => {
    const winPercentage = this.__state.wins / (this.__state.wins + this.__state.losses) * 100;

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
    const { username, wins, losses } = this.__state;
    
    return {
      username,
      wins,
      losses,
    }
  }
}
