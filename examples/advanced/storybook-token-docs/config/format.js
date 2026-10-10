import { fileHeader, usesReferences } from 'style-dictionary/utils';
import { contrastLevel, contrastRatio, formatRatio } from './contrast.js';

// Page chrome colors all reach at least 7:1 against the white background
const styles = `<style>
  .sd-tokens { width: 100%; border-collapse: collapse; font-family: system-ui, sans-serif; color: #1a1a1a; background: #ffffff; }
  .sd-tokens caption { padding-block-end: 0.75rem; font-size: 1.25rem; font-weight: 600; text-align: start; }
  .sd-tokens th, .sd-tokens td { padding: 0.5rem 0.75rem; border-block-end: 1px solid #595959; text-align: start; vertical-align: middle; }
  .sd-tokens code { font-family: ui-monospace, monospace; }
  .sd-alias { display: block; font-size: 0.875rem; color: #4d4d4d; }
  .sd-swatch { width: 3rem; height: 2rem; border: 1px solid #595959; border-radius: 4px; }
  .sd-bar { height: 1rem; background: #1a1a1a; }
</style>`;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const valueOf = (token) => token.$value ?? token.value;

/**
 * Token name, plus the reference it points to when the token is an alias
 */
function nameCell(token) {
  const original = token.original.$value ?? token.original.value;
  const alias = usesReferences(original)
    ? `<span class="sd-alias">Alias of <code>${escapeHtml(original)}</code></span>`
    : '';
  return `<th scope="row"><code>${escapeHtml(token.name)}</code>${alias}</th>`;
}

function table(caption, headings, rows) {
  const head = headings.map((heading) => `<th scope="col">${heading}</th>`).join('');
  return `<table class="sd-tokens"><caption>${caption}</caption><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function colorRow(token) {
  const value = valueOf(token);
  const contrast = (background) => {
    const ratio = contrastRatio(value, background);
    return `<td>${formatRatio(ratio)} ${contrastLevel(ratio)}</td>`;
  };
  return `<tr>${nameCell(token)}<td><div class="sd-swatch" style="background: ${escapeHtml(value)}" aria-hidden="true"></div></td><td><code>${escapeHtml(value)}</code></td>${contrast('#ffffff')}${contrast('#000000')}</tr>`;
}

function fontSizeRow(token) {
  const value = escapeHtml(valueOf(token));
  return `<tr>${nameCell(token)}<td><code>${value}</code></td><td style="font-size: ${value}">Sphinx of black quartz, judge my vow</td></tr>`;
}

function dimensionRow(token) {
  const value = escapeHtml(valueOf(token));
  return `<tr>${nameCell(token)}<td><code>${value}</code></td><td><div class="sd-bar" style="width: ${value}" aria-hidden="true"></div></td></tr>`;
}

const stories = [
  {
    name: 'Colors',
    type: 'color',
    headings: ['Token', 'Swatch', 'Value', 'Contrast on white', 'Contrast on black'],
    row: colorRow,
  },
  {
    name: 'FontSizes',
    caption: 'Font sizes',
    type: 'fontSize',
    headings: ['Token', 'Value', 'Sample'],
    row: fontSizeRow,
  },
  {
    name: 'Spacing',
    type: 'dimension',
    headings: ['Token', 'Value', 'Size'],
    row: dimensionRow,
  },
];

/**
 * Outputs a Component Story Format (CSF) file with one story per token type
 * @see https://storybook.js.org/docs/api/csf
 */
export async function storybookStories({ dictionary, file }) {
  const header = await fileHeader({ file });

  const exports = stories
    .map(({ name, caption = name, type, headings, row }) => {
      const tokens = dictionary.allTokens.filter((token) => (token.$type ?? token.type) === type);
      if (tokens.length === 0) {
        return '';
      }
      const html = styles + table(caption, headings, tokens.map(row));
      return `export const ${name} = {\n  render: () => ${JSON.stringify(html)},\n};\n`;
    })
    .filter(Boolean)
    .join('\n');

  return `${header}export default {
  title: 'Design tokens',
  parameters: { layout: 'padded' },
};

${exports}`;
}
