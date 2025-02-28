import { Injectable } from "@angular/core";
import { StorageService } from "@/services/StorageService";
import LoggerService from "@/services/LoggerService";
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  public readonly store;

  constructor(storageService: StorageService) {
    const tag = 'User';
    const Logger = LoggerService.createStoreLogger(tag);
    
    this.store = signalStore(
      withState(() => ({
        username: '',
        wins: 0,
        losses: 0,
      })),
      withProps(() => ({
        _defaultState: {},
        _loaded: false,
      })),
      withMethods(store => ({
        toJSON() {
          return JSON.stringify(Object.keys(store).reduce((acc, _key) => {
            const key = _key as keyof typeof store;
            if (_key.startsWith('_')) return acc;
            else if (typeof store[key] === 'function') return acc;
            else return { ...acc, [key]: store[key] };
          }, {}));
        },
        save() {
          Logger.info('Requested save');

          const json = this.toJSON();
          storageService.setItem('User', json);

          Logger.info('Saved JSON to storage', {
            storageName: 'User',
            json,
          });
        },
        load() {
          Logger.info('Requested load');

          const json = storageService.getItem('User');
          if (!json) {
            Logger.info('No data found in storage');
            return;
          }

          const data = JSON.parse(json);

          Logger.info('Loaded JSON from storage', {
            storageName: 'User',
            json,
            data,
          });

          Object.assign(store, data);
        },
        delete() {
          Logger.groupCollapsed('Requested delete');
          storageService.removeItem(tag);
          Logger.info('Deleted data from storage', tag);

          if (store._defaultState.isEmpty()) {
            Logger.warn('No default state found, skipping');
            return;
          }

          Logger.info('Resetting to default state', store._defaultState);
          Object.assign(store, store._defaultState);
        },

        getWinPercentage() {
          const winPercentage = store.wins() / (store.wins() + store.losses()) * 100;

          Logger.info('Win percentage calculated:', winPercentage);

          return winPercentage;
        },
        hasValidUser() {
          return !!store.username();
        },
        createUser(username: string) {
          Logger.info('Creating user with username:', username);

          patchState(store, { username });
          this.save();
        },
      })),
      withHooks(store => ({
        onInit() {
          Logger.info('OnInit');
          Logger.info('Loading store data...');
          store.load();
          Logger.info('Store data loaded', store);
        },
        onDestroy() {
          Logger.info('OnDestroy');
          Logger.info('Saving store data...');
          store.save();
          Logger.info('Store data saved', store);
        }
      }))
    );
  }
}