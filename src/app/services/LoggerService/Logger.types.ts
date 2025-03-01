import Logger from "./Logger";

export type BaseLogLevel = keyof Pick<Console, 'log' | 'info' | 'warn' | 'error'>;
export type LogGroupLevels = keyof Pick<Console, 'group' | 'groupCollapsed' | 'groupEnd'>;

export type LogLevel = BaseLogLevel | LogGroupLevels | 'trace';

export type OnChangeFunction = (logger: Logger) => void;