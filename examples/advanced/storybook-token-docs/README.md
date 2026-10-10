# Storybook token docs

Builds a [Storybook](https://storybook.js.org/) stories file that documents your design tokens: color swatches with their WCAG contrast ratios, font sizes and spacing.

A custom format writes the stories in [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf), so Storybook picks up the token docs like any other stories file and they rebuild whenever the tokens change.

## Running the example

```sh
npm install
npm run storybook
```

`npm run storybook` builds the tokens, then starts Storybook at `http://localhost:6006`. Run `npm run build-storybook` to output a static Storybook to `storybook-static/` instead, and `npm test` to run the contrast helper tests.

## How it works

`config.js` registers the `storybook/stories` format and writes `build/storybook/tokens.stories.js`:

```js
export default {
  title: 'Design tokens',
  parameters: { layout: 'padded' },
};

export const Colors = {
  render: () => '<table class="sd-tokens">...</table>',
};

export const FontSizes = {
  render: () => '<table class="sd-tokens">...</table>',
};

export const Spacing = {
  render: () => '<table class="sd-tokens">...</table>',
};
```

The format in [config/format.js](./config/format.js) creates one story per token type (`color`, `fontSize` and `dimension`) and skips a story when there are no tokens of that type. Each story is a plain HTML table, so the example uses the `@storybook/html-vite` framework and no UI library. Alias tokens show the reference they point to.

The contrast ratios are calculated at build time by [config/contrast.js](./config/contrast.js), against white and against black, and labelled with the WCAG level they reach.

`.storybook/main.js` points Storybook at the build output:

```js
export default {
  stories: ['../build/storybook/*.stories.js'],
  framework: '@storybook/html-vite',
};
```

To document more token types, add an entry to the `stories` array in `config/format.js` with the token type, the table headings and a function that renders one row.
