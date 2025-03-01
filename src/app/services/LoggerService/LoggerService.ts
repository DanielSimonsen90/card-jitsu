import { Broadcast } from "../BroadcastService/BroadcastService.types";
import Logger from "./Logger";

export default class LoggerService {
  public static createLogger(tag: string) {
    return new Logger(tag, instance => {
      this._loggers[tag] = instance;
    });
  }

  public static createComponentLogger(tag: string) {
    return this.createLogger(`${tag}Component`);
  }
  public static createStoreLogger(tag: string) {
    return this.createLogger(`${tag}Store`);
  }
  public static createGameEventLogger(tag: keyof Broadcast) {
    return this.createLogger(`${tag}Event`);  
  }

  private static _loggers: Record<string, Logger> = {};
  public static disable(tag?: string) {
    if (tag) this._loggers[tag].disable();
    else Object.values(this._loggers).forEach(logger => logger.disable());
  }
  public static enable(tag?: string) {
    if (tag) this._loggers[tag].enable();
    else Object.values(this._loggers).forEach(logger => logger.enable());
  }
}