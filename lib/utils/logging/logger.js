import chalk from 'chalk';
import { logVerbosityLevels } from '../../enums/logging/logVerbosityLevels.js';
import { logErrorLevels } from '../../enums/logging/logErrorLevels.js';
import { verbosityInfo } from '../groupMessages.js';
import { logBuiltinKeys, logLevels, logWarningLevels } from '../../enums/index.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/Logger.d.ts').LogLevels} LogLevels
 * @typedef {import('../../../types/Logger.d.ts').LogVerbosityLevels} LogVerbosityLevels
 * @typedef {import('../../../types/Logger.d.ts').LogBuiltinKeys} LogBuiltinKeys
 * @typedef {import('../../../types/Logger.d.ts').LogConfig} LogConfig
 * @typedef {import('../../../types/Logger.d.ts').LogConfigSub} LogConfigSub
 * @typedef {import('../../../types/Logger.d.ts').Log} Log
 */

const { verbose } = logVerbosityLevels;
// const { throw: logThrow } = logErrorLevels;

/** @type {Record<LogLevels, number>} */
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
   * @param {string} type
   * @param {boolean} add
   */
  getLogObject(type, add = false) {
    const entry = this.logMap?.get(type);
    if (!entry && !add) {
      throw new Error(`Log type "${type}" does not exist.`);
    }
    return entry;
  }

  /**
   * @public
   * @param {LogConfig} config
   */
  constructor(config = {}) {
    /** @type {Record<Exclude<LogLevels, typeof logLevels.silent>, Record<string, Map<string, Log[]>>>} */
    this.store = {
      throw: {},
      error: {},
      warn: {},
      success: {},
      info: {},
      debug: {},
    };

    this.initBuiltins();
    this.config = config;

    /**
     * Detect if user is using exclusively the old logging system
     * if so, we need to handle backwards compatibility for that
     */
    this.__handleBackwardsCompatibility = false;
    if (
      Object.keys(this.config).every((item) => ['warnings', 'errors', 'verbosity'].includes(item))
    ) {
      this.__handleBackwardsCompatibility = true;
    }
  }

  /**
   * @private
   */
  initBuiltins() {
    /** @type {Record<string, Map<string, Log[]>>} */
    this.store.throw = {
      references: new Map(),
    };

    /** @type {Record<string, Map<string, Log[]>>} */
    this.store.error = {
      transforms: new Map(),
    };

    /** @type {Record<string, Map<string, Log[]>>} */
    this.store.warn = {
      collisions: new Map(),
      nameCollisions: new Map(),
    };

    /** @type {Map<string, Map<string, Log[]>>} */
    this.logMap = new Map([
      [logBuiltinKeys['throw.references'], this.store.throw.references], // TODO:
      [logBuiltinKeys['error.transforms'], this.store.error.transforms], // implemented
      [logBuiltinKeys['warn.collisions'], this.store.warn.collisions], // TODO:
      [logBuiltinKeys['warn.nameCollisions'], this.store.warn.nameCollisions], // TODO:
    ]);
  }

  /**
   * Append a new log of type X to category X for a given token key
   * @public
   * @param {string} type type of log
   * @param {string} key key of the log e.g. token key, set name, platform name
   * @param {Log} toLog
   */
  add(type, key, toLog) {
    let map = this.getLogObject(type, true);

    // we're adding a log to a logging category that we haven't defined yet
    // e.g. when a subclasser or user is doing their own kinds of logging in their registered hook
    if (!map && type.split('.').length === 2) {
      const splitType = type.split('.');
      const subType = splitType[1];
      // TODO: validate parentType is of type logLevels
      const parentType = /** @type {Exclude<LogLevels, 'silent'>} */ (splitType[0]);
      const logCategory = /** @type {Record<string, Map<string, Log[]>>} */ (
        this.store[parentType]
      );
      logCategory[subType] = new Map();
      this.logMap?.set(type, logCategory[subType]);
      map = this.getLogObject(type);
    }

    const mapEntry = map?.get(key);
    map?.set(key, [...(mapEntry ?? []), toLog]);
  }

  /**
   * Clear all logs of type X on a given token key
   * @public
   * @param {LogBuiltinKeys} type
   * @param {string} key
   */
  delete(type, key) {
    this.getLogObject(type)?.delete(key);
  }

  /**
   * Count the amount of logs for type X
   * @public
   * @param {LogBuiltinKeys} type
   */
  count(type) {
    const map = this.getLogObject(type);
    return map ? [...map.values()].flat().length : 0;
  }

  /**
   * Return all logs of type X
   * @public
   * @param {LogBuiltinKeys} type
   */
  get(type) {
    const clone = structuredClone(this.getLogObject(type));
    return clone;
  }

  /**
   * Clear and return all logs of type X
   * @public
   * @param {LogBuiltinKeys} type
   */
  flush(type) {
    const clone = this.get(type);
    this.getLogObject(type)?.clear();
    return clone;
  }

  /**
   * @protected
   * @param {string} message
   */
  throw(message) {
    throw new Error(message);
  }

  /* eslint-disable no-console */
  /**
   * @protected
   * @param {string} message
   */
  error(message) {
    console.error(`✘ ${message}\n`);
  }

  /**
   * @protected
   * @param {string} message
   */
  warn(message) {
    console.log(chalk.rgb(255, 140, 0).bold(`⚠︎ ${message}\n`));
  }

  /**
   * @protected
   * @param {string} message
   */
  success(message) {
    console.log(chalk.green.bold(`✔︎ ${message}\n`));
  }

  /**
   * @protected
   * @param {string} message
   */
  info(message) {
    console.log(`${message}\n`);
  }

  /**
   * @protected
   * @param {string} message
   */
  debug(message) {
    // TODO: a way to show logs only meant for debugging, but we currently don't have these logs
    // nor a way to turn on debug mode for a SD instance.
    // Probably color them dimmed?
    console.log(`${chalk.dim(message)}\n`);
  }
  /* eslint-enable no-console */

  /**
   * @protected
   * @param {LogVerbosityLevels} verbosity
   * @param {string} message
   * @param {string} [messageVerbose]
   * @returns {string}
   */
  getMessage(verbosity, message, messageVerbose) {
    let finalMessage = message;
    if (messageVerbose) {
      // append verbosity info to logs if they have a verbose variant
      if (verbosity !== verbose) {
        finalMessage += `\n${verbosityInfo}`;
      } else {
        finalMessage = messageVerbose;
      }
    }
    return finalMessage;
  }

  /**
   * Log something.
   * How something is logged is determined by:
   *  - defaultLevel of the log: what we think the importance is
   *  - type & config
   *
   * @public
   *
   * @param {string} _message
   *
   * depending on 2 or 3 arguments, this is either the type or the verbose message
   * @param {string} [_typeOrVerbose]
   * @param {string} [_type]
   */
  log(_message, _typeOrVerbose, _type) {
    /** @type {string} */
    let type = logLevels.info;
    let verbose;
    switch (arguments.length) {
      case 3:
        type = /** @type {string} */ (_type);
        verbose = _typeOrVerbose;
        break;
      case 2:
        type = /** @type {string} */ (_typeOrVerbose);
        break;
    }

    const level = this.determineLogLevel(type);
    const verbosity = this.determineVerbosity(type);
    const message = this.getMessage(verbosity, _message, verbose);

    // if the level of this log is lower than the specified threshold from config
    // don't log anything
    if (this.config.threshold && loggerValueMap[this.config.threshold] > loggerValueMap[level]) {
      return;
    }

    if (level !== logLevels.silent) {
      this[level](message);
    }
  }

  /**
   * @private
   * @param {string} type
   */
  determineVerbosity(type) {
    const parentType = /** @type {LogLevels} */ (type.split('.')[0]);

    const grabVerbosity = /** @param {string} __type */ (__type) => {
      if (this.config[__type]) {
        const levelStringOrObject = /** @type {LogLevels|LogConfigSub} */ (this.config[__type]);
        if (typeof levelStringOrObject === 'object') {
          return levelStringOrObject.verbosity;
        }
      }
    };
    // grab the level from the most specific level of configuration e.g. `warn.collisions`,
    // or its parent as fallback e.g. `warn`
    const verbosityValue =
      grabVerbosity(type) ??
      grabVerbosity(parentType) ??
      this.config.verbosity ??
      logVerbosityLevels.default;

    return verbosityValue;
  }

  /**
   * @private
   * @param {string} type
   * @returns {LogLevels}
   */
  determineLogLevel(type) {
    const parentType = /** @type {LogLevels} */ (type.split('.')[0]);

    const grabLevel = /** @param {string} __type */ (__type) => {
      if (this.config[__type]) {
        const levelStringOrObject = /** @type {LogLevels|LogConfigSub} */ (this.config[__type]);
        if (typeof levelStringOrObject === 'string') {
          return levelStringOrObject;
        } else if (levelStringOrObject.level) {
          return levelStringOrObject.level;
        }
      }
    };

    // grab the level from the most specific level of configuration e.g. `warn.collisions`,
    // or its parent as fallback e.g. `warn`
    // when no configured level for this type of log, we fall back to info
    let level = grabLevel(type) ?? grabLevel(parentType) ?? parentType ?? logLevels.info;

    // to be removed in v6
    // if we detect that the config is exclusively using "old" system, we handle backwards compatibility
    if (this.__handleBackwardsCompatibility && level) {
      level = this.handleBackwardsCompatibilityLogs(level, type);
    }

    return level;
  }

  /**
   * @private
   * @param {LogLevels} _level
   * @param {string} type
   */
  handleBackwardsCompatibilityLogs(_level, type) {
    let level = _level;
    if (
      level === logLevels.warn &&
      this.config.warnings &&
      this.config.warnings !== logWarningLevels.warn
    ) {
      switch (this.config.warnings) {
        case logWarningLevels.disabled:
          level = logLevels.silent;
          break;
        case logWarningLevels.error:
          level = logLevels.throw;
          break;
      }
    }

    if (
      (level === logLevels.error || level === logLevels.throw) &&
      Object.keys(this.config.errors ?? {}).length > 0
    ) {
      if (
        (this.config.errors?.brokenReferences === logErrorLevels.console &&
          type === logBuiltinKeys['throw.references']) ||
        (this.config.errors?.transforms === logErrorLevels.console &&
          type === logBuiltinKeys['error.transforms'])
      ) {
        level = logLevels.info;
      }
    }
    return level;
  }
}
