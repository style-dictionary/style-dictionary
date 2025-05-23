/**
 * @typedef {import('../../transform/token.js').TransformError} TransformError
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 */

export class Logger {
  /**
   * @private
   */
  get keyMap() {
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

  constructor() {
    /** @type {Record<string, Map<string, Array<unknown>>>} */
    this._errors = {
      transforms: new Map(),
      references: new Map(),
    };

    this._warnings = {
      // collisions: new Map(),
      // nameCollisions: new Map(),
    };
  }

  /**
   * Append a new log of type X to category X for a given token key
   *
   * @param {string} key
   * @param {string} tokenKey
   * @param {unknown} toLog
   */
  add(key, tokenKey, toLog) {
    const map = this.keyMap.get(key);
    const mapEntry = map?.get(tokenKey);
    if (map) {
      map.set(tokenKey, [...(mapEntry ?? []), toLog]);
    }
  }

  /**
   * Clear all logs of type X on a given token key
   *
   * @param {string} key
   * @param {string} tokenKey
   */
  clear(key, tokenKey) {
    this.keyMap.get(key)?.delete(tokenKey);
  }

  /**
   * Count the amount of logs for type X for all tokens
   *
   * @param {string} key
   */
  count(key) {
    const map = this.keyMap.get(key);
    if (map) {
      return [...map.values()].flat().length;
    }

    return 0;
  }

  /**
   * Clear and return all logs of type X for all tokens
   *
   * @param {string} key
   */
  flush(key) {
    const clone = structuredClone(this.keyMap.get(key));
    this.keyMap.get(key)?.clear();
    return clone;
  }
}
