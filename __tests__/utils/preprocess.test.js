import { expect } from 'chai';
import { preprocess } from '../../lib/utils/preprocess.js';

describe('utils', () => {
  describe('preprocess', () => {
    it('should support multiple preprocessors', async () => {
      const output = await preprocess(
        {
          foo: {
            value: '5px',
          },
        },
        ['preprocessorA'],
        {
          preprocessorA: (tokens) => {
            tokens.bar = tokens.foo;
            return tokens;
          },
        },
      );
      expect(output).to.have.property('bar').eql({
        value: '5px',
      });
    });

    it('should support asynchronous preprocessors as well', async () => {
      const output = await preprocess(
        {
          foo: {
            value: '5px',
          },
        },
        ['preprocessorA', 'preprocessorB', 'preprocessorC'],
        {
          preprocessorA: (tokens) => {
            tokens.bar = tokens.foo;
            return tokens;
          },
          preprocessorB: async (tokens) => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            tokens.baz = tokens.bar;
            return tokens;
          },

          preprocessorC: (tokens) => {
            tokens.qux = tokens.baz;
            return tokens;
          },
        },
      );
      expect(output).to.have.property('qux').eql({
        value: '5px',
      });
    });

    it('should support asynchronous preprocessors in the order of the config array', async () => {
      const output = await preprocess(
        {
          foo: {
            value: '5px',
          },
        },
        ['preprocessorA', 'preprocessorC', 'preprocessorB'],
        {
          preprocessorB: (tokens) => {
            tokens.baz = tokens.qux;
            return tokens;
          },
          preprocessorC: async (tokens) => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            tokens.qux = tokens.bar;
            return tokens;
          },
          preprocessorA: (tokens) => {
            tokens.bar = tokens.foo;
            return tokens;
          },
        },
      );
      expect(output).to.have.property('baz').eql({
        value: '5px',
      });
    });
  });
});
