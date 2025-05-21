import { expect } from 'chai';
import getValueByPath from '../../../lib/utils/references/getValueByPath.js';
import { convertTokenData } from '../../../lib/utils/convertTokenData.js';

const dictionary = {
  color: {
    palette: {
      neutral: {
        0: { value: '#ffffff' },
        5: { value: '#f2f3f4' },
      },
    },
    background: {
      primary: { value: '{color.palette.neutral.0}' },
    },
  },
  arr: ['one', 'two'],
};

describe('getValueByPath()', () => {
  it(`returns undefined for non-strings`, () => {
    expect(getValueByPath(42, dictionary)).to.be.undefined;
  });

  it(`returns undefined if it does not find the path in the object`, () => {
    expect(getValueByPath(['color', 'foo'], dictionary)).to.be.undefined;
    expect(getValueByPath(['color', 'foo', 'bar'], dictionary)).to.be.undefined;
  });

  it(`returns the part of the object if referenced path exists`, () => {
    expect(getValueByPath(['color', 'palette', 'neutral', '0', 'value'], dictionary)).to.equal(
      dictionary.color.palette.neutral['0'].value,
    );
    expect(getValueByPath(['color'], dictionary)).to.equal(dictionary.color);
  });

  it(`works with arrays`, () => {
    expect(getValueByPath(['arr'], dictionary)).to.equal(dictionary.arr);
  });

  it(`works with array indices`, () => {
    expect(getValueByPath(['arr', '0'], dictionary)).to.equal(dictionary.arr[0]);
  });

  it(`works with Token Map structure`, () => {
    const foundToken = getValueByPath(
      ['color', 'palette', 'neutral', '0'],
      convertTokenData(dictionary, { output: 'map' }),
    );
    expect(foundToken).to.eql({
      ...dictionary.color.palette.neutral['0'],
      key: '{color.palette.neutral.0}',
    });
  });
});
