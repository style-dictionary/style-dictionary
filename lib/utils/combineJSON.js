import { globSync } from '@bundled-es-modules/glob';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../resolve.js';
import deepExtend from './deepExtend.js';
import { detectDtcgSyntax } from './detectDtcgSyntax.js';
import { isNode } from './isNode.js';
import { loadFile } from './loadFile.js';

/**
 * @typedef {import('../../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../../types/DesignToken.d.ts').DesignTokens} Tokens
 * @typedef {import('../../types/DesignToken.d.ts').DesignToken} Token
 * @typedef {import('../../types/Parser.d.ts').Parser} Parser
 */

/**
 * @param {Tokens} obj
 * @param {(obj: Tokens|Token, key: keyof Tokens|Token, slice: Tokens|Token|string) => void} fn
 */
function traverseObj(obj, fn) {
  for (let key in obj) {
    const prop = obj[key];
    if (prop != null) {
      fn.apply(null, [obj, key, prop]);
      if (typeof prop === 'object') {
        traverseObj(prop, fn);
      }
    }
  }
}

/**
 * Takes an array of json files and merges
 * them together. Optionally does a deep extend.
 * @private
 * @param {string[]} arr - Array of paths to json (or node modules that export objects) files
 * @param {Boolean} [deep=false] - If it should perform a deep merge
 * @param {Function} [collision] - A function to be called when a name collision happens that isn't a normal deep merge of objects
 * @param {boolean} [source] - If json files are "sources", tag tokens
 * @param {Record<string, Omit<Parser, 'name'>>} [parsers] - Custom file parsers
 * @param {boolean} [usesDtcg] - Whether or not tokens are using DTCG syntax.
 * @param {Volume} [vol] - Filesystem volume to use
 * @returns {Promise<{tokens: Tokens, usesDtcg: boolean|undefined }>}
 */
export default async function combineJSON(
  arr,
  deep = false,
  collision,
  source = true,
  parsers = {},
  usesDtcg,
  vol,
) {
  const volume = vol ?? fs;
  /** @type {Tokens} */
  const to_ret = {};
  /** @type {string[]} */
  let files = [];

  for (let i = 0; i < arr.length; i++) {
    /** @ts-expect-error memfs's IFs type does not seem to implement readdir correctly, 2nd param seems incorrect? path-scurry throws type error on it */
    const new_files = globSync(arr[i], { fs: volume, posix: true }).sort();
    files = files.concat(new_files);
  }

  if (!isNode) {
    // adjust for browser env glob results have leading slash
    // make sure we dont remove these in Node, that would break absolute paths!!
    files = files.map((f) => f.replace(/^\//, ''));
  }

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const resolvedPath = resolve(filePath, vol?.__custom_fs__);
    let file_content = null;

    for (const { pattern, parser } of Object.values(parsers)) {
      if (filePath.match(pattern)) {
        file_content = await parser({
          contents: /** @type {string} */ (volume.readFileSync(resolvedPath, 'utf-8')),
          filePath: resolvedPath,
        });
      }
    }

    // If there is no file_content then no custom parser ran on that file
    if (!file_content) {
      file_content = /** @type {Tokens} */ (await loadFile(filePath, vol));
    }

    if (file_content) {
      if (usesDtcg === undefined) {
        usesDtcg = detectDtcgSyntax(file_content);
      }
      // Add some side data on each property to make filtering easier
      traverseObj(file_content, (obj) => {
        if (Object.hasOwn(obj, `${usesDtcg ? '$' : ''}value`) && !obj.filePath) {
          obj.filePath = filePath;

          obj.isSource = source;
        }
      });

      if (deep) {
        deepExtend([to_ret, file_content], {
          collision,
          overrideKeys: [usesDtcg ? '$value' : 'value'],
        });
      } else {
        Object.assign(to_ret, file_content);
      }
    }
  }

  return { tokens: to_ret, usesDtcg };
}
