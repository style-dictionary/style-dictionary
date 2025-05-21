import type { Dictionary } from './DesignToken.js';
import type { PlatformConfig, Config } from './Config.js';
import type { Volume } from './Volume.js';

export interface Action {
  name: string;
  /** The action in the form of a function. */
  do(
    dictionary: Dictionary,
    config: PlatformConfig,
    options: Config,
    vol: Volume,
  ): void | Promise<void>;

  /** A function that undoes the action. */
  undo?(
    dictionary: Dictionary,
    config: PlatformConfig,
    options: Config,
    vol: Volume,
  ): void | Promise<void>;
}
