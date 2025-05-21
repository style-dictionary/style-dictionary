import usesReferences from './references/usesReferences.js';
import { getReferences } from './references/getReferences.js';
import { resolveReferences } from './references/resolveReferences.js';
import { outputReferencesFilter } from './references/outputReferencesFilter.js';
import { outputReferencesTransformed } from './references/outputReferencesTransformed.js';
import flattenTokens from './flattenTokens.js';
import { convertTokenData } from './convertTokenData.js';
import { typeDtcgDelegate } from './typeDtcgDelegate.js';
import { convertToDTCG, convertJSONToDTCG, convertZIPToDTCG } from './convertToDTCG.js';
import { stripMeta } from './stripMeta.js';

// Public style-dictionary/utils API
export {
  usesReferences,
  getReferences,
  resolveReferences,
  outputReferencesFilter,
  outputReferencesTransformed,
  /** @deprecated */
  flattenTokens,
  typeDtcgDelegate,
  convertToDTCG,
  convertJSONToDTCG,
  convertZIPToDTCG,
  stripMeta,
  convertTokenData,
};
export * from '../common/formatHelpers/index.js';
