import { StorageService } from "@/services/StorageService";
import LoggerService from "@/services/LoggerService";
import { WritableSignal } from "@angular/core";
import { InjectStorePropertiesKey } from "../decorators/StoreState";

export default abstract class BaseStore<State extends object> {
  constructor(
    protected storageService: StorageService,
    tag: string,
  ) {
    this.__logger = LoggerService.createStoreLogger(tag);

    if (InjectStorePropertiesKey in this && typeof this[InjectStorePropertiesKey] === 'function') {
      // this.Logger.info('Injecting store properties', this);
      this[InjectStorePropertiesKey]();
    }
  }

  protected readonly __logger: ReturnType<typeof LoggerService.createStoreLogger>;
  protected __state = {} as State;
  
  public toJSON(): object {
    return this.__state;
  }

  public save() {
    this.__logger.groupCollapsed('Requested save');

    const json = JSON.stringify(this.toJSON());
    if (json === '{}') this.__logger.warn('toJSON function was not overloaded or returned blank object.', {
      state: this.__state,
      json
    });

    this.storageService.setItem(this.constructor.name, json);

    this.__logger.info('Saved JSON to storage', json).groupEnd();
  }

  private _loaded = false;
  public load() {
    this.__logger.groupCollapsed('Requested load');
    if (this._loaded) {
      this.__logger.info('Already loaded', this).groupEnd();
      return;
    }
    this._loaded = true;

    const localStateJson = this.storageService.getItem(this.constructor.name);
    if (!localStateJson) {
      this.__logger.info('No data found in storage', this).groupEnd();
      return;
    }

    const localState = JSON.parse(localStateJson);
    this.__logger.info('Loaded data from storage', localState);

    Object.keys(localState).forEach(key => {
      const state = this.__state;

      if (key in state) {
        if (typeof state[key as keyof typeof state] !== typeof localState[key]) {
          (state[key as keyof typeof state] as WritableSignal<any>).set(localState[key]);
        } else {
          state[key as keyof typeof state] = localState[key];
        }
      } else {
        this.__logger.warn('Key not found in store', key);
      }
    });

    this.__logger.info('Loading completed', this).groupEnd();
  }
  public delete() {
    this.__logger.groupCollapsed('Requested delete');
    this.storageService.removeItem(this.constructor.name);
    this.__logger.info('Deleted data from storage', this.constructor.name);

    this.reset();
    this.__logger.groupEnd();
  }
  public reset() {
    this.__logger.groupCollapsed('Requested reset');

    const defaultState = this.getDefaultState();
    if (!defaultState) {
      this.__logger.warn('No default state found, skipping');
      return;
    }

    Object.assign(this.__state, defaultState);

    this.__logger.info('Reset to default state', this).groupEnd();
  }

  public getDefaultState(): Partial<this> | null {
    if ('_defaultState' in this) return this._defaultState as Partial<this>;

    return Object.keys(this.__state)
      .filter(key => (
        !key.startsWith('_') &&
        typeof this[key as keyof this] !== 'function' &&
        key[0].toUpperCase() !== key[0]
      ))
      .reduce((acc, _key) => {
        const key = _key as keyof this;

        acc[key] = (
          Array.isArray(this[key]) ? [] : 
          typeof this[key] === 'object' && !Array.isArray(this[key]) ? {} : 
          typeof this[key] === 'string' ? '' :
          typeof this[key] === 'number' ? 0 :
          typeof this[key] === 'boolean' ? false :
          null
        );

        return acc;
      }, {} as Record<keyof this, any>) as Partial<this>;
  }
}