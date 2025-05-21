import { expect } from 'chai';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { convertToDTCG } from '../../lib/utils/convertToDTCG.js';

const data = {
  normal: {
    object: {
      colors: {
        red: {
          500: {
            value: '#f00',
            foo: 'bar',
            // key is usually only added by the convertTokenData
            // and not part of the input, but for the sake of testing,
            // we put it here initialiy
            key: '{colors.red.500}',
          },
        },
        green: {
          500: {
            value: '#0f0',
            foo: 'baz',
            key: '{colors.green.500}',
          },
        },
        blue: {
          500: {
            value: '#00f',
            foo: 'qux',
            key: '{colors.blue.500}',
          },
        },
      },
    },
    map: new Map([
      ['{colors.red.500}', { value: '#f00', foo: 'bar', key: '{colors.red.500}' }],
      ['{colors.green.500}', { value: '#0f0', foo: 'baz', key: '{colors.green.500}' }],
      ['{colors.blue.500}', { value: '#00f', foo: 'qux', key: '{colors.blue.500}' }],
    ]),
    array: [
      { key: '{colors.red.500}', value: '#f00', foo: 'bar' },
      { key: '{colors.green.500}', value: '#0f0', foo: 'baz' },
      { key: '{colors.blue.500}', value: '#00f', foo: 'qux' },
    ],
  },
};

// Bit ugly but converting the above data to DTCG style
const copyNormal = structuredClone(data.normal);
data.DTCG = {};

// object
data.DTCG.object = convertToDTCG(copyNormal.object, { applyTypesToGroup: false });

// map
data.DTCG.map = new Map();
Array.from(copyNormal.map.entries()).forEach(([key, val]) => {
  data.DTCG.map.set(key, { foo: val.foo, $value: val.value, key: val.key });
});

// array
data.DTCG.array = copyNormal.array.map((item) => ({
  key: item.key,
  foo: item.foo,
  $value: item.value,
}));

describe('utils', () => {
  describe('convertTokenData', () => {
    // Use the test below here if you need to debug a specific conversion, which is a bit harder to do
    // in the dynamically generated tests below it.
    // it.only(`should convert object to map for DTCG tokens`, () => {
    //   expect(convertTokenData(data['DTCG']['object'], { output: 'map', usesDtcg: true })).to.eql(
    //     data['DTCG']['map'],
    //   );
    // });

    // The below produces: (mode * outputs * inputs) matrix -> (2 * 3 * 3) = 18 tests
    // For mode "normal" and mode "DTCG" tokens
    Object.keys(data).forEach((mode) => {
      describe(`${mode} tests`, () => {
        // For outputs array map and object
        Object.keys(data[mode]).forEach((output) => {
          describe(`convert to ${output}`, () => {
            // Verify each input (array map and object) produces the correct result
            Object.keys(data[mode]).forEach((input) => {
              it(`should convert ${input} to ${output}`, () => {
                expect(
                  convertTokenData(data[mode][input], { output, usesDtcg: mode === 'DTCG' }),
                ).to.eql(data[mode][output]);
              });
            });
          });
        });
      });
    });
  });
});
