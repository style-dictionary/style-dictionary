import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { xamlResourceDictionary } = fileFormats;

const format = formats[xamlResourceDictionary];
const file = {
  destination: 'Tokens.xaml',
  format: xamlResourceDictionary,
};

const baseTokens = {
  color: {
    brandPrimary: {
      value: '#0B8599',
      type: 'color',
      comment: 'Brand primary color',
      original: {
        value: '#0B8599',
      },
      name: 'ColorBrandPrimary',
      path: ['color', 'brandPrimary'],
    },
  },
  size: {
    cornerRadiusMedium: {
      value: 8,
      type: 'dimension',
      original: {
        value: 8,
      },
      name: 'SizeCornerRadiusMedium',
      path: ['size', 'cornerRadiusMedium'],
    },
  },
  fontSize: {
    body: {
      value: 16,
      type: 'fontSize',
      original: {
        value: 16,
      },
      name: 'FontSizeBody',
      path: ['fontSize', 'body'],
    },
  },
  content: {
    greeting: {
      value: 'Hello & goodbye',
      type: 'string',
      original: {
        value: 'Hello & goodbye',
      },
      name: 'GreetingText',
      path: ['content', 'greeting'],
    },
  },
  flags: {
    isEnabled: {
      value: true,
      type: 'boolean',
      original: {
        value: true,
      },
      name: 'IsEnabled',
      path: ['flags', 'isEnabled'],
    },
  },
};

const customTypeTokens = {
  brand: {
    primary: {
      value: '#663399',
      type: 'brandColor',
      original: {
        value: '#663399',
      },
      name: 'BrandPrimary',
      path: ['brand', 'primary'],
    },
  },
};

const compatiblePrimitiveTokens = {
  color: {
    overlay: {
      value: 'rgba(11, 133, 153, 0.5)',
      type: 'color',
      original: {
        value: 'rgba(11, 133, 153, 0.5)',
      },
      name: 'ColorOverlay',
      path: ['color', 'overlay'],
    },
  },
  number: {
    strokeWidth: {
      value: '12.5f',
      type: 'number',
      original: {
        value: '12.5f',
      },
      name: 'StrokeWidth',
      path: ['number', 'strokeWidth'],
    },
  },
  content: {
    tagline: {
      value: 'Use <tag> & "quotes"',
      type: 'content',
      original: {
        value: 'Use <tag> & "quotes"',
      },
      name: 'TaglineText',
      path: ['content', 'tagline'],
    },
  },
  flags: {
    isPreview: {
      value: 'false',
      type: 'boolean',
      original: {
        value: 'false',
      },
      name: 'IsPreview',
      path: ['flags', 'isPreview'],
    },
  },
};

const referenceTokens = {
  color: {
    base: {
      value: '#0B8599',
      type: 'color',
      original: {
        value: '#0B8599',
      },
      name: 'ColorBase',
      path: ['color', 'base'],
    },
    alias: {
      value: '#0B8599',
      type: 'color',
      original: {
        value: '{color.base}',
      },
      name: 'ColorAlias',
      path: ['color', 'alias'],
    },
  },
  size: {
    base: {
      value: 8,
      type: 'number',
      original: {
        value: 8,
      },
      name: 'SizeBase',
      path: ['size', 'base'],
    },
    alias: {
      value: 8,
      type: 'number',
      original: {
        value: '{size.base}',
      },
      name: 'SizeAlias',
      path: ['size', 'alias'],
    },
  },
};

describe('formats', () => {
  describe(`xaml/resourceDictionary`, () => {
    it('should match default snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: baseTokens,
            allTokens: convertTokenData(baseTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              outputColorBrushes: true,
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with compatible primitive values should match snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: compatiblePrimitiveTokens,
            allTokens: convertTokenData(compatiblePrimitiveTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              outputColorBrushes: true,
              resourceTypeMap: {
                number: 'x:Single',
              },
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with a forced resource type should match snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: baseTokens,
            allTokens: convertTokenData(baseTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              resourceType: 'x:String',
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with DynamicResource brush references should match snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: baseTokens,
            allTokens: convertTokenData(baseTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              outputColorBrushes: true,
              resourceReferenceType: 'DynamicResource',
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with options overrides should match snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: customTypeTokens,
            allTokens: convertTokenData(customTypeTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              className: 'MyApp.Resources.BrandTokens',
              outputColorBrushes: true,
              brushSuffix: 'Paint',
              resourceTypeMap: {
                brandColor: 'Color',
              },
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with references should match snapshot', async () => {
      const allTokens = convertTokenData(referenceTokens, { output: 'array' });
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: referenceTokens,
            allTokens,
            unfilteredTokens: referenceTokens,
          },
          file: {
            ...file,
            options: {
              outputReferences: true,
              outputColorBrushes: true,
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with WPF aliases and StaticResource should match snapshot', async () => {
      const allTokens = convertTokenData(referenceTokens, { output: 'array' });
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: referenceTokens,
            allTokens,
            unfilteredTokens: referenceTokens,
          },
          file: {
            ...file,
            options: {
              preset: 'wpf',
              outputReferences: true,
              resourceReferenceType: 'StaticResource',
              outputColorBrushes: true,
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('should reject WPF dynamic aliases only when an alias is emitted', async () => {
      const dictionary = {
        tokens: referenceTokens,
        allTokens: convertTokenData(referenceTokens, { output: 'array' }),
      };
      for (const outputReferences of [true, () => true]) {
        await expect(
          format(
            createFormatArgs({
              dictionary,
              file: {
                ...file,
                options: {
                  preset: 'wpf',
                  resourceReferenceType: 'DynamicResource',
                  outputReferences,
                },
              },
              platform: {},
            }),
          ),
        ).to.be.rejectedWith('cannot emit DynamicResource alias "ColorAlias"');
      }

      for (const outputReferences of [false, () => false]) {
        const output = await format(
          createFormatArgs({
            dictionary,
            file: {
              ...file,
              options: {
                preset: 'wpf',
                resourceReferenceType: 'DynamicResource',
                outputReferences,
                outputColorBrushes: true,
              },
            },
            platform: {},
          }),
        );
        expect(output).to.include('<Color x:Key="ColorAlias">#FF0B8599</Color>');
        expect(output).to.include('Color="{DynamicResource ColorAlias}"');
        expect(output).not.to.include('<DynamicResource');
      }
    });

    it('should let a factory replace WPF dynamic aliases', async () => {
      const output = await format(
        createFormatArgs({
          dictionary: {
            tokens: referenceTokens,
            allTokens: convertTokenData(referenceTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              preset: 'wpf',
              resourceReferenceType: 'DynamicResource',
              outputReferences: true,
              resourceFactory: ({ token, referencedToken, createAliasResource }) =>
                referencedToken
                  ? createAliasResource(token, referencedToken, 'StaticResource', 'ResourceKey')
                  : undefined,
            },
          },
          platform: {},
        }),
      );
      expect(output).to.include('<StaticResource x:Key="ColorAlias" ResourceKey="ColorBase" />');
      expect(output).not.to.include('<DynamicResource');
    });

    it('should give factories brush ownership and preserve automatic brushes on fallback', async () => {
      for (const asArray of [false, true]) {
        const output = await format(
          createFormatArgs({
            dictionary: {
              tokens: referenceTokens,
              allTokens: convertTokenData(referenceTokens, { output: 'array' }),
            },
            file: {
              ...file,
              options: {
                preset: 'wpf',
                outputColorBrushes: true,
                resourceFactory: ({ token, createResource, createColorBrushResource }) => {
                  if (token.name !== 'ColorBase') return undefined;
                  const brush = createColorBrushResource(token, 'Brush', 'StaticResource');
                  return asArray
                    ? [createResource(token, 'Color', '#FF0B8599'), brush]
                    : `${createResource(token, 'Color', '#FF0B8599')}\n${brush}`;
                },
              },
            },
            platform: {},
          }),
        );
        expect(output.split('x:Key="ColorBaseBrush"')).to.have.length(2);
        expect(output.split('x:Key="ColorAliasBrush"')).to.have.length(2);
      }
    });

    it('should not append automatic brushes when a factory omits a token', async () => {
      for (const omittedOutput of ['', []]) {
        const output = await format(
          createFormatArgs({
            dictionary: {
              tokens: referenceTokens,
              allTokens: convertTokenData(referenceTokens, { output: 'array' }),
            },
            file: {
              ...file,
              options: {
                preset: 'wpf',
                outputColorBrushes: true,
                resourceFactory: ({ token }) =>
                  token.name === 'ColorBase' ? omittedOutput : undefined,
              },
            },
            platform: {},
          }),
        );
        expect(output).not.to.include('x:Key="ColorBase"');
        expect(output).not.to.include('x:Key="ColorBaseBrush"');
        expect(output).to.include('x:Key="ColorAliasBrush"');
      }
    });

    it('with namespace overrides and root attributes should match snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: baseTokens,
            allTokens: convertTokenData(baseTokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              preset: 'wpf',
              namespaces: {
                local: 'clr-namespace:MyApp.Resources',
                mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
              },
              rootAttributes: {
                'mc:Ignorable': 'd',
              },
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with a tokenValueSerializer should match snapshot', async () => {
      const tokens = {
        size: {
          spacing: {
            value: '1.25rem',
            type: 'dimension',
            original: {
              value: '1.25rem',
            },
            name: 'SpacingMedium',
            path: ['size', 'spacing'],
          },
        },
      };

      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens,
            allTokens: convertTokenData(tokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              preset: 'wpf',
              tokenValueSerializer: ({ token, value, resourceType, serializeValue, options }) => {
                if (
                  token.type === 'dimension' &&
                  typeof value === 'string' &&
                  value.endsWith('rem')
                ) {
                  return {
                    resourceType: 'x:Double',
                    value: String(Number.parseFloat(value) * 16),
                  };
                }

                return {
                  resourceType,
                  value: serializeValue(value, resourceType, token, options),
                };
              },
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('with a resourceFactory should match snapshot', async () => {
      const tokens = {
        size: {
          padding: {
            value: {
              top: 4,
              right: 8,
              bottom: 4,
              left: 8,
            },
            type: 'spacing',
            original: {
              value: {
                top: 4,
                right: 8,
                bottom: 4,
                left: 8,
              },
            },
            name: 'PaddingCard',
            path: ['size', 'padding'],
          },
        },
      };

      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens,
            allTokens: convertTokenData(tokens, { output: 'array' }),
          },
          file: {
            ...file,
            options: {
              preset: 'wpf',
              resourceFactory: ({ token, value, resourceType, createResource }) => {
                if (
                  token.type === 'spacing' &&
                  typeof value === 'object' &&
                  value !== null &&
                  'top' in value &&
                  'right' in value &&
                  'bottom' in value &&
                  'left' in value
                ) {
                  return createResource(
                    token,
                    'Thickness',
                    [value.left, value.top, value.right, value.bottom].join(','),
                  );
                }

                return createResource(token, resourceType, '');
              },
            },
          },
          platform: {},
        }),
      );
      await expect(f).to.matchSnapshot();
    });

    it('should throw for unsupported object values', async () => {
      const tokens = {
        shadow: {
          card: {
            value: {
              x: 0,
              y: 1,
            },
            type: 'shadow',
            original: {
              value: {
                x: 0,
                y: 1,
              },
            },
            name: 'ShadowCard',
            path: ['shadow', 'card'],
          },
        },
      };

      await expect(
        format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
        ),
      ).to.be.rejectedWith(
        'xaml/resourceDictionary does not support object values for token "ShadowCard" with resource type "x:String"',
      );
    });
  });
});
