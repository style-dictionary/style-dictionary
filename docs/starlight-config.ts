import type { StarlightUserConfig } from '@astrojs/starlight/types';
import starlightLinksValidator from 'starlight-links-validator';
import { pluginLanguageClass } from './expressive-code-plugin-language-class.js';

export default {
  plugins: [starlightLinksValidator()],
  expressiveCode: {
    plugins: [
      // Call the plugin initialization function inside the `plugins` array
      pluginLanguageClass(),
    ],
    styleOverrides: {
      textMarkers: {
        defaultLuminance: ['15%', '85%'],
      },
    },
  },
  title: 'Style Dictionary',
  description:
    'Export your Design Tokens to any platform. iOS, Android, CSS, JS, HTML, sketch files, style documentation, or anything you can think of. Forward-compatible with Design Token Community Group spec.',
  logo: { src: './src/assets/logo.png', alt: 'Style-Dictionary logo, Pascal the chameleon.' },
  editLink: {
    baseUrl: 'https://github.com/amzn/style-dictionary/edit/main/docs',
  },
  favicon: '/favicon.png',
  social: {
    github: 'https://github.com/amzn/style-dictionary',
    slack:
      'https://join.slack.com/t/tokens-studio/shared_invite/zt-1p8ea3m6t-C163oJcN9g3~YZTKRgo2hg',
  },
  tableOfContents: {
    maxHeadingLevel: 4,
  },
  sidebar: [
    {
      label: 'Getting Started',
      autogenerate: { directory: 'getting-started' },
    },
    {
      label: 'More info',
      autogenerate: { directory: 'info' },
    },
    {
      label: 'Versions',
      items: [
        {
          label: 'v3',
          items: [
            { label: 'Documentation', link: 'https://v3.styledictionary.com' },
          ]
        },
        {
          label: 'v4',
          items: [
            { label: 'Migration Guidelines', link: '/versions/v4/migration' },
            { label: 'Statement', link: '/versions/v4/statement' },
          ]
        },
        {
          label: 'v5',
          items: [
            { label: 'Migration Guidelines', link: '/versions/v5/migration' },
          ]
        },
      ],
    },
    {
      label: 'Reference',
      items: [
        {
          label: 'API',
          link: '/reference/api',
        },
        {
          label: 'Enums',
          link: '/reference/enums',
        },
        {
          label: 'Configuration',
          link: '/reference/config',
        },
        {
          label: 'Logging',
          link: '/reference/logging',
        },
        {
          label: 'Hooks',
          collapsed: true,
          items: [
            { label: 'Parsers', link: '/reference/hooks/parsers' },
            { label: 'Preprocessors', link: '/reference/hooks/preprocessors' },
            {
              label: 'Transforms',
              collapsed: true,
              items: [
                { label: 'Overview', link: '/reference/hooks/transforms/' },
                {
                  label: 'Built-in Transforms',
                  link: '/reference/hooks/transforms/predefined',
                },
              ],
            },
            {
              label: 'Transform Groups',
              collapsed: true,
              items: [
                { label: 'Overview', link: '/reference/hooks/transform-groups/' },
                {
                  label: 'Built-in Transform Groups',
                  link: '/reference/hooks/transform-groups/predefined',
                },
              ],
            },
            {
              label: 'Formats',
              collapsed: true,
              items: [
                { label: 'Overview', link: '/reference/hooks/formats/' },
                {
                  label: 'Format Helpers',
                  link: '/reference/hooks/formats/helpers',
                },
                {
                  label: 'Built-in Formats',
                  link: '/reference/hooks/formats/predefined',
                },
              ],
            },
            { label: 'Filters', link: '/reference/hooks/filters' },
            { label: 'File Headers', link: '/reference/hooks/file-headers' },
            { label: 'Actions', link: '/reference/hooks/actions' },
          ],
        },
        {
          label: 'Utils',
          collapsed: true,
          items: [
            { label: 'Overview', link: '/reference/utils/' },
            { label: 'References', link: '/reference/utils/references' },
            { label: 'Tokens', link: '/reference/utils/tokens' },
            { label: 'Format Helpers', link: '/reference/utils/format-helpers' },
            { label: 'Design Token Community Group', link: '/reference/utils/dtcg' },
          ],
        },
        {
          label: 'Types',
          link: '/reference/types',
        },
      ],
    },
    {
      label: 'Examples',
      autogenerate: { directory: 'examples' },
    },
  ],
  head: [
    {
      tag: 'meta',
      attrs: {
        name: 'keywords',
        content:
          'style-dictionary, style dictionary, style, dictionary, design, tokens, design tokens, design system, DTCG, W3C, Design Token Community Group',
      },
    },
    {
      tag: 'meta',
      attrs: {
        name: 'theme-color',
        content: '#11aea7',
      },
    },
    {
      tag: 'meta',
      attrs: {
        name: 'og:image',
        content: '/meta-img.png',
      },
    },
    {
      tag: 'meta',
      attrs: {
        name: 'og:image:alt',
        content: 'Image of Style-Dictionary docs site',
      },
    },
  ],
  customCss: ['./src/styles.css'],
  components: {
    Head: './src/components/Head.astro',
  },
} as StarlightUserConfig;
