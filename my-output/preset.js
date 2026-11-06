/**
 * Do not edit directly, this file was auto-generated.
 */

import { definePreset } from '@pandacss/dev';

export default definePreset({
  name: '@my-brand/panda-preset',
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            primary: {
              value: '#4f46e5',
              description: 'Main brand indigo',
            },
            secondary: {
              value: '{colors.brand.primary}',
              description: 'Inherits primary',
            },
          },
        },
        spacing: {
          sm: {
            value: '8px',
          },
          md: {
            value: '16px',
          },
        },
      },
    },
  },
});
