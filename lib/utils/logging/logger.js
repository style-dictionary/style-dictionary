import { logVerbosityLevels } from '../../enums/logVerbosityLevels.js';
import { logErrorLevels } from '../../enums/logErrorLevels.js';
import { verbosityInfo } from '../groupMessages.js';

/**
 * @typedef {import('../../transform/token.js').TransformError} TransformError
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/Config.d.ts').LogConfig} LogConfig
 */

const { verbose, silent } = logVerbosityLevels;
const { throw: logThrow } = logErrorLevels;

export class Logger {
  /**
   * @private
   */
  get logMap() {
    return new Map([
      ['errors.transforms', this._errors.transforms],
      // ['errors.references', this._errors.references],
      // ['warnings.collisions', this._warnings.collisions],
      // ['warnings.nameCollisions', this._warnings.nameCollisions],
    ]);
  }

  get errors() {
    return this._errors;
  }

  /**
   * @param {unknown} _
   */
  set errors(_) {
    throw new Error('Logger.errors is read-only.');
  }

  get warnings() {
    return this._warnings;
  }

  /**
   * @param {unknown} _
   */
  set warnings(_) {
    throw new Error('Logger.warnings is read-only.');
  }

  /**
   * @param {LogConfig} config
   */
  constructor(config) {
    /** @type {Record<string, Map<string, Array<unknown>>>} */
    this._errors = {
      transforms: new Map(),
      references: new Map(),
    };

    this._warnings = {
      // collisions: new Map(),
      // nameCollisions: new Map(),
    };

    this.logConfig = config;
  }

  /**
   * Append a new log of type X to category X for a given token key
   *
   * @param {string} type type of log
   * @param {string} key key of the log e.g. token key, set name, platform name
   * @param {unknown} toLog
   */
  add(type, key, toLog) {
    const map = this.logMap.get(type);
    const mapEntry = map?.get(key);
    if (map) {
      map.set(key, [...(mapEntry ?? []), toLog]);
    }
  }

  /**
   * Clear all logs of type X on a given token key
   *
   * @param {string} type
   * @param {string} key
   */
  clear(type, key) {
    this.logMap.get(type)?.delete(key);
  }

  /**
   * Count the amount of logs for type X for all tokens
   *
   * @param {string} type
   */
  count(type) {
    const map = this.logMap.get(type);
    if (map) {
      return [...map.values()].flat().length;
    }

    return 0;
  }

  /**
   * Clear and return all logs of type X for all tokens
   *
   * @param {string} type
   */
  flush(type) {
    const clone = structuredClone(this.logMap.get(type));
    this.logMap.get(type)?.clear();
    return clone;
  }

  /**
   * @param {'error' | 'warning' | 'notice' | 'info' | 'debug'} type
   * @param {string} message
   * @param {string} [messageVerbose]
   */
  log(type, message, messageVerbose) {
    // append verbosity info to logs if they have a verbose variant
    if (this.logConfig.verbosity !== verbose && messageVerbose) {
      message += `\n${verbosityInfo}\n`;
    }

    /**
     * {
     *   log: {
     *     'errors.transforms': {
     *       throw: true,
     *       verbosity: 'verbose',
     *       silent: 'false'
     *     }
     *   }
     * }
     */

    switch (type) {
      case 'error': {
        if (this.logConfig) throw new Error(message);

        break;
      }
    }
  }
}
