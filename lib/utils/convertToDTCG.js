import isPlainObject from 'is-plain-obj';
import {
  BlobReader,
  TextWriter,
  ZipReader,
  ZipWriter,
  BlobWriter,
  TextReader,
} from '@zip.js/zip.js';
import { fs } from 'style-dictionary/fs';

/**
 * @typedef {import('@zip.js/zip.js').FileEntry} Entry
 * @typedef {import('../../types/DesignToken.d.ts').DesignToken} DesignToken
 * @typedef {import('../../types/DesignToken.d.ts').DesignTokens} DesignTokens
 */

/**
 * @param {DesignTokens} slice
 * @param {{applyTypesToGroup?: boolean}} [opts]
 */
function recurse(slice, opts) {
  // we use a Set to avoid duplicate values
  /** @type {Set<string>} */
  let types = new Set();

  // this slice within the dictionary is a design token
  // Check for $value in case the input is already DTCG syntax
  if (Object.hasOwn(slice, 'value') || Object.hasOwn(slice, '$value')) {
    const token = /** @type {DesignToken} */ (slice);
    Object.keys(token).forEach((key) => {
      if (['type', '$type'].includes(key)) {
        // track the encountered types for this layer
        types.add(/** @type {string} */ (token[key]));
      }
      // convert to $ prefixed properties
      if (['type', 'description', 'value'].includes(key)) {
        token[`$${key}`] = token[key];
        delete token[key];
      }
    });
    return types;
  } else {
    // token group, not a token
    // go through all props and call itself recursively for object-value props
    Object.keys(slice).forEach((key) => {
      const prop = slice[key];
      if (isPlainObject(prop)) {
        // call Set again to dedupe the accumulation of the two sets
        types = new Set([...types, ...recurse(prop, opts)]);
      }
    });

    // Now that we've checked every property, let's see how many types we found
    // If it's only 1 type, we know we can apply the type on the ancestor group
    // and remove it from the children
    if (types.size === 1 && opts?.applyTypesToGroup !== false) {
      const groupType = [...types][0];
      const entries = Object.entries(slice).map(([key, value]) => {
        if (isPlainObject(value)) {
          // remove the type from the child
          delete value.$type;
        }
        return /** @type {[string, DesignToken|DesignTokens]} */ ([key, value]);
      });

      Object.keys(slice).forEach((key) => {
        delete slice[key];
      });
      // put the type FIRST
      slice.$type = groupType;
      // then put the rest of the key value pairs back, now we always ordered $type first on the token group
      entries.forEach(([key, value]) => {
        if (key !== '$type') {
          slice[key] = value;
        }
      });
    }
  }
  return types;
}

/**
 * @param {DesignTokens} dictionary
 * @param {{applyTypesToGroup?: boolean}} [opts]
 */
export function convertToDTCG(dictionary, opts) {
  // making a copy, so we don't mutate the original input
  // this makes for more predictable API (input -> output)
  const copy = structuredClone(dictionary);
  recurse(copy, opts);
  return copy;
}

/**
 * @param {Entry} entry
 */
export async function resolveZIPEntryData(entry) {
  let data;
  if (entry.getData) {
    data = await entry.getData(new TextWriter('utf-8'));
  }
  return [entry.filename, data];
}

/**
 * @param {Blob} zipBlob
 * @returns {Promise<Record<string, string>>}
 */
export async function readZIP(zipBlob) {
  const zipReader = new ZipReader(new BlobReader(zipBlob));
  const zipEntries = await zipReader.getEntries({
    filenameEncoding: 'utf-8',
  });
  const zipEntriesWithData = /** @type {string[][]} */ (
    (
      await Promise.all(
        zipEntries.filter((entry) => !entry.directory).map((entry) => resolveZIPEntryData(entry)),
      )
    ).filter((entry) => !!entry[1])
  );
  return Object.fromEntries(zipEntriesWithData);
}

/**
 *
 * @param {Record<string, string>} zipEntries
 */
export async function writeZIP(zipEntries) {
  const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
  await Promise.all(
    Object.entries(zipEntries).map(([key, value]) => zipWriter.add(key, new TextReader(value))),
  );
  // Close zip and return Blob
  return zipWriter.close();
}

/**
 * @param {Blob|string} blobOrPath
 * @param {string} type
 */
async function blobify(blobOrPath, type) {
  if (typeof blobOrPath === 'string') {
    const buf = /** @type {Buffer<ArrayBuffer>} */ (await fs.promises.readFile(blobOrPath));
    return new Blob([buf], { type });
  }
  return blobOrPath;
}

/**
 * @param {Blob} blob
 * @param {string} type
 * @param {string} [path]
 */
function validateBlobType(blob, type, path) {
  if (!blob.type.includes(type)) {
    throw new Error(
      `File ${path ?? '(Blob)'} is of type ${blob.type}, but a ${type} type blob was expected.`,
    );
  }
}

/**
 * @param {Blob|string} blobOrPath
 * @param {{applyTypesToGroup?: boolean}} [opts]
 */
export async function convertJSONToDTCG(blobOrPath, opts) {
  const jsonBlob = await blobify(blobOrPath, 'application/json');
  validateBlobType(jsonBlob, 'json', typeof blobOrPath === 'string' ? blobOrPath : undefined);

  const fileContent = await jsonBlob.text();
  const converted = JSON.stringify(convertToDTCG(JSON.parse(fileContent), opts), null, 2);
  return new Blob([converted], {
    type: 'application/json',
  });
}

/**
 * @param {Blob|string} blobOrPath
 * @param {{applyTypesToGroup?: boolean}} [opts]
 */
export async function convertZIPToDTCG(blobOrPath, opts) {
  const zipBlob = await blobify(blobOrPath, 'application/zip');
  validateBlobType(zipBlob, 'zip', typeof blobOrPath === 'string' ? blobOrPath : undefined);
  const zipObjectWithData = await readZIP(zipBlob);

  const convertedZipObject = Object.fromEntries(
    Object.entries(zipObjectWithData).map(([fileName, data]) => [
      fileName,
      JSON.stringify(convertToDTCG(JSON.parse(data), opts), null, 2),
    ]),
  );

  const zipBlobOut = await writeZIP(convertedZipObject);

  return zipBlobOut;
}
