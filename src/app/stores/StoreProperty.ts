import LoggerService from "@/services/LoggerService";
import { signal } from "@angular/core";

const Logger = LoggerService.createStoreLogger('Property');

export default function StoreProperty<T>(initialValue: T) {
  return function (target: any, propertyKey: string) {
    Logger.info('StoreProperty', {
      target,
      propertyKey,
    })
    
    Logger.groupCollapsed('StoreProperty', {
      target,
      propertyKey,
      initialValue,
    });
    
    target._defaultState ??= {};
    target._defaultState[propertyKey] = initialValue;

    // Iterate through each property name and its initial value
      const signalKey = `_${propertyKey}Signal`;
      const _signal = signal(initialValue);

      // Create the signal for this property
      Object.defineProperty(target, signalKey, {
        writable: true,
        value: _signal,
      });

      // Define the getter and setter dynamically
      Object.defineProperty(target, propertyKey, {
        get: function () {
          Logger.info('[GET]', propertyKey, _signal); // Log when property is accessed
          return _signal; // Access signal to get value
        },
        set: function (value: any) {
          Logger.info('[SET]', propertyKey, value); // Log when property is updated
          _signal.set(value); // Use signal.set to update the value
        },
      });

      Logger.info('Finished setting property', {
        target,
        propertyKey,
        signalKey,
        _signal,
      });

    Logger.groupEnd();
  };
}
