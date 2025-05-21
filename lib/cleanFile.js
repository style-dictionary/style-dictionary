import chalk from 'chalk';
import { join } from 'path-unified/posix';
import { fs } from 'style-dictionary/fs';

/**
 * @typedef {import('../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../types/File.d.ts').File} File
 * @typedef {import('../types/Config.d.ts').PlatformConfig} PlatformConfig
 */

/**
 * Async method for checking if a file exists.
 * Since there is no promises.exists method in Node.js...
 * @param {Volume} vol
 * @param {string} file
 */
async function exists(vol, file) {
  try {
    await vol.promises.access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Takes the style property object and a format and returns a
 * string that can be written to a file.
 * @memberOf StyleDictionary
 * @param {File} file
 * @param {PlatformConfig} [platform]
 * @param {Volume} [vol]
 */
export default async function cleanFile(file, platform = {}, vol = fs) {
  let { destination } = file;

  if (typeof destination !== 'string') throw new Error('Please enter a valid destination');
  if (!destination) {
    return;
  }

  // if there is a clean path, prepend the destination with it
  if (platform.buildPath) {
    destination = join(platform.buildPath, destination);
  }
  destination = destination.replace(/\\/g, '/');

  const fileExists = await exists(vol, destination);
  let msg;
  if (fileExists) {
    await vol.promises.unlink(destination);
    msg = chalk.bold.red('-') + ' ' + destination;
  } else {
    msg = chalk.bold.red('!') + ' ' + destination + ', does not exist';
  }
  return msg;
}
