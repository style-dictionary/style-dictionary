import { fileHeaderCommentStyles } from '../../enums/index.js';

/**
 * @typedef {import('../../../types/File.d.ts').File} File
 * @typedef {import('../../../types/File.d.ts').FileHeader} FileHeader
 * @typedef {import('../../../types/File.d.ts').FormattingOptions} Formatting
 * @typedef {import('../../../types/File.d.ts').FileHeaderFormatting} FileHeaderFormatting
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

const { short, long, xml } = fileHeaderCommentStyles;

/** @type {Set<string>} Set of valid file header comment styles */
const validFileHeaderCommentStyles = new Set([short, long, xml]);

/** Known properties for formatting.fileHeader to help detect typos */
const knownFileHeaderKeys = new Set([
  'commentStyle',
  'prefix',
  'lineSeparator',
  'header',
  'footer',
  'timestamp',
]);

/** Track which deprecation warnings have already been emitted to avoid noise */
const deprecationWarningsEmitted = new Set();

/**
 * Emit a deprecation warning once per unique message.
 * @param {string} message
 */
function warnDeprecatedOnce(message) {
  if (!deprecationWarningsEmitted.has(message)) {
    deprecationWarningsEmitted.add(message);
    console.warn(`[style-dictionary] DeprecationWarning: ${message}`);
  }
}

/**
 * Reset the deprecation warnings tracker. Intended for testing only.
 * @private
 */
export function _resetDeprecationWarnings() {
  deprecationWarningsEmitted.clear();
}

/**
 * Warn about unknown keys in a formatting.fileHeader object.
 * @param {Record<string, any>} obj
 * @param {string} source - description of where the object came from
 */
function warnUnknownFileHeaderKeys(obj, source) {
  for (const key of Object.keys(obj)) {
    if (!knownFileHeaderKeys.has(key)) {
      warnDeprecatedOnce(
        `Unknown property "${key}" in ${source}. ` +
          `Valid properties are: ${[...knownFileHeaderKeys].join(', ')}.`,
      );
    }
  }
}

const defaultLineSeparator = `\n`;

/** @type {FileHeaderFormatting} */
const defaultFileHeaderFormatting = {
  lineSeparator: defaultLineSeparator,
  prefix: ` * `,
  header: `/**${defaultLineSeparator}`,
  footer: `${defaultLineSeparator} */${defaultLineSeparator}${defaultLineSeparator}`,
  timestamp: false,
};

/**
 * Resolves file header formatting options from multiple sources with proper priority.
 *
 * Priority chain (highest to lowest):
 * 1. formatting.fileHeader.* (most specific)
 * 2. file.options.formatting.fileHeader.*
 * 3. formatting.* (general formatting, for backward compatibility)
 * 4. file.options.formatting.* (legacy)
 * 5. file.options.commentStyle / options.commentStyle (legacy)
 * 6. commentStyle parameter (format's default)
 * 7. defaults
 *
 * @param {Object} opts
 * @param {File} [opts.file]
 * @param {'short' | 'xml' | 'long'} [opts.commentStyle]
 * @param {Formatting} [opts.formatting]
 * @param {Config} [opts.options]
 * @returns {FileHeaderFormatting & { commentStyle: 'short' | 'xml' | 'long' }}
 */
function resolveFileHeaderFormatting({ file, commentStyle, formatting = {}, options = {} }) {
  const fileOpts = file?.options ?? {};
  const fileFormatting = fileOpts.formatting ?? {};
  const fileHeaderOpts = formatting.fileHeader ?? {};
  const fileFileHeaderOpts = fileFormatting.fileHeader ?? {};

  // Validate formatting.fileHeader keys to catch typos early
  if (formatting.fileHeader) {
    warnUnknownFileHeaderKeys(formatting.fileHeader, 'formatting.fileHeader');
  }
  if (fileFormatting.fileHeader) {
    warnUnknownFileHeaderKeys(fileFormatting.fileHeader, 'file.options.formatting.fileHeader');
  }

  // Resolve commentStyle with priority chain.
  // Filter out 'none' from token commentStyle since it's not valid for file headers.
  const formattingCommentStyle =
    formatting.commentStyle && validFileHeaderCommentStyles.has(formatting.commentStyle)
      ? /** @type {'short' | 'long' | 'xml'} */ (formatting.commentStyle)
      : undefined;
  const fileFormattingCommentStyle =
    fileFormatting.commentStyle && validFileHeaderCommentStyles.has(fileFormatting.commentStyle)
      ? /** @type {'short' | 'long' | 'xml'} */ (fileFormatting.commentStyle)
      : undefined;

  const resolvedCommentStyle =
    fileHeaderOpts.commentStyle ??
    fileFileHeaderOpts.commentStyle ??
    formattingCommentStyle ??
    fileFormattingCommentStyle ??
    fileOpts.commentStyle ??
    options.commentStyle ??
    commentStyle ??
    long;

  // Emit deprecation warnings for legacy properties
  if (formatting.fileHeaderTimestamp !== undefined) {
    warnDeprecatedOnce(
      '`formatting.fileHeaderTimestamp` is deprecated. ' +
        'Use `formatting.fileHeader.timestamp` instead. Will be removed in v6.0.',
    );
  }
  if (fileFormatting.fileHeaderTimestamp !== undefined) {
    warnDeprecatedOnce(
      '`file.options.formatting.fileHeaderTimestamp` is deprecated. ' +
        'Use `file.options.formatting.fileHeader.timestamp` instead. Will be removed in v6.0.',
    );
  }
  if (fileOpts.commentStyle !== undefined) {
    warnDeprecatedOnce(
      '`file.options.commentStyle` is deprecated. ' +
        'Use `formatting.fileHeader.commentStyle` instead. Will be removed in v6.0.',
    );
  }
  if (options.commentStyle !== undefined) {
    warnDeprecatedOnce(
      '`options.commentStyle` (Config-level) is deprecated. ' +
        'Use `formatting.fileHeader.commentStyle` instead. Will be removed in v6.0.',
    );
  }

  // Resolve timestamp with priority chain (supporting legacy fileHeaderTimestamp)
  const resolvedTimestamp =
    fileHeaderOpts.timestamp ??
    fileFileHeaderOpts.timestamp ??
    formatting.fileHeaderTimestamp ??
    fileFormatting.fileHeaderTimestamp ??
    defaultFileHeaderFormatting.timestamp;

  // Resolve other formatting options
  const resolvedLineSeparator =
    fileHeaderOpts.lineSeparator ??
    fileFileHeaderOpts.lineSeparator ??
    formatting.lineSeparator ??
    fileFormatting.lineSeparator ??
    defaultFileHeaderFormatting.lineSeparator;

  // For prefix, header, footer: fileHeader-specific values take priority,
  // but we fall back to general formatting for backward compatibility.
  // Note: prefix does not fall back to fileFormatting.prefix because
  // getFormattingCloneWithoutPrefix() strips it before reaching here.
  const resolvedPrefix =
    fileHeaderOpts.prefix ??
    fileFileHeaderOpts.prefix ??
    formatting.prefix ??
    defaultFileHeaderFormatting.prefix;

  const resolvedHeader =
    fileHeaderOpts.header ??
    fileFileHeaderOpts.header ??
    formatting.header ??
    fileFormatting.header ??
    defaultFileHeaderFormatting.header;

  const resolvedFooter =
    fileHeaderOpts.footer ??
    fileFileHeaderOpts.footer ??
    formatting.footer ??
    fileFormatting.footer ??
    defaultFileHeaderFormatting.footer;

  return {
    commentStyle: resolvedCommentStyle,
    timestamp: resolvedTimestamp,
    lineSeparator: resolvedLineSeparator,
    prefix: resolvedPrefix,
    header: resolvedHeader,
    footer: resolvedFooter,
  };
}

/**
 * This is for creating the comment at the top of generated files with the generated at date.
 * It will use the custom file header if defined on the configuration, or use the
 * default file header.
 *
 * @memberof module:formatHelpers
 * @name fileHeader
 * @param {Object} opts
 * @param {File} [opts.file] - The file object that is passed to the format.
 * @param {'short' | 'xml' | 'long'} [opts.commentStyle] - The format's default comment style. Can be overridden via formatting.fileHeader.commentStyle or file.options.commentStyle.
 * @param {Formatting} [opts.formatting] - Custom formatting properties. Use formatting.fileHeader for file header specific options.
 * @param {Config} [opts.options] - The options object that is passed to the format.
 * @returns {Promise<string>}
 * @example
 * ```js
 * // Using the new formatting.fileHeader API
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: async function({ dictionary, file, options }) {
 *     const header = await fileHeader({
 *       file,
 *       commentStyle: 'short', // format's default
 *       formatting: options.formatting,
 *       options,
 *     });
 *     return header + dictionary.allTokens.map(token => `${token.name} = ${token.value}`).join('\n');
 *   }
 * });
 *
 * // User can override via config:
 * // options: {
 * //   formatting: {
 * //     fileHeader: {
 * //       commentStyle: 'long',
 * //       timestamp: true,
 * //     }
 * //   }
 * // }
 * ```
 */
export default async function fileHeader({ file, commentStyle, formatting = {}, options = {} }) {
  // showFileHeader is true by default
  let showFileHeader = true;
  if (typeof file?.options?.showFileHeader !== 'undefined') {
    showFileHeader = file.options.showFileHeader;
  }

  // Return empty string if the showFileHeader is false
  if (!showFileHeader) return '';

  // Resolve all formatting options with priority chain
  const resolved = resolveFileHeaderFormatting({ file, commentStyle, formatting, options });

  /** @type {FileHeader} */
  let fn = (arr) => arr ?? [];
  if (file?.options?.fileHeader && typeof file?.options?.fileHeader !== 'string') {
    fn = file.options.fileHeader;
  }

  let { prefix, lineSeparator, header, footer, timestamp } = resolved;
  const effectiveCommentStyle = resolved.commentStyle;

  // default header
  const defaultHeader = [
    `Do not edit directly, this file was auto-generated.`,
    ...(timestamp ? [`Generated on ${new Date().toUTCString()}`] : []),
  ];

  // Apply comment style specific formatting (only if not explicitly overridden).
  // Check both formatting.fileHeader and file.options.formatting.fileHeader independently
  // to avoid the ?? short-circuit hiding file-level overrides.
  const fhOpts = formatting.fileHeader ?? {};
  const fileFhOpts = file?.options?.formatting?.fileHeader ?? {};

  // Small helpers to check whether a given property has NOT been explicitly overridden.
  const isPrefixDefault = fhOpts.prefix === undefined && fileFhOpts.prefix === undefined;
  const isHeaderDefault =
    fhOpts.header === undefined &&
    fileFhOpts.header === undefined &&
    formatting.header === undefined;
  const isFooterDefault =
    fhOpts.footer === undefined &&
    fileFhOpts.footer === undefined &&
    formatting.footer === undefined;

  if (effectiveCommentStyle === short) {
    if (isPrefixDefault) prefix = `// `;
    if (isHeaderDefault) header = `${lineSeparator}`;
    if (isFooterDefault) footer = `${lineSeparator}${lineSeparator}`;
  } else if (effectiveCommentStyle === xml) {
    if (isPrefixDefault) prefix = `  `;
    if (isHeaderDefault) header = `<!--${lineSeparator}`;
    if (isFooterDefault) footer = `${lineSeparator}-->`;
  } else if (effectiveCommentStyle === long) {
    // Reconstruct header and footer with custom lineSeparator for long comment style
    if (isHeaderDefault) header = `/**${lineSeparator}`;
    if (isFooterDefault) footer = `${lineSeparator} */${lineSeparator}${lineSeparator}`;
  }

  const headerContent = await fn(defaultHeader, options);

  return `${header}${headerContent
    .map(/** @param {string} line */ (line) => `${prefix}${line}`)
    .join(lineSeparator)}${footer}`;
}
