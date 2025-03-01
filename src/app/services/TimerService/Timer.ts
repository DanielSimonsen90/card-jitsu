import { TimerCallback } from "./Timer.types";

export default class Timer {
  constructor(callback?: TimerCallback, seconds?: number) {
    if (callback) this.callbacks.push(callback);
    this.safeAssignSeconds(seconds);
  }

  protected timeout: NodeJS.Timeout | null = null;
  protected timestamp: number = 0;
  protected callbacks: Array<TimerCallback> = [];
  protected seconds: number = 0;

  public get isActive() {
    return this.timeout !== null;
  }

  public get timeLeft(): number {
    if (this.timeout) {
      const timeLeft = this.seconds - ((Date.now() - this.timestamp) / 1000);
      return timeLeft > 0 ? Math.floor(timeLeft) : 0;
    }

    return 0;
  }


  public start(seconds?: number): Promise<void> {
    this.safeAssignSeconds(seconds);

    return new Promise((resolve, reject) => {
      const timeout = this.seconds * 1000;
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            reject(error);
          }
        });

        resolve();
      }, timeout);
      this.timestamp = Date.now();
    });
  }

  public restart(seconds?: number) {
    this.safeAssignSeconds(seconds);

    this.stop();
    return this.start();
  }

  public stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  public addCallback(callback: TimerCallback) {
    this.callbacks.push(callback);

    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  public setSeconds(seconds: number) {
    this.safeAssignSeconds(seconds);
  }

  protected safeAssignSeconds(seconds?: number) {
    if (seconds && seconds > 1) this.seconds = seconds;
    else if (seconds) throw new Error(`Timer must be set to at least 1 second, got ${seconds}`);
  }
}