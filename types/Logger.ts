import {
  logErrorLevels,
  logWarningLevels,
  logVerbosityLevels,
  logLevels,
  logKeys,
} from '../lib/enums/index.js';

type logLevels = typeof logLevels;
type logKeys = typeof logKeys;
type logWarningLevels = typeof logWarningLevels;
type logVerbosityLevels = typeof logVerbosityLevels;
type logErrorLevels = typeof logErrorLevels;

export interface Log {
  message: string;
  [key: string]: unknown;
}

// TODO: add backwards compatibility for these options in the Logger.log method
export interface LogConfigBase {
  verbosity?: logVerbosityLevels[keyof logVerbosityLevels];
  threshold?: logLevels[keyof logLevels] | 'silent';

  /** @deprecated */
  warnings?: logWarningLevels[keyof logWarningLevels];
  /** @deprecated */
  errors?: {
    brokenReferences?: logErrorLevels[keyof logErrorLevels];
    transforms?: logErrorLevels[keyof logErrorLevels];
  };
}

export interface LogConfigSub {
  verbosity?: logVerbosityLevels[keyof logVerbosityLevels];
  level?: logLevels[keyof logLevels] | 'silent';
}

export type LogConfig = Partial<
  LogConfigBase & Record<keyof logLevels, LogConfigSub> & Record<keyof logKeys, LogConfigSub>
>;
