import {
  logErrorLevels,
  logWarningLevels,
  logVerbosityLevels,
  logLevels,
  logBuiltinKeys,
} from '../lib/enums/index.js';

type logLevels = typeof logLevels;
type logBuiltinKeys = typeof logBuiltinKeys;
type logWarningLevels = typeof logWarningLevels;
type logVerbosityLevels = typeof logVerbosityLevels;
type logErrorLevels = typeof logErrorLevels;

export type LogLevels = logLevels[keyof logLevels];
export type LogBuiltinKeys = logBuiltinKeys[keyof logBuiltinKeys];
export type LogVerbosityLevels = logVerbosityLevels[keyof logVerbosityLevels];
/** @deprecated */
type LogWarningLevels = logWarningLevels[keyof logWarningLevels];
/** @deprecated */
type LogErrorLevels = logErrorLevels[keyof logErrorLevels];

export interface Log {
  message: string;
  [key: string]: unknown;
}

export interface LogConfigBase {
  verbosity?: LogVerbosityLevels;
  threshold?: LogLevels;

  /** @deprecated */
  warnings?: LogWarningLevels;
  /** @deprecated */
  errors?: {
    brokenReferences?: LogErrorLevels;
    transforms?: LogErrorLevels;
  };
}

export interface LogConfigSub {
  verbosity?: LogVerbosityLevels;
  level?: LogLevels;
}

/**
 * 1) base config, speaks for itself, controls global logging (threshold overall, verbosity overall)
 * 2) logging categories, e.g. warn as error, log as throw, etc. can also control the verbosity of that specific category
 * 3) built-in specific logs in Style Dictionary, which can be configured specifically
 * 4) extension logging categories defined by subclassers (e.g. Style Dictionary utilities, registering a custom hook that can log via the Logger)
 */
export type LogConfig = Partial<
  LogConfigBase & Record<LogLevels, LogLevels | LogConfigSub> & Record<LogBuiltinKeys, LogConfigSub>
> &
  // extensions
  Record<
    string,
    | LogConfigSub
    | LogLevels

    // because index signatures are strict, for now we have to include the
    // types below here as valid values.
    | LogVerbosityLevels
    | LogWarningLevels
    | { brokenReferences?: LogErrorLevels; transforms?: LogErrorLevels }
  >;
