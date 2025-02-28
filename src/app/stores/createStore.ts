import LoggerService from '@/services/LoggerService';
import { StorageService } from '@/services/StorageService';
import {
  signalStore,
  withState, withHooks,
  withProps, withComputed, withMethods,
  patchState,
  type
} from '@ngrx/signals';

type CreationProps<
  TState,
  TProps,
  TMethods extends Record<string, Function>,
  TStore extends BaseStore & TState & TProps & TMethods
> = {
  state?: TState | ((store: TStore) => TState);
  props?: TProps;
  methods?: TMethods | ((store: TStore, patch: typeof patchState) => TMethods);
  hooks?: Record<'onInit' | 'onDestroy', (store: TStore) => void>;
};

type BaseStore = {
  _defaultState: object;
  _loaded: boolean;

  toJSON(): string;
  save(): void;
  load(): void;
  delete(): void;
};

export default function createStore<
  TState extends object,
  TProps extends object,
  TMethods extends Record<string, Function>,
  TStore extends BaseStore & TState & TProps & TMethods
>(
  storageService: StorageService,
  tag: string,
  data: CreationProps<TState, TProps, TMethods, TStore>
) {
  const Logger = LoggerService.createStoreLogger(tag);

  const baseStoreProps = {
    _defaultState: {} as TState,
    _loaded: false,
  };
  const baseStoreMethods = (store: typeof baseStoreProps) => ({
    toJSON() {
      return JSON.stringify(store);
    },
    save() {
      Logger.groupCollapsed('Requested save');

      const json = this.toJSON();
      storageService.setItem(tag, json);

      Logger.info('Saved JSON to storage', {
        storageName: tag,
        json,
      }).groupEnd();
    },
    load() {
      Logger.groupCollapsed('Requested load');
      if (store._loaded) {
        Logger.info('Already loaded, skipping');
        return;
      }

      const json = storageService.getItem(tag);
      if (!json) {
        Logger.info('No data found in storage');
        return;
      }

      const data = JSON.parse(json);
      patchState(store as any, { ...data, _loaded: true });

      Logger.info('Loaded data from storage', data);
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
    }
  });
  const baseStoreHooks = (store: typeof baseStoreProps & ReturnType<typeof baseStoreMethods>) => ({
    onInit() {
      Logger.groupCollapsed('OnInit');
      Logger.info('Loading store data...');
      store.load();
      Logger.info('Store data loaded', store);
      Logger.groupEnd();
    },
    onDestroy() {
      Logger.groupCollapsed('OnDestroy');
      Logger.info('Saving store data...');
      store.save();
      Logger.info('Store data saved', store);
      Logger.groupEnd();
    }
  });

  const store = signalStore(
    withProps(() => Object.assign({}, baseStoreProps, (data.props ?? {}))),
    withMethods(store => Object.assign({},
      baseStoreMethods(store),
      typeof data.methods === 'function' ? data.methods(store as any as TStore, patchState) : (data.methods ?? {}))
    ),
    withState(typeof data.state === 'function' ? data.state : () => (data.state ?? {})),
    withHooks(baseStoreHooks as any),
  );
}