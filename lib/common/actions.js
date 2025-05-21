import { join } from 'path-unified/posix';
import { fs } from 'style-dictionary/fs';
import { logVerbosityLevels, actions } from '../enums/index.js';

/**
 * @typedef {import('../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../types/Action.d.ts').Action} Action
 * @typedef {import('../../types/Config.js').PlatformConfig} Config
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} Token
 */

const { androidCopyImages, copyAssets } = actions;
const { silent } = logVerbosityLevels;

/**
 * @param {Config} config
 */
function getAssetDir(config) {
  return join(config.buildPath ?? '', 'android/main/res/drawable-').replace(/\\/g, '/');
}

/**
 * @param {Token} token
 * @param {string} imagesDir
 */
function getAssetPath(token, imagesDir) {
  const name = token.path.slice(2, 4).join('_');
  const dir = `${imagesDir}${token.attributes?.state}`;
  return { file: join(dir, `${name}.png`), dir };
}

/**
 * @namespace Actions
 * @type {Record<string, Omit<Action, 'name'>>}
 */
export default {
  /**
   * Action to copy images into appropriate android directories.
   *
   * @memberof Actions
   */
  [androidCopyImages]: {
    do: async function (dictionary, config, options, vol = fs) {
      const imagesDir = getAssetDir(config);
      /**
       * @param {Token} token
       */
      await Promise.all(
        dictionary.allTokens.map((token) => {
          if (token.type === 'asset') {
            const { file, dir } = getAssetPath(token, imagesDir);
            return vol.promises.mkdir(dir, { recursive: true }).then(() => {
              return vol.promises.copyFile(options.usesDtcg ? token.$value : token.value, file);
            });
          }
        }),
      );
    },
    undo: async function (dictionary, config, _, vol = fs) {
      const imagesDir = getAssetDir(config);
      /**
       * @param {Token} token
       */
      await Promise.all(
        dictionary.allTokens.map((token) => {
          if (token.type === 'asset') {
            const { file } = getAssetPath(token, imagesDir);
            return vol.promises.unlink(file);
          }
        }),
      );
    },
  },

  /**
   * Action that copies everything in the assets directory to a new assets directory in the build path of the platform.
   *
   * @memberof Actions
   */
  [copyAssets]: {
    do: async function (_, config, _options, vol = fs) {
      const assetsPath = join(config.buildPath ?? '', 'assets');
      if (config.log?.verbosity !== silent) {
        // eslint-disable-next-line no-console
        console.log(`Copying assets directory to ${assetsPath}`);
      }
      return vol.promises.cp(
        'assets',
        assetsPath,
        // @ts-expect-error ICpOptions requires other props, this is a mistake in memfs types definition
        {
          recursive: true,
        },
      );
    },
    undo: async function (_, config, _options, vol = fs) {
      const assetsPath = join(config.buildPath ?? '', 'assets');
      if (config.log?.verbosity !== silent) {
        // eslint-disable-next-line no-console
        console.log(`Removing assets directory from ${assetsPath}`);
      }
      return vol.promises.rmdir(assetsPath, { recursive: true });
    },
  },
};
