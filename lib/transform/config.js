import isPlainObject from 'is-plain-obj';
import deepExtend from '../utils/deepExtend.js';
import GroupMessages from '../utils/groupMessages.js';
import { deepmerge } from '../utils/deepmerge.js';
import chalk from 'chalk';
import { logWarningLevels, logVerbosityLevels } from '../enums/index.js';

/**
 * @typedef {import('../StyleDictionary.js').default} StyleDictionary
 * @typedef {import('../../types/Transform.d.ts').Transform} Transform
 * @typedef {import('../../types/File.d.ts').File} File
 * @typedef {import('../../types/Action.d.ts').Action} Action
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 */

const MISSING_TRANSFORM_ERRORS = GroupMessages.GROUP.MissingRegisterTransformErrors;

/**
 * Takes a platform platformConfig object and returns a new one
 * that has filters, transforms, formats, and actions
 * mapped properly.
 * @private
 * @param {PlatformConfig} platformConfig
 * @param {StyleDictionary} dictionary
 * @param {string} platformName (only used for error messaging)
 * @returns {PlatformConfig}
 */
export default function transformConfig(platformConfig, dictionary, platformName) {
  const to_ret = { ...platformConfig }; // structuredClone not suitable due to config being able to contain Function() etc.
  to_ret.log = deepmerge(dictionary.log ?? {}, platformConfig.log ?? {});

  // The platform can both a transformGroup or an array
  // of transforms. If given a transformGroup that doesn't exist,
  // it will throw an error to make the user aware that the transformGroup doesn't
  // exist. A valid case is if the user defines neither, no transforms will be
  // applied.
  /** @type {string[]} */
  let transforms = [];
  if (to_ret.transformGroup) {
    if (dictionary.hooks.transformGroups?.[to_ret.transformGroup]) {
      transforms = dictionary.hooks.transformGroups[to_ret.transformGroup];
    } else {
      let err = `
Unknown transformGroup "${to_ret.transformGroup}" found in platform "${platformName}":
"${to_ret.transformGroup}" does not match the name of a registered transformGroup.
`;
      throw new Error(err);
    }
  }

  if (to_ret.transforms) {
    // typecast because at this point, transforms are still strings without functions
    transforms = transforms.concat(/** @type {string[]} */ (to_ret.transforms));
  }

  // Transforms are an array of strings that map to functions on
  // the StyleDictionary module. We need to map the strings to
  // the actual functions.
  to_ret.transforms = transforms.map(function (name) {
    const transform = dictionary.hooks.transforms?.[name];
    if (!transform) {
      GroupMessages.add(MISSING_TRANSFORM_ERRORS, `"${name}"`);
    }
    return /** @type {Transform} */ ({ ...transform, name });
  });

  let missingTransformCount = GroupMessages.count(MISSING_TRANSFORM_ERRORS);
  if (missingTransformCount > 0) {
    const transform_warnings = GroupMessages.flush(MISSING_TRANSFORM_ERRORS).join(', ');
    let err;

    if (missingTransformCount == 1) {
      err = `
Unknown transform ${transform_warnings} found in platform "${platformName}":
${transform_warnings} does not match the name of a registered transform.
`;
    } else {
      err = `
Unknown transforms ${transform_warnings} found in platform "${platformName}":
None of ${transform_warnings} match the name of a registered transform.
`;
    }

    throw new Error(err);
  }

  // Apply registered fileHeaders onto the platform options
  if (to_ret.options?.fileHeader) {
    const fileHeader = to_ret.options.fileHeader;
    if (typeof fileHeader === 'string') {
      if (dictionary.hooks.fileHeaders?.[fileHeader]) {
        to_ret.options.fileHeader = dictionary.hooks.fileHeaders[fileHeader];
      } else {
        throw new Error(`Can't find fileHeader: ${fileHeader}`);
      }
    } else if (typeof fileHeader !== 'function') {
      throw new Error(`fileHeader must be a string or a function`);
    } else {
      to_ret.options.fileHeader = fileHeader;
    }
  }

  if (to_ret.files) {
    to_ret.files = to_ret.files.map(function (file) {
      const ext = /** @type {File} */ ({ options: {} });
      if (file.options && file.options.fileHeader && ext.options) {
        const fileHeader = file.options.fileHeader;
        if (typeof fileHeader === 'string') {
          if (dictionary.hooks.fileHeaders?.[fileHeader]) {
            ext.options.fileHeader = dictionary.hooks.fileHeaders[fileHeader];
          } else {
            throw new Error(`Can't find fileHeader: ${fileHeader}`);
          }
        } else if (typeof fileHeader !== 'function') {
          throw new Error(`fileHeader must be a string or a function`);
        } else {
          ext.options.fileHeader = fileHeader;
        }
      }

      if (file.filter) {
        if (typeof file.filter === 'string') {
          if (dictionary.hooks.filters?.[file.filter]) {
            ext.filter = dictionary.hooks.filters[file.filter];
          } else {
            throw new Error("Can't find filter: " + file.filter);
          }
        } else if (typeof file.filter === 'object') {
          /**
           * Recursively go over the object keys of filter object and
           * return a filter Function that filters tokens
           * by the specified object keys.
           * @param {any} inputObj
           * @param {any} testObj
           * @returns {boolean}
           */
          const matchFn = function (inputObj, testObj) {
            if (isPlainObject(testObj)) {
              return Object.keys(testObj).every((key) => matchFn(inputObj[key], testObj[key]));
            } else {
              return inputObj == testObj;
            }
          };

          /**
           * @param {{[key: string]: unknown}} matchObj
           */
          const matches = function (matchObj) {
            let cloneObj = { ...matchObj }; // shallow clone, structuredClone not suitable because obj can contain "Function()"
            let matchesFn = /** @param {{[key: string]: unknown}} inputObj */ (inputObj) =>
              matchFn(inputObj, cloneObj);
            return matchesFn;
          };
          ext.filter = matches(file.filter);
        } else if (typeof file.filter === 'function') {
          ext.filter = file.filter;
        } else {
          throw new Error('Filter format not valid: ' + typeof file.filter);
        }
      }

      if (file.format) {
        /**
         * We know at this point it should be a string
         * Only later will it be transformed to contain the format function
         */
        const format = /** @type {string}  */ (file.format);
        if (dictionary.hooks.formats[format]) {
          ext.format = dictionary.hooks.formats[format];
        } else {
          throw new Error("Can't find format: " + format);
        }
      } else {
        throw new Error('Please supply a format for file: ' + JSON.stringify(file));
      }

      // destination is a required prop so we have to prefill it here, or it breaks return type
      const extended = deepExtend([{ destination: '' }, file, ext]);

      return extended;
    });
  }

  const actions = /** @type {string[]|undefined} */ (to_ret.actions) || [];
  to_ret.actions = actions.map(
    /** @param {string} action */ function (action) {
      if (typeof dictionary.hooks.actions?.[action].undo !== 'function') {
        const message = `${action} action does not have a clean function!`;
        if (to_ret.log?.warnings === logWarningLevels.error) {
          throw new Error(message);
        } else if (to_ret.log?.verbosity !== logVerbosityLevels.silent) {
          // eslint-disable-next-line no-console
          console.log(chalk.rgb(255, 140, 0).bold(message));
        }
      }
      // TODO: we assume it exists, but perhaps we should check and throw error if action cannot be found
      return /** @type {Omit<Action, "name">} */ (dictionary.hooks.actions?.[action]);
    },
  );

  return to_ret;
}
