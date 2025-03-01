import { Broadcast } from "@/services/BroadcastService/BroadcastService.types";
import { GameStore } from "../GameStore";

export default function CreateEventHandler<TEvent extends keyof Broadcast>(
  event: TEvent,
  handler: (this: GameStore, ...args: Broadcast[TEvent]) => void
) {
  return function (store: GameStore) {
    return handler.bind(store) as (this: GameStore, ...args: Broadcast[TEvent]) => void;
  }
}