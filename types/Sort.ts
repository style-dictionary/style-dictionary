import type { TransformedToken } from './DesignToken.js';
import { builtInSorts } from '../lib/enums/sorts.js';

export type BuiltInSorts = typeof builtInSorts;

// register by name, to be implemented
export interface Sort {
  name: string;
  sort: SortFn;
}

/**
 * A single sort function - either a built-in sort referenced by name string or a custom comparator function
 * for inline usage
 */
export type SortFn = string | ((a: TransformedToken, b: TransformedToken) => number);

/**
 * Sort option for formattedVariables - can be a single sort item or an array of sort items
 * (for chaining multiple sorts as tie-breakers)
 */
export type SortOption = SortFn | SortFn[];
