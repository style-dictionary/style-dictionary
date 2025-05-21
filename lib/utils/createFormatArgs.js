import deepExtend from './deepExtend.js';

/**
 * @typedef {import('../../types/DesignToken.js').Dictionary} Dictionary
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../types/Config.d.ts').Config} Options
 * @typedef {import('../../types/File.d.ts').File} File
 * @typedef {import('../../types/Format.d.ts').FormatFnArguments} FormatFnArguments
 *

/**
 * @param {FormatFnArguments} param0
 */
export default function createFormatArgs({ dictionary, platform, options, file }) {
  const { allTokens, tokens } = dictionary;
  // This will merge platform and file-level configuration
  // where the file configuration takes precedence
  const { options: fileOpts } = platform;
  const fileOptsTakenFromPlatform = /** @type {Partial<File>} */ ({ options: fileOpts });

  // we have to do some typecasting here. We assume that because deepExtends merges objects together, and "file"
  // always has the destination prop, then result will be File rather than Partial<File>, so we just typecast it.
  file = /** @type {File} */ (deepExtend([{}, fileOptsTakenFromPlatform, file]));

  return /** @type {FormatFnArguments & Dictionary} */ ({
    dictionary,
    allTokens,
    tokens,
    platform,
    file,
    options: {
      ...options,
      ...(file.options || {}),
      usesDtcg: options?.usesDtcg ?? false,
    },
  });
}
