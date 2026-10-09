import StyleDictionary from 'style-dictionary';
import { storybookStories } from './config/format.js';

StyleDictionary.registerFormat({
  name: 'storybook/stories',
  format: storybookStories,
});

export default {
  source: ['./tokens/**/*.json'],
  platforms: {
    storybook: {
      transforms: ['name/kebab', 'color/hex'],
      buildPath: 'build/storybook/',
      files: [
        {
          destination: 'tokens.stories.js',
          format: 'storybook/stories',
        },
      ],
    },
  },
};
