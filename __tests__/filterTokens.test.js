import { expect } from 'chai';
import filterTokens from '../lib/filterTokens.js';
import { clearOutput } from './__helpers.js';
import { convertTokenData } from '../lib/utils/convertTokenData.js';

const colorRed = {
  value: '#FF0000',
  type: 'color',
  original: {
    value: '#FF0000',
  },
  name: 'color-red',
  path: ['color', 'red'],
};

const colorBlue = {
  value: '#0000FF',
  type: 'color',
  original: {
    value: '#0000FF',
  },
  name: 'color-blue',
  path: ['color', 'blue'],
};

const sizeSmall = {
  value: '2px',
  type: 'dimension',
  original: {
    value: '2px',
  },
  name: 'size-small',
  path: ['size', 'small'],
};

const sizeLarge = {
  value: '4px',
  type: 'dimension',
  original: {
    value: '4px',
  },
  name: 'size-large',
  path: ['size', 'large'],
};

const not_kept = {
  value: 0,
  type: 'number',
  original: {
    value: 0,
  },
  name: 'falsy_values-not_kept',
  path: ['falsy_values', 'not_kept'],
};

const kept = {
  value: 0,
  type: 'number',
  original: {
    value: 0,
  },
  name: 'falsy_values-kept',
  path: ['falsy_values', 'kept'],
};

const tokens = {
  color: {
    red: colorRed,
    blue: colorBlue,
  },
  size: {
    small: sizeSmall,
    large: sizeLarge,
  },
};

const random_meta_tokens = {
  description: null,
  meta: undefined,
  more_meta: [],
  foo: {
    description: null,
    meta: undefined,
    more_meta: [],
    bar: {
      description: null,
      meta: undefined,
      more_meta: [],
      value: 0,
      type: 'number',
      original: {
        value: 0,
      },
      name: 'foo-bar',
      path: ['foo', 'bar'],
    },
  },
  qux: {
    description: null,
    meta: undefined,
    more_meta: [],
    value: 0,
    type: 'number',
    original: {
      value: 0,
    },
    name: 'qux',
    path: ['qux'],
  },
};

const random_meta_dictionary = {
  tokens: random_meta_tokens,
  allTokens: convertTokenData(random_meta_tokens, { output: 'array' }),
};

const falsy_values = {
  kept: kept,
  not_kept: not_kept,
};

const dictionary = {
  tokens,
  allTokens: convertTokenData(tokens, { output: 'array' }),
};

const falsy_dictionary = {
  tokens: falsy_values,
  allTokens: convertTokenData(falsy_values, { output: 'array' }),
};

describe('filterTokens', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should return the original dictionary if no filter is provided', async () => {
    expect(dictionary).to.eql(await filterTokens(dictionary));
  });

  it('should work with a filter function', async () => {
    const filter = (token) => token.path.includes('size');
    const filteredDictionary = await filterTokens(dictionary, filter);
    filteredDictionary.allTokens.forEach((token) => {
      expect(token).to.not.equal(colorRed);
      expect(token).not.to.not.equal(colorBlue);
    });
    expect(filteredDictionary.allTokens).to.eql([
      { ...sizeSmall, key: '{size.small}' },
      { ...sizeLarge, key: '{size.large}' },
    ]);
    expect(filteredDictionary.tokens).to.have.property('size');
    expect(filteredDictionary.tokens).to.not.have.property('color');
  });

  it('should work with falsy values and a filter function', async () => {
    const filter = (token) => token.path.includes('kept');

    const filteredDictionary = await filterTokens(falsy_dictionary, filter);
    filteredDictionary.allTokens.forEach((token) => {
      expect(token).to.not.equal(not_kept);
    });
    expect(filteredDictionary.allTokens).to.eql([{ ...kept, key: '{kept}' }]);
    expect(filteredDictionary.tokens).to.have.property('kept');
    expect(filteredDictionary.tokens).to.not.have.property('not_kept');
  });

  it('should work with random metadata props inside tokens / token groups', async () => {
    const filter = (token) => {
      return token.path.includes('bar');
    };

    const filteredDictionary = await filterTokens(random_meta_dictionary, filter);
    expect(filteredDictionary.allTokens).to.eql([
      { ...random_meta_tokens.foo.bar, key: '{foo.bar}' },
    ]);
    expect(filteredDictionary.tokens).to.have.nested.property('foo.bar');
    expect(filteredDictionary.tokens).to.not.have.property('qux');
  });

  it('should work with async filters', async () => {
    const filtered = await filterTokens(dictionary, async (token) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return token.path.includes('size');
    });

    expect(filtered.allTokens.map((token) => token.name)).to.eql(['size-small', 'size-large']);
    expect(filtered.tokens).to.eql({
      size: {
        small: {
          value: '2px',
          type: 'dimension',
          original: { value: '2px' },
          name: 'size-small',
          path: ['size', 'small'],
        },
        large: {
          value: '4px',
          type: 'dimension',
          original: {
            value: '4px',
          },
          name: 'size-large',
          path: ['size', 'large'],
        },
      },
    });
  });

  describe('should throw if', () => {
    it('filter is a string', async () => {
      await expect(filterTokens(dictionary, 'my_filter')).to.eventually.rejectedWith(
        /filter is not a function/,
      );
    });

    it('filter is an object', async () => {
      await expect(filterTokens(dictionary, { type: 'dimension' })).to.eventually.rejectedWith(
        /filter is not a function/,
      );
    });
  });
});
