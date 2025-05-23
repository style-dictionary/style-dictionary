import chalk from 'chalk';
import { logVerbosityLevels } from '../../enums/logging/logVerbosityLevels.js';
// import { logErrorLevels } from '../../enums/logErrorLevels.js';
import { verbosityInfo } from '../groupMessages.js';

/**
 * @typedef {import('../../transform/token.js').TransformError} TransformError
 * @typedef {typeof import('../../enums/logging/logLevels.js').logLevels} logLevels
 * @typedef {typeof import('../../enums/logging/logKeys.js').logKeys} logKeys
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/Logger.d.ts').LogConfig} LogConfig
 * @typedef {import('../../../types/Logger.d.ts').Log} Log
 */

const { verbose } = logVerbosityLevels;
// const { throw: logThrow } = logErrorLevels;

const loggerValueMap = {
  debug: 100,
  info: 200,
  success: 300,
  warn: 400,
  error: 500,
  throw: 600,
  silent: 999,
};

export class Logger {
  /**
   * @private
   * @returns {Map<keyof logKeys, Map<string, Log[]>>}
   */
  get logMap() {
    return new Map([
      ['throw.references', this.throw.references], // TODO:
      ['error.transforms', this.error.transforms], // implemented
      ['warn.collisions', this.warn.collisions], // TODO:
      ['warn.nameCollisions', this.warn.nameCollisions], // TODO:
    ]);
  }

  /**
   * @param {keyof logKeys} type
   */
  getLogObject(type) {
    const entry = this.logMap.get(type);
    if (!entry) {
      throw new Error(`Log type "${type}" does not exist.`);
    }
    return entry;
  }

  /**
   * @param {LogConfig} config
   */
  constructor(config = {}) {
    /** @type {Record<string, Map<string, Log[]>>} */
    this.throw = {
      references: new Map(),
    };

    /** @type {Record<string, Map<string, Log[]>>} */
    this.error = {
      transforms: new Map(),
    };

    /** @type {Record<string, Map<string, Log[]>>} */
    this.warn = {
      collisions: new Map(),
      nameCollisions: new Map(),
    };

    this.success = {};

    this.info = {};

    this.debug = {};

    this.logConfig = config;
  }

  /**
   * Append a new log of type X to category X for a given token key
   *
   * @param {keyof logKeys} type type of log
   * @param {string} key key of the log e.g. token key, set name, platform name
   * @param {Log} toLog
   */
  add(type, key, toLog) {
    const map = this.getLogObject(type);
    const mapEntry = map?.get(key);
    map.set(key, [...(mapEntry ?? []), toLog]);
  }

  /**
   * Clear all logs of type X on a given token key
   *
   * @param {keyof logKeys} type
   * @param {string} key
   */
  delete(type, key) {
    this.getLogObject(type).delete(key);
  }

  /**
   * Count the amount of logs for type X
   *
   * @param {keyof logKeys} type
   */
  count(type) {
    const map = this.getLogObject(type);
    return [...map.values()].flat().length;
  }

  /**
   * Return all logs of type X
   *
   * @param {keyof logKeys} type
   */
  get(type) {
    const clone = structuredClone(this.getLogObject(type));
    return clone;
  }

  /**
   * Clear and return all logs of type X
   *
   * @param {keyof logKeys} type
   */
  flush(type) {
    const clone = this.get(type);
    this.getLogObject(type).clear();
    return clone;
  }

  /**
   * Log something.
   * How something is logged is determined by:
   *  - defaultLevel of the log: what we think the importance is
   *  - type & logConfig
   * @param {string} message
   * @param {keyof logKeys | keyof logLevels} type default = 'info' for normal logs
   *
   * provide a verbose version of your message, which will only be shown in verbose mode.
   * This also prepends a verbosity header to your log, to inform the user how to get the verbose version
   * @param {string} [messageVerbose]
   */
  log(message, type = 'info', messageVerbose) {
    if (messageVerbose) {
      // append verbosity info to logs if they have a verbose variant
      if (this.logConfig.verbosity !== verbose) {
        message += `\n${verbosityInfo}\n`;
      } else {
        message = messageVerbose;
      }
    }

    const subType = /** @type {keyof logLevels} */ (type.split('.')[0]);
    // determine log level based on config
    const level = this.logConfig[type]?.level ?? this.logConfig[subType]?.level ?? subType;

    // if the level of this log is lower than the specified threshold from config
    // don't log anything
    if (
      this.logConfig.threshold &&
      loggerValueMap[this.logConfig.threshold] > loggerValueMap[level]
    ) {
      return;
    }

    switch (level) {
      case 'throw': {
        throw new Error(message);
      }
      /* eslint-disable no-console */
      case 'error':
        console.error(`✘ ${message}`);
        break;
      case 'warn':
        console.log(chalk.rgb(255, 140, 0).bold(`⚠︎ ${message}`));
        break;
      case 'success':
        console.log(chalk.green.bold(`✔︎ ${message}`));
        break;
      case 'info':
        console.log(message);
        break;
      case 'debug':
        // TODO: a way to show logs only meant for debugging, but we currently don't have these logs
        // nor a way to turn on debug mode for a SD instance.
        // Probably color them dimmed?
        console.log(chalk.dim(message));
        break;
      /* eslint-enable no-console */
    }
  }
}
