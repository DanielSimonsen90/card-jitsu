
import Timer from "./Timer";
import { TimerCallback } from "./Timer.types";

/**
 * # Timer Service
 * 
 * This service is responsible for managing the game timer.
 * Through public functions like `startTimer` and `stopTimer`, the timer can be controlled.
 * Additionally, register callback functions to be called when the timer finishes.
 */
export class TimerService {
  public static createTimer(callback?: TimerCallback, seconds?: number) {
    return new Timer(callback, seconds);
  }
}