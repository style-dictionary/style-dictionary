import JSON5 from 'json5';
import { extname } from 'path-unified/posix';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../resolve.js';
import { isNode } from './isNode.js';

/**
 * @typedef {import('../../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../../types/Config.d.ts').Config} Config
 * @typedef {import('../../types/DesignToken.d.ts').DesignTokens} DesignTokens
 */

/**
 * @param {string} filePath
 * @param {Volume} [vol] - Filesystem volume to use
 */
export async function loadFile(filePath, vol) {
  const volume = vol ?? fs;
  let resolvedPath = resolve(filePath, vol?.__custom_fs__);

  /** @type {DesignTokens | Config | undefined} */
  let file_content;
  let errMessage = `Failed to load or parse JSON or JS Object:\n\n`;

  switch (extname(filePath)) {
    case '.js':
    case '.mjs':
    case '.ts': {
      resolvedPath = resolve(filePath, vol?.__custom_fs__);

      if (isNode && process?.platform === 'win32') {
        // Windows FS compatibility. If in browser, we use an FS shim which doesn't require this Windows workaround
        resolvedPath = new URL(`file:///${resolvedPath}`).href;
      }
      try {
        file_content = (await import(/* @vite-ignore */ /* webpackIgnore: true */ resolvedPath))
          .default;
        try {
          file_content = structuredClone(file_content);
        } catch (_e) {
          // cloning may fail if the content is a config with dynamic not cloneable content e.g. Function
        }
      } catch (e) {
        if (e instanceof Error) {
          if ('.ts' === extname(filePath)) {
            // Add to the error message some info about experimental strip-types NodeJS flag
            errMessage += `Could not import TypeScript file: ${filePath}

Executing typescript files during runtime is only possible via
- NodeJS >= 22.6.0 with '--experimental-strip-types' flag
- NodeJS >= 22.18.0 where type stripping is enabled by default, no flag needed
- Deno
- Bun

If you are not able to satisfy the above requirements, consider transpiling the TypeScript file to plain JavaScript before running the Style Dictionary build process.`;
          } else {
            errMessage = e.message;
          }
        }
        throw new Error(`${errMessage}`);
      }
      break;
    }
    case '.json':
    case '.jsonc':
    case '.json5': {
      try {
        file_content = JSON5.parse(
          /** @type {string} */ (volume.readFileSync(resolvedPath, 'utf-8')),
        );
      } catch (e) {
        if (e instanceof Error) {
          errMessage += e.message;
        }
        throw new Error(errMessage);
      }
      break;
    }
    default: {
      // Use json parser fallback by default
      // Other file types like .hjson, .topojson, or .ndjson, might be handled with dedicated parsers in the future.
      // This warning is here to hint users that their file is parsed with the standard JSON5 parser and not any dedicated parser.
      console.warn(
        `Unrecognized file extension: ${extname(
          filePath,
        )}. Using JSON5 parser as a default. Alternatively, create a custom parser to handle this filetype https://styledictionary.com/reference/hooks/parsers/`,
      );
      file_content = JSON5.parse(
        /** @type {string} */ (volume.readFileSync(resolvedPath, 'utf-8')),
      );
    }
  }

  return file_content;
}
