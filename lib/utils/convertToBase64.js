import { fs } from 'style-dictionary/fs';
import { resolve } from '../resolve.js';
import { isNode } from './isNode.js';

// TODO: verify whether usage of `resolve` is necessary or if we can rely on
// FS to handle posix/win32 path conversion.

/**
 * @param {Buffer} buffer
 * @returns {string|Promise<string>}
 */
function toBase64(buffer) {
  if (isNode) {
    // Node.js environment
    return buffer.toString('base64');
  } else {
    // Browser environment
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = /** @type {string } */ (reader.result).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * @typedef {import('../../types/Volume.d.ts').Volume} Volume
 * Takes a file and converts it to a base64 string.
 * @private
 * @param {string} filePath - Path to the file you want base64'd
 * @param {Volume} [vol]
 * @returns {Promise<string>}
 */
export default async function convertToBase64(filePath, vol = fs) {
  if (typeof filePath !== 'string') throw new Error('Token filePath name must be a string');
  // typecast to Buffer because we know that without specifying encoding, this returns a Buffer
  // @ts-expect-error requires encoding options, this is a mistake in memfs types definition
  const body = /** @type {Buffer} */ (vol.readFileSync(resolve(filePath, vol.__custom_fs__)));
  return toBase64(body);
}
