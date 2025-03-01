import { computed, Injectable } from "@angular/core";
import BaseStore, { StoreState } from "../BaseStore";
import User from "./User";
import { StorageService } from "@/services/StorageService";

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
export class UserStore extends BaseStore<State> {
  constructor(storageService: StorageService) {
    super(storageService, 'User');

    this.Logger.disable();
  }

  public get user(): User {
    const user = {
      username: this.state.username,
      wins: this.state.wins,
      losses: this.state.losses,
    };

    this.Logger.info('User value requested', user);

    return user;
  }

  public getWinPercentage = computed(() => {
    const winPercentage = this.state.wins / (this.state.wins + this.state.losses) * 100;

    this.Logger.info('Win percentage calculated:', winPercentage);

    return winPercentage;
  });

  public hasValidUser = computed(() => this.state.username !== undefined && this.state.username !== '');

  public createUser(username: string) {
    this.Logger.info('Creating user with username:', username);

    this.state.username = username;
    this.Logger.info('SAVING', this.state);
    this.save();
  }

  public override toJSON() {
    const { username, wins, losses } = this.state;
    
    return {
      username,
      wins,
      losses,
    }
  }
}

export default UserStore;