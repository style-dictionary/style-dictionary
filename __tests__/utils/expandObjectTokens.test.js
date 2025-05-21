import { expect } from 'chai';
import {
  getTypeFromMap,
  expandTokenInMap,
  expandTokens,
} from '../../lib/utils/expandObjectTokens.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';

const borderInput = {
  border: {
    type: 'border',
    value: {
      width: '2px',
      style: 'solid',
      color: '#000',
    },
  },
};
const typographyInput = {
  typography: {
    type: 'typography',
    value: {
      fontWeight: '800',
      fontSize: '16px',
      fontFamily: 'Arial Black',
    },
  },
};

const borderOutput = {
  border: {
    color: {
      key: '{border.color}',
      type: 'color',
      value: '#000',
    },
    style: { key: '{border.style}', type: 'strokeStyle', value: 'solid' },
    width: {
      key: '{border.width}',
      type: 'dimension',
      value: '2px',
    },
  },
};

const typographyOutput = {
  typography: {
    fontWeight: {
      key: '{typography.fontWeight}',
      type: 'fontWeight',
      value: '800',
    },
    fontSize: {
      key: '{typography.fontSize}',
      type: 'dimension',
      value: '16px',
    },
    fontFamily: {
      key: '{typography.fontFamily}',
      type: 'fontFamily',
      value: 'Arial Black',
    },
  },
};

describe('utils', () => {
  describe('expandObjectTokens', () => {
    describe('expandObjectTokens', () => {
      describe('getTypeFromMap', () => {
        it('should return the type input as output by default', () => {
          const output = getTypeFromMap('width', 'foo', {});
          expect(output).to.equal('width');
        });

        it('should return mapped type, when overriding the base DTCG map', () => {
          const output = getTypeFromMap('width', 'border', {
            border: { width: 'foo' },
          });
          expect(output).to.equal('foo');
        });

        it('should return mapped type keyed by the composition type', () => {
          const output = getTypeFromMap('width', 'foo', {
            foo: { width: 'foo' },
          });
          expect(output).to.equal('foo');
        });

        it('should prioritise the mapped type keyed by composition type when also available on the top-level', () => {
          const output = getTypeFromMap('width', 'foo', {
            foo: { width: 'foo' },
            width: 'bar',
          });
          expect(output).to.equal('foo');
        });
      });

      describe('expandTokenInMap', () => {
        it('should expand a single object value token into multiple tokens', () => {
          const map = convertTokenData(borderInput, { output: 'map' });
          expandTokenInMap(map.get('{border}'), map, {
            expand: true,
            usesDtcg: false,
          });
          const expandedObj = convertTokenData(map, { output: 'object' });
          expect(expandedObj).to.eql(borderOutput);
        });

        it('should adjust the path properties of the newly expanded tokens if path prop is already present (platform expand)', () => {
          const map = convertTokenData(
            {
              ...borderInput,
              border: {
                ...borderInput.border,
                path: ['border'],
              },
            },
            { output: 'map' },
          );
          expandTokenInMap(map.get('{border}'), map, { expand: true, usesDtcg: false });
          expect(convertTokenData(map, { output: 'object' })).to.eql({
            ...borderOutput,
            border: {
              ...borderOutput.border,
              color: {
                ...borderOutput.border.color,
                path: ['border', 'color'],
              },
              style: {
                ...borderOutput.border.style,
                path: ['border', 'style'],
              },
              width: {
                ...borderOutput.border.width,
                path: ['border', 'width'],
              },
            },
          });
        });

        it('should handle DTCG spec tokens expansion', () => {
          const map = convertTokenData(
            {
              border: {
                $type: 'border',
                $value: {
                  width: '2px',
                  style: 'solid',
                  color: '#000',
                },
              },
            },
            { output: 'map', usesDtcg: true },
          );
          expandTokenInMap(map.get('{border}'), map, {
            expand: true,
            usesDtcg: true,
          });
          const expandedObj = convertTokenData(map, { output: 'object' });
          expect(expandedObj).to.eql({
            border: {
              color: {
                key: '{border.color}',
                $type: 'color',
                $value: '#000',
              },
              style: { key: '{border.style}', $type: 'strokeStyle', $value: 'solid' },
              width: {
                key: '{border.width}',
                $type: 'dimension',
                $value: '2px',
              },
            },
          });
        });

        it('should handle the expansion of array of objects values', () => {
          const map = convertTokenData(
            {
              shadow: {
                type: 'shadow',
                value: [
                  {
                    offsetX: '2px',
                    offsetY: '4px',
                    blur: '2px',
                    spread: '0',
                    color: '#000',
                  },
                  {
                    offsetX: '10px',
                    offsetY: '12px',
                    blur: '4px',
                    spread: '3px',
                    color: '#ccc',
                  },
                ],
                path: ['shadow'],
              },
            },
            { output: 'map' },
          );
          expandTokenInMap(map.get('{shadow}'), map, {
            expand: true,
            usesDtcg: false,
          });
          const expandedObj = convertTokenData(map, { output: 'object' });
          expect(expandedObj).to.eql({
            shadow: {
              1: {
                offsetX: {
                  key: '{shadow.1.offsetX}',
                  type: 'dimension',
                  value: '2px',
                  path: ['shadow', '1', 'offsetX'],
                },
                offsetY: {
                  key: '{shadow.1.offsetY}',
                  type: 'dimension',
                  value: '4px',
                  path: ['shadow', '1', 'offsetY'],
                },
                blur: {
                  key: '{shadow.1.blur}',
                  type: 'dimension',
                  value: '2px',
                  path: ['shadow', '1', 'blur'],
                },
                spread: {
                  key: '{shadow.1.spread}',
                  type: 'dimension',
                  value: '0',
                  path: ['shadow', '1', 'spread'],
                },
                color: {
                  key: '{shadow.1.color}',
                  type: 'color',
                  value: '#000',
                  path: ['shadow', '1', 'color'],
                },
              },
              2: {
                offsetX: {
                  key: '{shadow.2.offsetX}',
                  type: 'dimension',
                  value: '10px',
                  path: ['shadow', '2', 'offsetX'],
                },
                offsetY: {
                  key: '{shadow.2.offsetY}',
                  type: 'dimension',
                  value: '12px',
                  path: ['shadow', '2', 'offsetY'],
                },
                blur: {
                  key: '{shadow.2.blur}',
                  type: 'dimension',
                  value: '4px',
                  path: ['shadow', '2', 'blur'],
                },
                spread: {
                  key: '{shadow.2.spread}',
                  type: 'dimension',
                  value: '3px',
                  path: ['shadow', '2', 'spread'],
                },
                color: {
                  key: '{shadow.2.color}',
                  type: 'color',
                  value: '#ccc',
                  path: ['shadow', '2', 'color'],
                },
              },
            },
          });
        });
      });

      describe('expandTokens', () => {
        const onlyBorder = {
          ...borderInput,
          border: {
            ...borderInput.border,
            key: '{border}',
          },
          ...typographyOutput,
        };
        const onlyTypo = {
          ...typographyInput,
          typography: {
            ...typographyInput.typography,
            key: '{typography}',
          },
          ...borderOutput,
        };

        it('should not expand tokens when expand is false', () => {
          const expanded = expandTokens(borderInput, {
            expand: false,
            usesDtcg: false,
          });

          expect(expanded).to.eql(borderInput);
        });

        it('should expand tokens when expand is set to true', () => {
          const expanded = expandTokens(
            convertTokenData(
              {
                objectValues: {
                  nested: borderInput,
                  double: {
                    nested: typographyInput,
                  },
                },
              },
              { output: 'map' },
            ),
            {
              expand: true,
              usesDtcg: false,
            },
          );
          expect(convertTokenData(expanded, { output: 'object' })).to.eql({
            objectValues: {
              nested: {
                border: {
                  color: {
                    key: '{objectValues.nested.border.color}',
                    type: 'color',
                    value: '#000',
                  },
                  style: {
                    key: '{objectValues.nested.border.style}',
                    type: 'strokeStyle',
                    value: 'solid',
                  },
                  width: {
                    key: '{objectValues.nested.border.width}',
                    type: 'dimension',
                    value: '2px',
                  },
                },
              },
              double: {
                nested: {
                  typography: {
                    fontWeight: {
                      key: '{objectValues.double.nested.typography.fontWeight}',
                      type: 'fontWeight',
                      value: '800',
                    },
                    fontSize: {
                      key: '{objectValues.double.nested.typography.fontSize}',
                      type: 'dimension',
                      value: '16px',
                    },
                    fontFamily: {
                      key: '{objectValues.double.nested.typography.fontFamily}',
                      type: 'fontFamily',
                      value: 'Arial Black',
                    },
                  },
                },
              },
            },
          });
        });

        it('should allow conditionally expanding tokens by type using include', () => {
          const expanded = expandTokens(
            convertTokenData({ ...borderInput, ...typographyInput }, { output: 'map' }),
            {
              expand: {
                include: ['typography'],
              },
              usesDtcg: false,
            },
          );

          expect(convertTokenData(expanded, { output: 'object' })).to.eql(onlyBorder);
        });

        it('should allow conditionally expanding tokens by type using exclude', () => {
          const expanded = expandTokens(
            convertTokenData({ ...borderInput, ...typographyInput }, { output: 'map' }),
            {
              expand: {
                exclude: ['typography'],
              },
              usesDtcg: false,
            },
          );

          expect(convertTokenData(expanded, { output: 'object' })).to.eql(onlyTypo);
        });

        it('should allow conditionally expanding tokens by condition function', () => {
          const expanded = expandTokens(
            convertTokenData({ ...borderInput, ...typographyInput }, { output: 'map' }),
            {
              expand: (token) => token.value.fontWeight === '800',
              usesDtcg: false,
            },
          );
          expect(convertTokenData(expanded, { output: 'object' })).to.eql(onlyBorder);

          const expandedInclude = expandTokens(
            convertTokenData({ ...borderInput, ...typographyInput }, { output: 'map' }),
            {
              expand: { include: (token) => token.value.fontWeight === '800' },
              usesDtcg: false,
            },
          );
          expect(convertTokenData(expandedInclude, { output: 'object' })).to.eql(onlyBorder);

          const expandedExclude = expandTokens(
            convertTokenData({ ...borderInput, ...typographyInput }, { output: 'map' }),
            {
              expand: { exclude: (token) => token.value.fontWeight === '800' },
              usesDtcg: false,
            },
          );
          expect(convertTokenData(expandedExclude, { output: 'object' })).to.eql(onlyTypo);
        });

        it('should also expand tokens that are references to other tokens', () => {
          const expanded = expandTokens(
            convertTokenData(
              {
                ...borderInput,
                borderRef: {
                  type: 'border',
                  value: '{border}',
                },
              },
              { output: 'map' },
            ),
            {
              expand: true,
              usesDtcg: false,
            },
          );

          const borderOutputRef = structuredClone(borderOutput.border);
          Object.entries(borderOutputRef).forEach(([k, val]) => {
            borderOutputRef[k].key = val.key.replace('{border', '{borderRef');
          });

          expect(convertTokenData(expanded, { output: 'object' })).to.eql({
            ...borderOutput,
            borderRef: borderOutputRef,
          });
        });

        it('should expand nested composite tokens', () => {
          const nestedInput = {
            black: {
              value: '#000',
              type: 'color',
            },
            stroke: {
              value: {
                dashArray: ['0.5rem', '0.25rem'],
                lineCap: 'round',
              },
              type: 'strokeStyle',
            },
            border: {
              value: {
                color: '{black}',
                width: '3px',
                style: '{stroke}',
              },
              type: 'border',
            },
          };

          const expanded = expandTokens(convertTokenData(nestedInput, { output: 'map' }), {
            expand: true,
            usesDtcg: false,
          });

          expect(convertTokenData(expanded, { output: 'object' })).to.eql({
            black: {
              key: '{black}',
              value: '#000',
              type: 'color',
            },
            stroke: {
              dashArray: {
                key: '{stroke.dashArray}',
                value: ['0.5rem', '0.25rem'],
                type: 'dimension',
              },
              lineCap: {
                key: '{stroke.lineCap}',
                value: 'round',
                type: 'lineCap',
              },
            },
            border: {
              // color can remain unresolved ref because its resolved value is not an object
              color: { key: '{border.color}', value: '{black}', type: 'color' },
              width: { key: '{border.width}', value: '3px', type: 'dimension' },
              // style must be its resolved value because it is an object and potentially gets expanded,
              // breaking the original reference
              style: {
                dashArray: {
                  key: '{border.style.dashArray}',
                  value: ['0.5rem', '0.25rem'],
                  type: 'dimension',
                },
                lineCap: {
                  key: '{border.style.lineCap}',
                  value: 'round',
                  type: 'lineCap',
                },
              },
            },
          });
        });

        it('should expand shadow tokens', () => {
          const shadowInput = {
            shade: {
              type: 'shadow',
              value: [
                {
                  offsetX: '2px',
                  offsetY: '4px',
                  blur: '2px',
                  spread: '0',
                  color: '#000',
                },
                {
                  offsetX: '10px',
                  offsetY: '12px',
                  blur: '4px',
                  spread: '3px',
                  color: '#ccc',
                },
              ],
            },
          };

          const expanded = expandTokens(convertTokenData(shadowInput, { output: 'map' }), {
            expand: true,
            usesDtcg: false,
          });

          expect(convertTokenData(expanded, { output: 'object' })).to.eql({
            shade: {
              1: {
                offsetX: {
                  key: '{shade.1.offsetX}',
                  type: 'dimension',
                  value: '2px',
                },
                offsetY: {
                  key: '{shade.1.offsetY}',
                  type: 'dimension',
                  value: '4px',
                },
                blur: {
                  key: '{shade.1.blur}',
                  type: 'dimension',
                  value: '2px',
                },
                spread: {
                  key: '{shade.1.spread}',
                  type: 'dimension',
                  value: '0',
                },
                color: {
                  key: '{shade.1.color}',
                  type: 'color',
                  value: '#000',
                },
              },
              2: {
                offsetX: {
                  key: '{shade.2.offsetX}',
                  type: 'dimension',
                  value: '10px',
                },
                offsetY: {
                  key: '{shade.2.offsetY}',
                  type: 'dimension',
                  value: '12px',
                },
                blur: {
                  key: '{shade.2.blur}',
                  type: 'dimension',
                  value: '4px',
                },
                spread: {
                  key: '{shade.2.spread}',
                  type: 'dimension',
                  value: '3px',
                },
                color: {
                  key: '{shade.2.color}',
                  type: 'color',
                  value: '#ccc',
                },
              },
            },
          });
        });

        it('should support DTCG format', () => {
          const input = {
            border: {
              $type: 'border',
              $value: {
                width: '2px',
                style: 'solid',
                color: '#000',
              },
            },
            borderRef: {
              $type: 'border',
              $value: '{border}',
            },
          };
          const expanded = expandTokens(
            convertTokenData(input, { output: 'map', usesDtcg: true }),
            {
              expand: true,
              usesDtcg: true,
            },
          );

          expect(convertTokenData(expanded, { output: 'object', usesDtcg: true })).to.eql({
            border: {
              color: {
                key: '{border.color}',
                $type: 'color',
                $value: '#000',
              },
              style: {
                key: '{border.style}',
                $type: 'strokeStyle',
                $value: 'solid',
              },
              width: {
                key: '{border.width}',
                $type: 'dimension',
                $value: '2px',
              },
            },
            borderRef: {
              color: {
                key: '{borderRef.color}',
                $type: 'color',
                $value: '#000',
              },
              style: {
                key: '{borderRef.style}',
                $type: 'strokeStyle',
                $value: 'solid',
              },
              width: {
                key: '{borderRef.width}',
                $type: 'dimension',
                $value: '2px',
              },
            },
          });
        });

        it('should throw an error when include and exclude are combined', () => {
          const badFn = () =>
            expandTokens(convertTokenData(borderInput, { output: 'map' }), {
              expand: {
                include: ['typography'],
                exclude: ['border'],
              },
              usesDtcg: false,
            });

          expect(badFn).to.throw(
            'expand.include should not be combined with expand.exclude, use one or the other.',
          );
        });
      });
    });
  });
});
