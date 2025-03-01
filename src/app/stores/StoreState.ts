import LoggerService from "@/services/LoggerService";
import { signal, WritableSignal } from "@angular/core";

const Logger = LoggerService.createLogger('StoreProperties');

export const InjectStorePropertiesKey = Symbol('InjectStoreProperties');

export default function StoreState<TProps extends object>(props: TProps) {
  return function (target: any) {
    if (!target.prototype || InjectStorePropertiesKey in target.prototype) return;
    else if (!target?.prototype) {
      Logger.error('No prototype found on target', target);
      return;
    }

    target.prototype[InjectStorePropertiesKey] = function () {
      const Logger = LoggerService.createLogger(`${target.name} Properties Injections`).disable();
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