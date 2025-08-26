import { formats, transformGroups } from '../../lib/enums/index.js';

const { scssIcons } = formats;
const { web } = transformGroups;

export default {
  source: ['__tests__/__tokens/**/*.json'],
  platforms: {
    web: {
      transformGroup: web,
      prefix: 'smop',
      buildPath: '__tests__/__output/web/',
      files: [
        {
          destination: '_icons.css',
          format: scssIcons,
          filter: () => true,
        },
      ],
    },
  },
};
