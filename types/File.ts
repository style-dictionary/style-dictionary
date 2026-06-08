import type { TransformedToken } from './DesignToken.js';
import type { FormatFn } from './Format.js';
import type { LocalOptions, Config } from './Config.js';
import type { Filter } from './Filter.js';
import { commentPositions, commentStyles } from '../lib/enums/index.js';

type commentStyles = typeof commentStyles;
type commentPositions = typeof commentPositions;

// Generally, overriding these would break most formats and are meant
// for the FormattedVariables/createPropertyFormatter helpers,
export interface FormattingOptions extends FormattingOverrides {
  prefix?: string;
  suffix?: string;
  lineSeparator?: string;
  separator?: string;
}

// These you can usually override on the formats level without breaking it
// to customize the output
// Be careful with indentation if the output syntax is indentation-sensitive (e.g. python, yaml)
export interface FormattingOverrides {
  commentStyle?: commentStyles[keyof commentStyles];
  commentPosition?: commentPositions[keyof commentPositions];
  indentation?: string;
  header?: string;
  footer?: string;
  fileHeaderTimestamp?: boolean;
}

export type FileHeader = (
  defaultMessage?: string[],
  options?: Config,
) => Promise<string[]> | string[];

export interface File {
  destination?: string;
  format?: string | FormatFn;
  filter?: string | Partial<TransformedToken> | Filter['filter'];
  emitEmptyFiles?: boolean;
  options?: LocalOptions;
}
