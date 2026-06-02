import transformBuiltins from './common/transforms.js';
import transformGroupBuiltins from './common/transformGroups.js';
import formatBuiltins from './common/formats.js';
import actionBuiltins from './common/actions.js';
import filterBuiltins from './common/filters.js';
import { deepmerge } from './utils/deepmerge.js';
import { transformTypes } from './enums/index.js';

/**
 * @typedef {import('../types/File.d.ts').FileHeader} FileHeader
 * @typedef {import('../types/Parser.d.ts').Parser} Parser
 * @typedef {import('../types/Preprocessor.d.ts').Preprocessor} Preprocessor
 * @typedef {import('../types/Transform.d.ts').Transform} Transform
 * @typedef {import('../types/Filter.d.ts').Filter} Filter
 * @typedef {import('../types/Format.d.ts').Format} Format
 * @typedef {import('../types/Action.d.ts').Action} Action
 * @typedef {import('../types/Config.d.ts').Hooks} Hooks
 */

const { value: transformTypeValue, name: transformTypeName, attribute } = transformTypes;

/**
 * @return {Required<Hooks>}
 */
function getBuiltinHooks() {
  return {
    parsers: {},
    preprocessors: {},
    transformGroups: {
      ...transformGroupBuiltins,
    },
    transforms: {
      ...transformBuiltins,
    },
    formats: {
      ...formatBuiltins,
    },
    fileHeaders: {},
    filters: {
      ...filterBuiltins,
    },
    actions: {
      ...actionBuiltins,
    },
  };
}

export class Register {
  /**
   * Below is a ton of boilerplate. Explanation:
   *
   * You can register things on the StyleDictionary class level e.g. StyleDictionary.registerFormat()
   * You can also register these things on StyleDictionary instance (through config) or on StyleDictionary instance's platform property.
   *
   * Therefore, we have to make use of static props vs instance props and use getters and setters to merge these together.
   */
  static hooks = getBuiltinHooks();

  constructor() {
    this.hooks = Register.hooks;
  }

  /** @type {Required<Hooks>} */
  get hooks() {
    const ctor = /** @type {typeof Register} */ (this.constructor);
    return deepmerge(ctor.hooks, this._hooks ?? {});
  }

  /**
   * @param {Required<Hooks>} v
   */
  set hooks(v) {
    this._hooks = v;
  }

  /**
   * @param {typeof Register | Register} target
   * @param {keyof Hooks} hook
   * @param {string} name
   */
  static deleteExistingHook(target, hook, name) {
    // if it's already registered, delete it so the new one overrides
    if (target.hooks[hook][name]) {
      delete target.hooks[hook][name];
    }
  }

  /**
   * @param {Transform} cfg
   */
  static registerTransform(cfg) {
    // this = class
    this.__registerTransform(cfg, this);
  }

  /**
   * @param {Transform} cfg
   */
  registerTransform(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerTransform(cfg, this);
  }

  /**
   * @param {Transform} transform
   * @param {typeof Register | Register} target
   */
  static __registerTransform(transform, target) {
    const transformTypeValues = [transformTypeName, transformTypeValue, attribute];
    const { type, name, filter, transitive, transform: transformFn } = transform;
    if (typeof type !== 'string') throw new Error('type must be a string');
    if (transformTypeValues.indexOf(type) < 0)
      throw new Error(type + ' type is not one of: ' + transformTypeValues.join(', '));
    if (typeof name !== 'string') throw new Error('name must be a string');
    if (filter && typeof filter !== 'function') throw new Error('filter must be a function');
    if (typeof transformFn !== 'function') throw new Error('transform must be a function');
    this.deleteExistingHook(target, 'transforms', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(target.hooks, {
      transforms: {
        [name]: {
          type,
          filter,
          transitive: !!transitive,
          transform: transformFn,
        },
      },
    });
    return this;
  }

  /**
   * @param {{ name: string; transforms: string[]; }} cfg
   */
  static registerTransformGroup(cfg) {
    // this = class
    this.__registerTransformGroup(cfg, this);
  }

  /**
   * @param {{ name: string; transforms: string[]; }} cfg
   */
  registerTransformGroup(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerTransformGroup(cfg, this);
  }

  /**
   * @param {{ name: string; transforms: string[]; }} transformGroup
   * @param {typeof Register | Register} target
   */
  static __registerTransformGroup(transformGroup, target) {
    const { name, transforms } = transformGroup;
    if (typeof name !== 'string') throw new Error('transform name must be a string');
    if (!Array.isArray(transforms))
      throw new Error('transforms must be an array of registered value transforms');

    transforms.forEach((t) => {
      if (!target.hooks.transforms || !(t in target.hooks.transforms))
        throw new Error('transforms must be an array of registered value transforms');
    });
    this.deleteExistingHook(target, 'transformGroups', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        transformGroups: {
          [name]: transforms,
        },
      }),
    );
    return target;
  }

  /**
   * @param {Format} cfg
   */
  static registerFormat(cfg) {
    // this = class
    this.__registerFormat(cfg, this);
  }

  /**
   * @param {Format} cfg
   */
  registerFormat(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerFormat(cfg, this);
  }

  /**
   * @param  {Format} format
   * @param {typeof Register | Register} target
   */
  static __registerFormat(format, target) {
    const { name, format: formatFn } = format;
    if (typeof name !== 'string')
      throw new Error("Can't register format; format.name must be a string");
    if (typeof formatFn !== 'function')
      throw new Error("Can't register format; format.format must be a function");
    this.deleteExistingHook(target, 'formats', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        formats: {
          [name]: formatFn,
        },
      }),
    );
    return target;
  }

  /**
   * @param {Action} cfg
   */
  static registerAction(cfg) {
    // this = class
    this.__registerAction(cfg, this);
  }

  /**
   * @param {Action} cfg
   */
  registerAction(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerAction(cfg, this);
  }

  /**
   * @param {Action} action
   * @param {typeof Register | Register} target
   */
  static __registerAction(action, target) {
    const { name, do: _do, undo } = action;
    if (typeof name !== 'string') throw new Error('name must be a string');
    if (typeof _do !== 'function') throw new Error('do must be a function');
    this.deleteExistingHook(target, 'actions', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(target.hooks, {
      actions: {
        [name]: {
          do: _do,
          undo,
        },
      },
    });
    return target;
  }

  /**
   * @param {Filter} cfg
   */
  static registerFilter(cfg) {
    // this = class
    this.__registerFilter(cfg, this);
  }

  /**
   * @param {Filter} cfg
   */
  registerFilter(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerFilter(cfg, this);
  }

  /**
   * @param {Filter} filter
   * @param {typeof Register | Register} target
   */
  static __registerFilter(filter, target) {
    const { name, filter: filterFn } = filter;
    if (typeof name !== 'string')
      throw new Error("Can't register filter; filter.name must be a string");
    if (typeof filterFn !== 'function')
      throw new Error("Can't register filter; filter.filter must be a function");
    this.deleteExistingHook(target, 'filters', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        filters: {
          [name]: filterFn,
        },
      }),
    );
    return target;
  }

  /**
   * @param {Parser} cfg
   */
  static registerParser(cfg) {
    // this = class
    this.__registerParser(cfg, this);
  }

  /**
   * @param {Parser} cfg
   */
  registerParser(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerParser(cfg, this);
  }

  /**
   * @param {Parser} parser
   * @param {typeof Register | Register} target
   */
  static __registerParser(parser, target) {
    const { name, pattern, parser: parserFn } = parser;
    if (typeof name !== 'string')
      throw new Error("Can't register parser; parser.name must be a string");
    if (!(pattern instanceof RegExp))
      throw new Error(`Can't register parser; parser.pattern must be a regular expression`);
    if (typeof parserFn !== 'function')
      throw new Error("Can't register parser; parser.parser must be a function");
    this.deleteExistingHook(target, 'parsers', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        parsers: {
          [name]: {
            pattern,
            parser: parserFn,
          },
        },
      }),
    );
    return target;
  }

  /**
   * @param {Preprocessor} cfg
   */
  static registerPreprocessor(cfg) {
    // this = class
    this.__registerPreprocessor(cfg, this);
  }

  /**
   * @param {Preprocessor} cfg
   */
  registerPreprocessor(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerPreprocessor(cfg, this);
  }

  /**
   * @param {Preprocessor} cfg
   * @param {typeof Register | Register} target
   */
  static __registerPreprocessor(cfg, target) {
    const { name, preprocessor } = cfg;
    const errorPrefix = 'Cannot register preprocessor;';
    if (typeof name !== 'string')
      throw new Error(`${errorPrefix} Preprocessor.name must be a string`);
    if (!(preprocessor instanceof Function)) {
      throw new Error(`${errorPrefix} Preprocessor.preprocessor must be a function`);
    }
    this.deleteExistingHook(target, 'preprocessors', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        preprocessors: {
          [name]: preprocessor,
        },
      }),
    );
    return target;
  }

  /**
   * @param {{name: string; fileHeader: FileHeader;}} cfg
   */
  static registerFileHeader(cfg) {
    // this = class
    this.__registerFileHeader(cfg, this);
  }

  /**
   * @param {{name: string; fileHeader: FileHeader;}} cfg
   */
  registerFileHeader(cfg) {
    // this = instance
    /** @type {typeof Register} */ (this.constructor).__registerFileHeader(cfg, this);
  }

  /**
   * @param {{name: string; fileHeader: FileHeader;}} cfg
   * @param {typeof Register | Register} target
   */
  static __registerFileHeader(cfg, target) {
    const { name, fileHeader } = cfg;
    if (typeof name !== 'string')
      throw new Error("Can't register file header; options.name must be a string");
    if (typeof fileHeader !== 'function')
      throw new Error("Can't register file header; options.fileHeader must be a function");
    this.deleteExistingHook(target, 'fileHeaders', name);

    // make sure to trigger the setter
    target.hooks = deepmerge(
      target.hooks,
      /** @type {Partial<Required<Hooks>>} */ ({
        fileHeaders: {
          [name]: fileHeader,
        },
      }),
    );
    return target;
  }
}
