import usesReferences from '../../utils/references/usesReferences.js';
import { getReferences } from '../../utils/references/getReferences.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 */

/**
 * Applies reference-safe ordering to a pre-sorted token array.
 * This function enforces define-before-use semantics when outputReferences=true,
 * while preserving the user's existing sort order as much as possible.
 *
 * Algorithm: Stable topological sort using Kahn's algorithm variant.
 * - Builds a dependency graph from token references
 * - Processes nodes in topological order, but when multiple nodes are available
 *   (no dependencies), chooses the one that appears earliest in the original sorted order
 * - Handles cycles by keeping original order for cycle participants
 * - Ignores references to tokens not in sortedTokens
 *
 * @memberof module:formatHelpers
 * @param {Token[]} sortedTokens - Tokens already sorted by user sorters
 * @param {Tokens} tokens - Full token dictionary for reference resolution
 * @param {{unfilteredTokens?: Tokens, usesDtcg?: boolean}} [opts] - Options
 * @returns {Token[]} - Reference-safe ordered tokens, preserving original order when possible
 *
 * @example
 * ```javascript
 * const userSorted = [tokenC, tokenD, tokenA, tokenB];
 * // tokenA references tokenB, tokenC references tokenA
 * const safeOrdered = applyReferenceSafeOrdering(userSorted, tokens, { usesDtcg: false });
 * // Result: [tokenB, tokenA, tokenC, tokenD] (minimal reordering)
 * ```
 */
export default function applyReferenceSafeOrdering(sortedTokens, tokens, opts = {}) {
  const { unfilteredTokens, usesDtcg = false } = opts;
  const valueKey = usesDtcg ? '$value' : 'value';

  // Early return if no tokens
  if (sortedTokens.length === 0) {
    return sortedTokens;
  }

  // Build a map from token name to token for O(1) lookups
  const tokenMap = new Map();
  for (const token of sortedTokens) {
    if (token && token.name) {
      tokenMap.set(token.name, token);
    }
  }

  // Build a map from token name to its original index in sortedTokens
  // This preserves stability: when multiple tokens are available, choose the earliest one
  const originalIndex = new Map();
  sortedTokens.forEach((token, idx) => {
    if (token && token.name) {
      originalIndex.set(token.name, idx);
    }
  });

  // Build dependency graph: for each token, collect its dependencies (tokens it references)
  // dependencies[tokenName] = Set of token names that this token depends on
  const dependencies = new Map();
  const dependents = new Map(); // Reverse: dependents[tokenName] = Set of tokens that depend on this token

  // Initialize maps
  for (const token of sortedTokens) {
    if (!token || !token.name) continue;
    dependencies.set(token.name, new Set());
    dependents.set(token.name, new Set());
  }

  // Populate dependencies by extracting references from each token
  for (const token of sortedTokens) {
    if (!token || !token.name || !token.original) continue;

    const originalValue = token.original[valueKey];
    if (originalValue == null) continue;

    // Check if this token uses references
    if (!usesReferences(originalValue)) continue;

    // Get all references for this token
    const refs = getReferences(originalValue, tokens, {
      unfilteredTokens,
      usesDtcg,
      warnImmediately: false,
    });

    // Only consider references that are in sortedTokens
    for (const ref of refs) {
      if (ref && ref.name && tokenMap.has(ref.name)) {
        // token depends on ref
        dependencies.get(token.name).add(ref.name);
        // ref is depended upon by token
        dependents.get(ref.name).add(token.name);
      }
    }
  }

  // Kahn's algorithm with stable ordering
  // inDegree[tokenName] = number of dependencies that haven't been processed yet
  const inDegree = new Map();
  for (const token of sortedTokens) {
    if (!token || !token.name) continue;
    inDegree.set(token.name, dependencies.get(token.name).size);
  }

  // Priority queue: tokens with no remaining dependencies, ordered by original index
  // We use an array and sort it by originalIndex to maintain stability
  const available = /** @type {string[]} */ ([]);
  for (const token of sortedTokens) {
    if (!token || !token.name) continue;
    if (inDegree.get(token.name) === 0) {
      available.push(token.name);
    }
  }

  // Sort available tokens by their original index to maintain stability
  available.sort((a, b) => originalIndex.get(a) - originalIndex.get(b));

  const result = [];
  const processed = new Set();

  let head = 0;

  // Sort only the active segment (head..end) to avoid breaking the head pointer semantics.
  function sortAvailableActive() {
    const activeLen = available.length - head;
    if (activeLen <= 1) return;

    const active = available.slice(head);
    active.sort((a, b) => originalIndex.get(a) - originalIndex.get(b));

    // Keep consumed prefix intact; replace only the active part.
    available.length = head;
    available.push(...active);
  }

  // Process tokens in topological order
  // Continue until all tokens are processed, even if available queue is empty (handles cycles)
  while (processed.size < tokenMap.size) {
    let tokenName = head < available.length ? available[head++] : undefined;

    // If no available tokens but unprocessed remain, pick earliest unprocessed token
    // This handles cycles and ensures all tokens are processed
    if (!tokenName) {
      for (const token of sortedTokens) {
        if (token && token.name && tokenMap.has(token.name) && !processed.has(token.name)) {
          tokenName = token.name;
          break;
        }
      }
    }

    if (!tokenName || processed.has(tokenName)) continue;

    const token = tokenMap.get(tokenName);
    if (!token) continue;

    result.push(token);
    processed.add(tokenName);

    // Decrease in-degree for all dependents
    const tokenDependents = dependents.get(tokenName);
    let didEnqueue = false;
    if (tokenDependents) {
      for (const dependentName of tokenDependents) {
        const currentInDegree = inDegree.get(dependentName);
        if (currentInDegree !== undefined && currentInDegree > 0) {
          const newInDegree = currentInDegree - 1;
          inDegree.set(dependentName, newInDegree);

          // If this dependent now has no remaining dependencies, add it to available
          if (newInDegree === 0) {
            available.push(dependentName);
            didEnqueue = true;
          }
        }
      }
    }

    // Re-sort to maintain stability (only when multiple items to avoid unnecessary sorting)
    if (didEnqueue && available.length - head > 1) {
      sortAvailableActive();
    }
  }

  return result;
}
