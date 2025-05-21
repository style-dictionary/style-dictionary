import type { PreprocessedTokens } from './DesignToken.js';
import type { Config, PlatformConfig } from './Config.js';

export type Preprocessor = {
  name: string;
  preprocessor: (
    dictionary: PreprocessedTokens,
    options: Config | PlatformConfig,
  ) => PreprocessedTokens | Promise<PreprocessedTokens>;
};
