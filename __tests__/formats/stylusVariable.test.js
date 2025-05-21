import { expect } from 'chai';
// import stylus from 'stylus'; see comment in test below
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { stylusVariables } = fileFormats;

const file = {
  destination: 'output.stylus',
  format: stylusVariables,
  name: 'foo',
};

const propertyName = 'color-base-red-400';
const propertyValue = '#EF5350';

const tokens = {
  color: {
    base: {
      red: {
        400: {
          name: propertyName,
          value: propertyValue,
          original: {
            value: propertyValue,
          },
          path: ['color', 'base', 'red', '400'],
        },
      },
    },
  },
};

const format = formats[stylusVariables];

describe('formats', () => {
  describe(stylusVariables, () => {
    it('should have a valid stylus syntax and match snapshot', async () => {
      const result = format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      expect(result).to.matchSnapshot(1);

      // Unfortunately, stylus has not followed less and scss in exposing
      // a browser compatible version of the package to run client-side.
      // const stylusResult = stylus.render(result);
      // expect(stylusResult).to.matchSnapshot(2);
    });
  });
});
