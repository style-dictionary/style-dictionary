import { fs } from 'style-dictionary/fs';

/**
 * @typedef {import('../../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../types/Config.d.ts').Config} Config
 */

/**
 * Performs the undo of any actions defined in a platform. Pretty
 * simple really. Actions should be an array of functions,
 * the calling function should map the functions accordingly.
 * @static
 * @private
 * @memberof module:style-dictionary
 * @param {Dictionary} dictionary
 * @param {PlatformConfig} platform
 * @param {Config} options
 * @param {Volume} [vol]
 */
export default async function cleanActions(dictionary, platform, options, vol = fs) {
  if (platform.actions) {
    return Promise.all(
      platform.actions.map((action) => {
        if (typeof action !== 'string' && typeof action.undo === 'function') {
          return action.undo(dictionary, platform, options, vol);
        }
      }),
    );
  }
}
