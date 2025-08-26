/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

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
