import type { TransformedToken } from './DesignToken.js';
import type { Config } from './Config.js';

export interface Filter {
  name: string;
  filter: (token: TransformedToken, options: Config) => boolean | Promise<boolean>;
}
