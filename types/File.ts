import type { TransformedToken } from './DesignToken.js';
import type { FormatFn } from './Format.js';
import type { LocalOptions, Config } from './Config.js';
import type { Filter } from './Filter.js';
import { commentPositions, commentStyles, fileHeaderCommentStyles } from '../lib/enums/index.js';

type commentStyles = typeof commentStyles;
type commentPositions = typeof commentPositions;
type fileHeaderCommentStyles = typeof fileHeaderCommentStyles;

// Generally, overriding these would break most formats and are meant
// for the FormattedVariables/createPropertyFormatter helpers,
export interface FormattingOptions extends FormattingOverrides {
  prefix?: string;
  suffix?: string;
  lineSeparator?: string;
  separator?: string;
}

/**
 * Formatting options specific to the file header comment.
 * These options allow customizing the file header independently from token formatting.
 */
export interface FileHeaderFormatting {
  /** Comment style for the file header: 'short' (//), 'long' (/** *\/), or 'xml' (<!-- -->) */
  commentStyle?: fileHeaderCommentStyles[keyof fileHeaderCommentStyles];
  /** Prefix for each line in the file header comment (e.g., ' * ') */
  prefix?: string;
  /** Line separator within the file header (default: '\n') */
  lineSeparator?: string;
  /** Opening string of the file header comment (e.g., '/**\n') */
  header?: string;
  /** Closing string of the file header comment (e.g., '\n *\/\n\n') */
  footer?: string;
  /** Whether to include a timestamp in the file header */
  timestamp?: boolean;
}

// These you can usually override on the formats level without breaking it
// to customize the output
// Be careful with indentation if the output syntax is indentation-sensitive (e.g. python, yaml)
export interface FormattingOverrides {
  /** Comment style for token property comments. For file header comment style, use formatting.fileHeader.commentStyle */
  commentStyle?: commentStyles[keyof commentStyles];
  commentPosition?: commentPositions[keyof commentPositions];
  indentation?: string;
  /** Line separator (default: '\n'). For file header line separator, use formatting.fileHeader.lineSeparator */
  lineSeparator?: string;
  /**
   * Opening string for the output format. Also used as a fallback for the file header
   * opening comment if `formatting.fileHeader.header` is not set.
   */
  header?: string;
  /**
   * Closing string for the output format. Also used as a fallback for the file header
   * closing comment if `formatting.fileHeader.footer` is not set.
   */
  footer?: string;
  /**
   * @deprecated Use `formatting.fileHeader.timestamp` instead. Will be removed in v6.0.
   */
  fileHeaderTimestamp?: boolean;
  /** File header specific formatting options */
  fileHeader?: FileHeaderFormatting;
}

export type FileHeader = (
  defaultMessage?: string[],
  options?: Config,
) => Promise<string[]> | string[];

export interface File {
  destination?: string;
  format?: string | FormatFn;
  filter?: string | Partial<TransformedToken> | Filter['filter'];
  options?: LocalOptions;
}
