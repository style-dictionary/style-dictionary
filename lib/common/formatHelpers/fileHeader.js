import { fileHeaderCommentStyles } from '../../enums/index.js';

/**
 * @typedef {import('../../../types/File.d.ts').File} File
 * @typedef {import('../../../types/File.d.ts').FileHeader} FileHeader
 * @typedef {import('../../../types/File.d.ts').FormattingOptions} Formatting
 * @typedef {import('../../../types/File.d.ts').FileHeaderFormatting} FileHeaderFormatting
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

const { short, long, xml } = fileHeaderCommentStyles;

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

  // Resolve commentStyle with priority chain
  const resolvedCommentStyle =
    fileHeaderOpts.commentStyle ??
    fileFileHeaderOpts.commentStyle ??
    formatting.commentStyle ??
    fileFormatting.commentStyle ??
    fileOpts.commentStyle ??
    options.commentStyle ??
    commentStyle ??
    long;

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

  // For prefix, header, footer: only use fileHeader-specific values or defaults
  // Don't inherit from general formatting as they have different meanings
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

  // Apply comment style specific formatting (only if not explicitly overridden)
  if (effectiveCommentStyle === short) {
    // Only override if user didn't provide custom values via fileHeader options
    const fileHeaderOpts = formatting.fileHeader ?? file?.options?.formatting?.fileHeader ?? {};
    if (fileHeaderOpts.prefix === undefined) {
      prefix = `// `;
    }
    if (fileHeaderOpts.header === undefined && formatting.header === undefined) {
      header = `${lineSeparator}`;
    }
    if (fileHeaderOpts.footer === undefined && formatting.footer === undefined) {
      footer = `${lineSeparator}${lineSeparator}`;
    }
  } else if (effectiveCommentStyle === xml) {
    const fileHeaderOpts = formatting.fileHeader ?? file?.options?.formatting?.fileHeader ?? {};
    if (fileHeaderOpts.prefix === undefined) {
      prefix = `  `;
    }
    if (fileHeaderOpts.header === undefined && formatting.header === undefined) {
      header = `<!--${lineSeparator}`;
    }
    if (fileHeaderOpts.footer === undefined && formatting.footer === undefined) {
      footer = `${lineSeparator}-->`;
    }
  } else if (effectiveCommentStyle === long) {
    // Reconstruct header and footer with custom lineSeparator for long comment style
    const fileHeaderOpts = formatting.fileHeader ?? file?.options?.formatting?.fileHeader ?? {};
    if (fileHeaderOpts.header === undefined && formatting.header === undefined) {
      header = `/**${lineSeparator}`;
    }
    if (fileHeaderOpts.footer === undefined && formatting.footer === undefined) {
      footer = `${lineSeparator} */${lineSeparator}${lineSeparator}`;
    }
  }

  const headerContent = await fn(defaultHeader, options);

  return `${header}${headerContent
    .map(/** @param {string} line */ (line) => `${prefix}${line}`)
    .join(lineSeparator)}${footer}`;
}
