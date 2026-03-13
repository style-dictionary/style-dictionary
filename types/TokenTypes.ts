// TODO: add type for token types
// TODO: add types for token type -> values

import { dimensionUnit } from '../lib/enums/index.js';
type dimensionUnit = typeof dimensionUnit;

export interface DimensionValue {
  value: number;
  unit: dimensionUnit[keyof dimensionUnit];
}
