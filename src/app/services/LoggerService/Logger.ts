import { LogLevel, OnChangeFunction } from "./Logger.types";

export default class Logger {
  constructor(
    private tag: string,
    public onChange: OnChangeFunction
  ) {}

  private log(level: LogLevel, ...args: any[]) {
    if (this.disabled) return;

    const timestamp = new Date().toLocaleTimeString();
    console[level](`[${timestamp}] [${this.tag}]`, ...args);
  }

  public info(...args: any[]) {
    this.log('info', ...args);
    return this;
  }
  public warn(...args: any[]) {
    this.log('warn', ...args);
    return this;
  }
  public error(...args: any[]) {
    this.log('error', ...args);
    return this;
  }

  public group(...args: any[]) {
    this.log('group', ...args);
  }
  public groupCollapsed(...args: any[]) {
    this.log('groupCollapsed', ...args);
    return this;
  }
  public groupEnd() {
    this.log('groupEnd');
    return this;
  }

  private disabled = false;
  public disable() {
    this.disabled = true;
    this.onChange(this);
    return this;
  }
  public enable() {
    this.disabled = false;
    this.onChange(this);
  }
}