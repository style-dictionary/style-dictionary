import { expect } from 'chai';
import createPropertyFormatter from '../../../lib/common/formatHelpers/createPropertyFormatter.js';
import { convertTokenData } from '../../../lib/utils/convertTokenData.js';
import { outputReferencesFilter } from '../../../lib/utils/references/outputReferencesFilter.js';
import { commentStyles, commentPositions, propertyFormatNames } from '../../../lib/enums/index.js';

const { short, long } = commentStyles;
const { above } = commentPositions;
const { css, sass } = propertyFormatNames;

const dictionary = {
  foo: {
    original: {
      value: '5px',
      type: 'spacing',
    },
    name: 'foo',
    path: ['foo'],
    value: '5px',
    type: 'spacing',
  },
  ref: {
    original: {
      value: '{foo}',
      type: 'spacing',
    },
    name: 'ref',
    path: ['ref'],
    value: '5px',
    type: 'spacing',
  },
};

const transformedDictionary = {
  foo: {
    original: {
      value: '5px',
      type: 'spacing',
    },
    name: 'foo',
    path: ['foo'],
    value: '5px',
    type: 'spacing',
  },
  ref: {
    original: {
      value: '{foo}',
      type: 'spacing',
    },
    name: 'ref',
    path: ['ref'],
    value: 'changed by transitive transform',
    type: 'spacing',
  },
};

const numberDictionary = {
  foo: {
    original: {
      value: 10,
      type: 'dimension',
    },
    name: 'foo',
    path: ['foo'],
    value: 10,
    type: 'dimension',
  },
  ref: {
    original: {
      value: '{foo}',
      type: 'dimension',
    },
    name: 'ref',
    path: ['ref'],
    value: 10,
    type: 'dimension',
  },
  zero: {
    original: {
      value: 0,
      type: 'dimension',
    },
    name: 'zero',
    path: ['zero'],
    value: 0,
    type: 'dimension',
  },
  'ref-zero': {
    original: {
      value: '{zero}',
      type: 'dimension',
    },
    name: 'ref-zero',
    path: ['ref-zero'],
    value: 0,
    type: 'dimension',
  },
};

const multiDictionary = {
  foo: {
    original: {
      value: '10px',
      type: 'spacing',
    },
    name: 'foo',
    path: ['foo'],
    value: '10px',
    type: 'spacing',
  },
  bar: {
    original: {
      value: '15px',
      type: 'spacing',
    },
    name: 'bar',
    path: ['bar'],
    value: '15px',
    type: 'spacing',
  },
  ref: {
    original: {
      value: '{foo} 5px {bar}',
      type: 'spacing',
    },
    name: 'ref',
    path: ['ref'],
    value: '10px 5px 15px',
    type: 'spacing',
  },
};

const objectDictionary = {
  foo: {
    original: {
      value: '5px',
      type: 'spacing',
    },
    name: 'foo',
    path: ['foo'],
    value: '5px',
    type: 'spacing',
  },
  ref: {
    original: {
      value: {
        width: '{foo}',
        style: 'dashed',
        color: '#FF00FF',
      },
      type: 'border',
    },
    name: 'ref',
    path: ['ref'],
    value: '5px dashed #FF00FF',
    type: 'border',
  },
};

describe('common', () => {
  describe('formatHelpers', () => {
    describe('createPropertyFormatter', () => {
      describe('outputReferences', () => {
        it('should support outputReferences', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: dictionary },
            format: css,
          });
          expect(propFormatter(dictionary.foo)).to.equal('  --foo: 5px;');
          expect(propFormatter(dictionary.ref)).to.equal('  --ref: var(--foo);');
        });

        it('should support outputReferences when values are transformed by (transitive) "value" transforms', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: transformedDictionary },
            format: css,
          });
          expect(propFormatter(transformedDictionary.foo)).to.equal('  --foo: 5px;');
          expect(propFormatter(transformedDictionary.ref)).to.equal('  --ref: var(--foo);');
        });

        it('should support number values for outputReferences', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: numberDictionary },
            format: css,
          });
          expect(propFormatter(numberDictionary.foo)).to.equal('  --foo: 10;');
          expect(propFormatter(numberDictionary.ref)).to.equal('  --ref: var(--foo);');
        });

        it('should support valid falsy values for outputReferences', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: numberDictionary },
            format: css,
          });
          expect(propFormatter(numberDictionary.zero)).to.equal('  --zero: 0;');
          expect(propFormatter(numberDictionary['ref-zero'])).to.equal(
            '  --ref-zero: var(--zero);',
          );
        });

        it('should support multiple references for outputReferences', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: multiDictionary },
            format: css,
          });
          expect(propFormatter(multiDictionary.foo)).to.equal('  --foo: 10px;');
          expect(propFormatter(multiDictionary.bar)).to.equal('  --bar: 15px;');
          expect(propFormatter(multiDictionary.ref)).to.equal(
            '  --ref: var(--foo) 5px var(--bar);',
          );
        });

        it('should support conditionally outputting references', () => {
          const unfilteredTokens = {
            foo: {
              value: '5px',
              original: {
                value: '5px',
                type: 'spacing',
              },
              name: 'foo',
              path: ['foo'],
              type: 'spacing',
            },
            bar: {
              value: '5px',
              original: {
                value: '{foo}',
                type: 'spacing',
              },
              name: 'bar',
              path: ['bar'],
              type: 'spacing',
            },
            qux: {
              value: '5px',
              original: {
                value: '{foo}',
                type: 'spacing',
              },
              name: 'qux',
              path: ['qux'],
              type: 'spacing',
            },
          };
          const tokens = { ...unfilteredTokens };
          const allTokens = convertTokenData(tokens, { output: 'array' });
          const propFormatter = createPropertyFormatter({
            dictionary: {
              tokens,
              unfilteredTokens,
              allTokens,
            },
            format: css,
            // outputReferences function that only outputs the refs if the token name is "bar"
            outputReferences: (token) => token.name === 'bar',
          });
          expect(propFormatter(tokens.bar)).to.equal('  --bar: var(--foo);');
          expect(propFormatter(tokens.qux)).to.equal('  --qux: 5px;');
        });

        it('should make it easy to not output refs for tokens that contains refs that are filtered out', () => {
          const unfilteredTokens = {
            foo: {
              value: '5px',
              original: {
                value: '5px',
                type: 'spacing',
              },
              name: 'foo',
              path: ['foo'],
              type: 'spacing',
            },
            bar: {
              value: '10px',
              original: {
                value: '10px',
                type: 'spacing',
              },
              name: 'bar',
              path: ['bar'],
              type: 'spacing',
            },
            'ref foo': {
              value: '5px',
              original: {
                value: '{foo}',
                type: 'spacing',
              },
              name: 'ref-foo',
              path: ['ref foo'],
              type: 'spacing',
            },
            'ref bar': {
              value: '10px',
              original: {
                value: '{bar}',
                type: 'spacing',
              },
              name: 'ref-bar',
              path: ['ref bar'],
              type: 'spacing',
            },
          };
          const tokens = { ...unfilteredTokens };
          delete tokens.foo;
          const allTokens = convertTokenData(tokens, { output: 'array' });
          const propFormatter = createPropertyFormatter({
            dictionary: {
              tokens,
              unfilteredTokens,
              allTokens,
            },
            format: css,
            // outputReferences function that only outputs the refs if the referred tokens are not filtered out
            outputReferences: outputReferencesFilter,
          });

          expect(propFormatter(tokens['ref foo'])).to.equal('  --ref-foo: 5px;');
          expect(propFormatter(tokens['ref bar'])).to.equal('  --ref-bar: var(--bar);');
        });

        it('DTCG: should make it easy to not output refs for tokens that contains refs that are filtered out', () => {
          const unfilteredTokens = {
            foo: {
              $value: '5px',
              original: {
                $value: '5px',
                type: 'spacing',
              },
              name: 'foo',
              path: ['foo'],
              $type: 'spacing',
            },
            bar: {
              $value: '10px',
              original: {
                $value: '10px',
                $type: 'spacing',
              },
              name: 'bar',
              path: ['bar'],
              $type: 'spacing',
            },
            'ref foo': {
              $value: '5px',
              original: {
                $value: '{foo}',
                $type: 'spacing',
              },
              name: 'ref-foo',
              path: ['ref foo'],
              $type: 'spacing',
            },
            'ref bar': {
              $value: '10px',
              original: {
                $value: '{bar}',
                $type: 'spacing',
              },
              name: 'ref-bar',
              path: ['ref bar'],
              $type: 'spacing',
            },
          };
          const tokens = { ...unfilteredTokens };
          delete tokens.foo;
          const allTokens = convertTokenData(tokens, { output: 'array', usesDtcg: true });
          const propFormatter = createPropertyFormatter({
            dictionary: {
              tokens,
              unfilteredTokens,
              allTokens,
            },
            format: css,
            usesDtcg: true,
            // outputReferences function that only outputs the refs if the referred tokens are not filtered out
            outputReferences: outputReferencesFilter,
          });

          expect(propFormatter(tokens['ref foo'])).to.equal('  --ref-foo: 5px;');
          expect(propFormatter(tokens['ref bar'])).to.equal('  --ref-bar: var(--bar);');
        });

        it('should support object value references for outputReferences', () => {
          // The ref is an object type value, which means there will usually be some kind of transform (e.g. a CSS shorthand transform)
          // to change it from an object to a string. In our example, we use a border CSS shorthand for border token.
          // In this case, since it is an object value, we will run the transformation on the transformed (string) value.
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: objectDictionary },
            format: css,
          });
          // expect(propFormatter(objectDictionary.tokens.foo)).to.equal('  --foo: 5px;');

          expect(propFormatter(objectDictionary.ref)).to.equal(
            '  --ref: var(--foo) dashed #FF00FF;',
          );
        });
      });

      describe('commentStyle', () => {
        const commentDictionary = {
          color: {
            red: {
              name: 'color-red',
              value: '#FF0000',
              comment: 'Foo bar qux',
              path: ['color', 'red'],
              original: {
                value: '#FF0000',
              },
            },
            green: {
              name: 'color-green',
              value: '#00FF00',
              comment: 'Foo bar qux',
              path: ['color', 'green'],
              original: {
                value: '#00FF00',
              },
            },
            blue: {
              name: 'color-blue',
              value: '#0000FF',
              comment: 'Foo\nbar\nqux',
              path: ['color', 'blue'],
              original: {
                value: '#0000FF',
              },
            },
          },
        };

        it('should default to putting comment next to the output value', async () => {
          // long commentStyle
          const cssFormatter = createPropertyFormatter({
            format: css,
            dictionary: { tokens: commentDictionary },
          });
          // short commentStyle
          const sassFormatter = createPropertyFormatter({
            format: sass,
            dictionary: { tokens: commentDictionary },
          });

          // red = single-line comment, blue = multi-line comment
          const cssRed = cssFormatter(commentDictionary.color.red);
          const cssBlue = cssFormatter(commentDictionary.color.blue);
          const sassRed = sassFormatter(commentDictionary.color.red);
          const sassBlue = sassFormatter(commentDictionary.color.blue);

          await expect(cssRed).to.matchSnapshot(1);
          await expect(cssBlue).to.matchSnapshot(2);

          await expect(sassRed).to.matchSnapshot(3);
          await expect(sassBlue).to.matchSnapshot(4);
        });

        it('allows overriding formatting commentStyle', async () => {
          // long commentStyle
          const cssFormatter = createPropertyFormatter({
            format: css,
            dictionary: { tokens: commentDictionary },
            formatting: {
              commentStyle: long,
              commentPosition: above,
            },
          });
          // short commentStyle
          const sassFormatter = createPropertyFormatter({
            format: sass,
            dictionary: { tokens: commentDictionary },
            formatting: {
              commentStyle: short,
              commentPosition: above,
            },
          });

          const cssRed = cssFormatter(commentDictionary.color.green);
          const sassRed = sassFormatter(commentDictionary.color.green);

          await expect(cssRed).to.matchSnapshot(1);
          await expect(sassRed).to.matchSnapshot(2);
        });
      });

      describe('DTCG', () => {
        const dtcgDictionary = {
          color: {
            red: {
              name: 'color-red',
              $value: '#FF0000',
              original: {
                $value: '#FF0000',
              },
              $description: 'Foo bar qux red',
              path: ['color', 'red'],
            },
            green: {
              name: 'color-green',
              $value: '#00FF00',
              original: {
                $value: '#00FF00',
              },
              $description: 'Foo bar qux green',
              path: ['color', 'green'],
            },
            blue: {
              name: 'color-blue',
              $value: '#0000FF',
              original: {
                $value: '#0000FF',
              },
              $description: 'Foo\nbar\nqux\nblue',
              path: ['color', 'blue'],
            },
            ref: {
              name: 'color-ref',
              $value: '#FF0000',
              original: {
                $value: '{color.red}',
              },
              $description: 'Foo\nbar\nqux\nref',
              path: ['color', 'ref'],
            },
          },
        };
        it('supports DTCG spec $description property for comments', async () => {
          // long commentStyle
          const cssFormatter = createPropertyFormatter({
            format: css,
            dictionary: { tokens: dtcgDictionary },
            usesDtcg: true,
          });

          const cssRed = cssFormatter(dtcgDictionary.color.red);
          const cssGreen = cssFormatter(dtcgDictionary.color.green);
          const cssBlue = cssFormatter(dtcgDictionary.color.blue);

          await expect(cssRed).to.matchSnapshot(1);
          await expect(cssGreen).to.matchSnapshot(2);
          await expect(cssBlue).to.matchSnapshot(3);
        });

        it('supports DTCG spec $value for outputReferences', async () => {
          // long commentStyle
          const cssFormatter = createPropertyFormatter({
            format: css,
            outputReferences: true,
            dictionary: { tokens: dtcgDictionary },
            usesDtcg: true,
          });

          const cssRef = cssFormatter(dtcgDictionary.color.ref);

          await expect(cssRef).to.matchSnapshot();
        });
      });

      describe('tokens with "value" in their name', () => {
        const valueNameDictionary = {
          object_type: {
            value_chain: {
              value: '10px',
              original: {
                value: '10px',
                type: 'spacing',
              },
              name: 'object-type-value-chain',
              path: ['object_type', 'value_chain'],
              type: 'spacing',
            },
          },
          reference: {
            to_value_chain: {
              value: '10px',
              original: {
                value: '{object_type.value_chain}',
                type: 'spacing',
              },
              name: 'reference-to-value-chain',
              path: ['reference', 'to_value_chain'],
              type: 'spacing',
            },
          },
        };

        it('should support outputReferences for tokens with "value" in their name', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: valueNameDictionary },
            format: css,
          });
          expect(propFormatter(valueNameDictionary.object_type.value_chain)).to.equal(
            '  --object-type-value-chain: 10px;',
          );
          expect(propFormatter(valueNameDictionary.reference.to_value_chain)).to.equal(
            '  --reference-to-value-chain: var(--object-type-value-chain);',
          );
        });
      });

      describe('DTCG: tokens with "value" in their name', () => {
        const dtcgValueNameDictionary = {
          object_type: {
            value_chain: {
              $value: '10px',
              original: {
                $value: '10px',
                $type: 'spacing',
              },
              name: 'object-type-value-chain',
              path: ['object_type', 'value_chain'],
              $type: 'spacing',
            },
          },
          reference: {
            to_value_chain: {
              $value: '10px',
              original: {
                $value: '{object_type.value_chain}',
                $type: 'spacing',
              },
              name: 'reference-to-value-chain',
              path: ['reference', 'to_value_chain'],
              $type: 'spacing',
            },
          },
        };

        it('should support DTCG outputReferences for tokens with "value" in their name', () => {
          const propFormatter = createPropertyFormatter({
            outputReferences: true,
            dictionary: { tokens: dtcgValueNameDictionary },
            format: css,
            usesDtcg: true,
          });
          expect(propFormatter(dtcgValueNameDictionary.object_type.value_chain)).to.equal(
            '  --object-type-value-chain: 10px;',
          );
          expect(propFormatter(dtcgValueNameDictionary.reference.to_value_chain)).to.equal(
            '  --reference-to-value-chain: var(--object-type-value-chain);',
          );
        });
      });
    });
  });
});
