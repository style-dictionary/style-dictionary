/**
 * @typedef {import('../../types/DesignToken.d.ts').PreprocessedTokens} PreprocessedTokens
 * @typedef {import('../../types/Config.d.ts').Config} Config
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../types/Preprocessor.d.ts').Preprocessor} Preprocessor
 */

/**
 * Run all registered preprocessors on the dictionary,
 * returning the preprocessed dictionary in each step.
 *
 * @param {PreprocessedTokens} tokens
 * @param {string[]} [appliedPreprocessors]
 * @param {Record<string, Preprocessor['preprocessor']>} [preprocessorObj]
 * @param {Config|PlatformConfig} [options]
 * @returns {Promise<PreprocessedTokens>}
 */
export async function preprocess(
  tokens,
  appliedPreprocessors = [],
  preprocessorObj = {},
  options = {},
) {
  let processedTokens = tokens;

  const preprocessors = Object.entries(preprocessorObj);
  if (preprocessors.length > 0) {
    for (const key of appliedPreprocessors) {
      const preprocessor = preprocessorObj[key];
      if (preprocessor) {
        processedTokens = await preprocessor(processedTokens, options);
      }
    }
  }

  return /** @type {PreprocessedTokens} */ (processedTokens);
}
