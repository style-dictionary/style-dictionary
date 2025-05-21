import type { DesignTokens } from './DesignToken.js';

export interface ParserOptions {
  contents: string;
  filePath?: string;
}

export interface Parser {
  name: string;
  pattern: RegExp;
  parser: (options: ParserOptions) => DesignTokens | Promise<DesignTokens>;
}
