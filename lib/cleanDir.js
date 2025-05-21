import chalk from 'chalk';
import { dirname, join } from 'path-unified/posix';
import { fs } from 'style-dictionary/fs';
import { logVerbosityLevels } from './enums/index.js';

/**
 * @typedef {import('../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../types/Config.d.ts').PlatformConfig} Config
 * @typedef {import('../types/File.d.ts').File} File
 */

/**
 * Takes the style property object and a format and returns a
 * string that can be written to a file.
 * @memberOf StyleDictionary
 * @param {File} file
 * @param {Config} [platform]
 * @param {Volume} [vol]
 */
export default async function cleanDir(file, platform = {}, vol = fs) {
  let { destination } = file;

  if (typeof destination !== 'string') throw new Error('Please enter a valid destination');

  // if there is a clean path, prepend the destination with it
  if (platform.buildPath) {
    destination = join(platform.buildPath, destination);
  }

  let dir = dirname(destination.replace(/\\/g, '/'));

  while (dir) {
    if (vol.existsSync(dir)) {
      const dirContents = vol.readdirSync(dir, 'buffer');
      if (dirContents.length === 0) {
        if (platform.log?.verbosity !== logVerbosityLevels.silent) {
          // eslint-disable-next-line no-console
          console.log(chalk.bold.red('-') + ' ' + dir);
        }
        vol.rmSync(dir, { recursive: true });
      } else {
        break;
      }
    }

    const splitDir = dir.split('/');
    splitDir.pop();
    dir = splitDir.join('/');
  }
}
