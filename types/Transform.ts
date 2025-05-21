import type { Filter } from './Filter.js';
import type { TransformedToken } from './DesignToken.js';
import type { PlatformConfig, Config } from './Config.js';
import type { Volume } from './Volume.js';
import { transformTypes } from '../lib/enums/index.js';

interface BaseTransform<Type, Value> {
  name: string;
  type: Type;
  filter?: Filter['filter'];
  transitive?: boolean;
  transform: (
    token: TransformedToken,
    config: PlatformConfig,
    options: Config,
    vol?: Volume,
  ) => Promise<Value> | Value;
}

export type NameTransform = BaseTransform<typeof transformTypes.name, string>;
export type AttributeTransform = BaseTransform<
  typeof transformTypes.attribute,
  Record<string, unknown>
>;
export type ValueTransform = BaseTransform<typeof transformTypes.value, unknown | undefined>;

export type Transform = NameTransform | AttributeTransform | ValueTransform;
