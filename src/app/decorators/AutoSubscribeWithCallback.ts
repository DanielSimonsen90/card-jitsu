import { OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import type { Broadcast } from '@/services/BroadcastService/BroadcastService.types';
import type { GameStore } from '@/stores';

export const AutoSubscribeCallbackKey = Symbol('AutoSubscribeCallback');

interface AutoSubscribeCallbackInstance extends OnInit, OnDestroy {
  [AutoSubscribeCallbackKey]?: () => void;
  _autoSubscriptions?: Subscription[];
  gameStore?: GameStore;
  [key: string]: any;
}

export default function AutoSubscribeWithCallback<
  TComponent,
  TEvent extends keyof Broadcast
>(
  componentClass: new (...args: any[]) => TComponent,
  eventName: TEvent,
  callback: (component: TComponent, ...args: Broadcast[TEvent]) => void
) {
  return function <TClass extends { new(...args: any[]): TComponent; }>(constructor: TClass) {
    const originalNgOnInit = constructor.prototype.ngOnInit;
    const originalNgOnDestroy = constructor.prototype.ngOnDestroy;

    constructor.prototype[AutoSubscribeCallbackKey] = function (this: AutoSubscribeCallbackInstance) {
      this._autoSubscriptions = [];

      if (!this.gameStore || typeof this.gameStore.on !== 'function') throw new Error(`GameStore not found or invalid. Expected 'this.gameStore' to be a GameStore instance with 'on' method.`);

      const subscription = this.gameStore.on(eventName, (...args: Broadcast[TEvent]) => callback(this as TComponent, ...args));
      if (subscription && typeof subscription.unsubscribe === 'function') this._autoSubscriptions.push(subscription);
    };

    constructor.prototype.ngOnInit = function (this: AutoSubscribeCallbackInstance) {
      if (this[AutoSubscribeCallbackKey]) this[AutoSubscribeCallbackKey]();
      if (originalNgOnInit) originalNgOnInit.call(this);
    };

    constructor.prototype.ngOnDestroy = function (this: AutoSubscribeCallbackInstance) {
      if (originalNgOnDestroy) originalNgOnDestroy.call(this);

      if (this._autoSubscriptions && this._autoSubscriptions.length > 0) {
        this._autoSubscriptions.forEach(subscription => subscription.unsubscribe());
        this._autoSubscriptions = [];
      }
    };

    return constructor;
  };
}