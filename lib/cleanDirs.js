import cleanDir from './cleanDir.js';

/**
 * @typedef {import('../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../types/Config.d.ts').PlatformConfig} Config
 */

/**
 * Takes a platform config object and a tokens
 * object and cleans all the files. Tokens object
 * should have been transformed and resolved before this
 * point.
 * @memberOf StyleDictionary
 * @param {Config} platform
 * @param {Volume} [vol]
 */
export default async function cleanDirs(platform, vol) {
  if (platform.files) {
    return Promise.all(
      platform.files?.map((file) => {
        if (file.format) {
          return cleanDir(file, platform, vol);
        } else {
          throw new Error('Please supply a format');
        }
      }),
    );
  }
}
