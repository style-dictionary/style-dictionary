import cleanFile from './cleanFile.js';

/**
 * @typedef {import('../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../types/Config.d.ts').PlatformConfig} PlatformConfig
 */

/**
 * Takes a platform config object and a dictionary
 * object and cleans all the files. Dictionary object
 * should have been transformed and resolved before this
 * point.
 * @memberOf StyleDictionary
 * @param {PlatformConfig} platform
 * @param {Volume} [vol]
 */
export default async function cleanFiles(platform, vol) {
  if (platform.files) {
    return Promise.all(
      platform.files.map((file) => {
        if (file.format) {
          return cleanFile(file, platform, vol);
        } else {
          throw new Error('Please supply a format');
        }
      }),
    );
  }
}
