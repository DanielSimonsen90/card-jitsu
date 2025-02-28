import { Injectable, signal } from "@angular/core";
import { BaseStore, StoreProperty } from "../BaseStore";
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

@Injectable({ providedIn: 'root' })
export class UserStore extends BaseStore<User> {
  constructor(storageService: StorageService) {
    super(storageService, 'User');
  }

  @StoreProperty('')
  public username: string = '';
  @StoreProperty(0)
  public wins: number = 0;
  @StoreProperty(0)
  public losses: number = 0;

  public get value(): User {
    const user = {
      username: this.username,
      wins: this.wins,
      losses: this.losses,
    };

    this.Logger.info('User value requested', user);

    return user;
  }

  public getWinPercentage() {
    const winPercentage = this.wins / (this.wins + this.losses) * 100;
    
    this.Logger.info('Win percentage calculated:', winPercentage);

    return winPercentage;
  }

  public hasValidUser() {
    return !!this.username;
  }

  public createUser(username: string) {
    this.Logger.info('Creating user with username:', username);

    this.username = username;
    this.save();
  }
}

export default UserStore;