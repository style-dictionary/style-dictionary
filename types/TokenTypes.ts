// TODO: add type for token types
// TODO: add types for token type -> values

import { dimensionUnit } from '../lib/enums/index.js';
export type TokenTypeDimensionUnit = (typeof dimensionUnit)[keyof typeof dimensionUnit];

export interface TokenTypeDimension {
  value: number;
  unit: TokenTypeDimensionUnit;
}
