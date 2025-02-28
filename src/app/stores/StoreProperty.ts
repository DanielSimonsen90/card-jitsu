import LoggerService from "@/services/LoggerService";
import { signal, WritableSignal } from "@angular/core";

const Logger = LoggerService.createStoreLogger('Property');

const StoreInjections: Record<string, Array<string>> = {};

export const InjectStorePropertiesKey = Symbol('InjectStoreProperties');

export default function StoreProperty<T>(initialValue: T) {
  return function (target: any, propertyKey: string) {
    StoreInjections[target] ??= [];
    StoreInjections[target].push(propertyKey);

    if (target.constructor.prototype && !(InjectStorePropertiesKey in target.constructor.prototype)) {
      target.constructor.prototype[InjectStorePropertiesKey] = function () {
        const Logger = LoggerService.createStoreLogger('Property Injections');
        Logger.groupCollapsed({ target, properties: StoreInjections[target] });

        for (const propertyKey of StoreInjections[target]) {
          Logger.groupCollapsed(`Injecting: ${propertyKey} (${initialValue})`);

          this._defaultState ??= {};
          this._defaultState[propertyKey] = initialValue;
          Logger.info('Updated _defaultState', this._defaultState);

          // Iterate through each property name and its initial value
          const signalKey = `_${propertyKey}Signal`;

          // Create the signal for this property
          this[signalKey] = signal(initialValue);

          const _getSignal = () => this[signalKey] as WritableSignal<T>;

          // Define the getter and setter dynamically
          Object.defineProperty(this, propertyKey, {
            get: function () {
              const value = _getSignal()();
              Logger.info('[GET]', propertyKey, value); // Log when property is accessed
              return value; // Access signal to get value
            },
            set: function (value: any) {
              Logger.info('[SET]', propertyKey, value); // Log when property is updated
              _getSignal().set(value); // Use signal.set to update the value
            },
          });

          Logger.info(`Finished ${propertyKey}`, {
            this: this,
            signalKey,
            signal: _getSignal(),
          });

          Logger.groupEnd();
        }
      };
    } else if (!target?.constructor?.prototype) {
      Logger.error('No constructor found on target', target);
    }
  };
};

export function StoreProperties<TProps extends object>(props: TProps) {
  return function (target: any) {
    if (!target.prototype || InjectStorePropertiesKey in target.prototype) return;
    else if (!target?.prototype) {
      Logger.error('No prototype found on target', target);
      return;
    }

    target.prototype[InjectStorePropertiesKey] = function () {
      const Logger = LoggerService.createLogger('StoreProperties Injections');
      Logger.groupCollapsed({ target, properties: Object.keys(props) });

      if (!('state' in this)) {
        Logger.info(Object.keys(this));
        throw new Error('State not found on store');
      }

      for (const propertyKey in props) {
        Logger.groupCollapsed(`Injecting: ${propertyKey} (${props[propertyKey]})`);

        this._defaultState ??= {};
        this._defaultState[propertyKey] = props[propertyKey];
        Logger.info('Updated _defaultState', this._defaultState);

        // Iterate through each property name and its initial value
        const signalKey = `_${propertyKey}Signal`;

        // Create the signal for this property
        this[signalKey] = signal(props[propertyKey]);

        const _getSignal = () => this[signalKey] as WritableSignal<TProps[keyof TProps]>;

        // Define the getter and setter dynamically
        Object.defineProperty(this.state, propertyKey, {
          get: function () {
            const value = _getSignal()();
            Logger.info('[GET]', propertyKey, value); // Log when property is accessed
            return value; // Access signal to get value
          },
          set: function (value: any) {
            Logger.info('[SET]', propertyKey, value); // Log when property is updated
            _getSignal().set(value); // Use signal.set to update the value
          },
        });

        Logger.info(`Finished ${propertyKey}`, {
          this: this,
          signalKey,
          signal: _getSignal(),
        });

        Logger.groupEnd();
      }

      Logger.info('Finished injections', this).groupEnd();
    };
  };
}