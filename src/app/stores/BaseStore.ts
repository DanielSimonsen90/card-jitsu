import { StorageService } from "@/services/StorageService";
import LoggerService from "@/services/LoggerService";
import { BehaviorSubject } from "rxjs";

export { default as StoreProperty } from './StoreProperty';

export abstract class BaseStore<T> {
  constructor(
    protected _storageService: StorageService,
    tag: string,
  ) {
    this.Logger = LoggerService.createStoreLogger(tag);
  }

  public abstract get value(): T;
  protected _defaultState: Partial<T> = {};
  protected readonly Logger: ReturnType<typeof LoggerService.createStoreLogger>;

  public toJSON() {
    const result = Object.keys(this).reduce((acc, key) => {
      if (key === 'toJSON') return acc;
      else if (typeof this[key as keyof this] === 'function') return acc;
      else if (key.includes('$')) return acc;
      else if (key[0] === key[0].toUpperCase()) return acc;

      // TODO: BehaviorSubject should be a signal
      if (key.startsWith('_') && this[key as keyof this] instanceof BehaviorSubject) {
        const value = (this[key as keyof this] as BehaviorSubject<any>).value;
        acc[key.substring(1)] = value;
      } else if (key.startsWith('_')) {
        return acc;
      } else {
        acc[key] = this[key as keyof this];
      }

      return acc;
    }, {} as Record<string, any>);

    this.Logger.info('JSON result', result);

    return result;
  }

  public save() {
    this.Logger.groupCollapsed('Requested save');

    const json = this.toJSON();
    this._storageService.setItem(this.constructor.name, JSON.stringify(json));

    this.Logger.info('Saved JSON to storage', {
      storageName: this.constructor.name,
      json,
    }).groupEnd();
  }

  private _loaded = false;
  public load() {
    this.Logger.groupCollapsed('Requested load');
    if (this._loaded) {
      this.Logger.info('Already loaded', this).groupEnd();
      return;
    }
    this._loaded = true;

    const json = this._storageService.getItem(this.constructor.name);
    if (!json) {
      this.Logger.info('No data found in storage', this).groupEnd();
      return;
    }

    const data = JSON.parse(json);
    this.Logger.info('Loaded data from storage', data);

    Object.keys(data).forEach(key => {
      if (key in this) {
        this[key as keyof this] = data[key];
      } else {
        this.Logger.warn('Key not found in store', key);
      }
    });
    
    this.Logger.info('Loading completed', this).groupEnd();
  }
  public delete() {
    this.Logger.groupCollapsed('Requested delete');
    this._storageService.removeItem(this.constructor.name);
    this.Logger.info('Deleted data from storage', this.constructor.name);

    if (this._defaultState.isEmpty()) {
      this.Logger.warn('No default state found', this).groupEnd();
      return;
    }

    this.Logger.info('Resetting to default state', this._defaultState);
    Object.assign(this, this._defaultState);
    this.Logger.info('Delete completed', this).groupEnd();
  }
}