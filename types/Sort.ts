import type { TransformedToken } from './DesignToken.js';
import { builtInSorts } from '../lib/enums/sorts.js';

export type BuiltInSorts = typeof builtInSorts;

export type SortComparator = (a: TransformedToken, b: TransformedToken) => number;

export interface Sort {
  name: string;
  sort: SortComparator;
}

/**
 * A single sort function - either a built-in sort referenced by name string or a custom comparator function
 * for inline usage
 */
export type SortFn = string | SortComparator;

/**
 * Sort option for formattedVariables - can be a single sort item or an array of sort items
 * (for chaining multiple sorts as tie-breakers)
 */
export type SortOption = SortFn | SortFn[];
