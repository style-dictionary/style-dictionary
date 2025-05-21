import type { Dictionary, TransformedToken } from './DesignToken.js';
import type { File } from './File.js';
import type { LocalOptions, Config, PlatformConfig } from './Config.js';
import { formats } from '../lib/enums/index.js';
type formats = typeof formats;

export interface FormatFnArguments {
  /**
   * The transformed and resolved dictionary object
   */
  dictionary: Dictionary;
  /**
   * The file configuration the format is called in
   */
  file: File;
  /**
   * The options object,
   */
  options: Config & LocalOptions;
  /**
   * The platform configuration the format is called in
   */
  platform: PlatformConfig;
}

/**
 * The format function receives an overloaded object as its arguments and
 * it should return a string, which will be written to a file.
 */
export type FormatFn = ((args: FormatFnArguments) => unknown | Promise<unknown>) & {
  nested?: boolean;
};

export interface Format {
  name: string | formats[keyof formats];
  format: FormatFn;
}

export type OutputReferences =
  | ((token: TransformedToken, options: { dictionary: Dictionary; usesDtcg?: boolean }) => boolean)
  | boolean;
