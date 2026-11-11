import { expect } from 'chai';
import transformToken from '../../lib/transform/token.js';
import { transformTypes } from '../../lib/enums/index.js';
import { StopTransformError } from '../../lib/utils/stopTransformError.js';
import GroupMessages from '../../lib/utils/groupMessages.js';

const { value: transformTypeValue, name, attribute } = transformTypes;
const TRANSFORM_ERRORS = GroupMessages.GROUP.TransformErrors;

const config = {
  transforms: [
    {
      type: attribute,
      transform: function () {
        return {
          foo: 'bar',
        };
      },
    },
    {
      type: attribute,
      transform: function () {
        return { bar: 'foo' };
      },
    },
    {
      type: name,
      filter: function (prop) {
        return prop.attributes.foo === 'bar';
      },
      transform: function () {
        return 'hello';
      },
    },
  ],
};

describe('transform', () => {
  describe('token', () => {
    it('transform token and apply transforms', async () => {
      const test = await transformToken({ attributes: { baz: 'blah' } }, config, {});
      expect(test).to.have.nested.property('attributes.bar', 'foo');
      expect(test).to.have.property('name', 'hello');
    });

    it('can throw anything and handle gracefully', async () => {
      const test = await transformToken(
        { name: 'foo-bar', value: 'abc', path: ['foo', 'bar'], original: { value: 'abc' } },
        {
          transforms: [
            {
              type: transformTypeValue,
              transform: function () {
                return 'def';
              },
            },
            {
              type: transformTypeValue,
              transform: function () {
                throw 123;
              },
            },
          ],
        },
        {},
      );
      expect(test).to.have.property('value', 'def');
    });

    describe('StopTransformError', () => {
      beforeEach(() => {
        GroupMessages.flush(TRANSFORM_ERRORS);
      });

      afterEach(() => {
        GroupMessages.flush(TRANSFORM_ERRORS);
      });

      it('skips the remaining transforms for the token when a transform throws it', async () => {
        const skipped = [];
        const test = await transformToken(
          { name: 'foo-bar', value: 'abc', path: ['foo', 'bar'], original: { value: 'abc' } },
          {
            transforms: [
              {
                type: attribute,
                transform: () => ({ foo: 'bar' }),
              },
              {
                type: transformTypeValue,
                transform: () => 'def',
              },
              {
                type: transformTypeValue,
                name: 'stop',
                transform: () => {
                  throw new StopTransformError('invalid token');
                },
              },
              {
                type: transformTypeValue,
                transform: () => {
                  skipped.push('value');
                  return 'ghi';
                },
              },
              {
                type: name,
                transform: () => {
                  skipped.push('name');
                  return 'hello';
                },
              },
              {
                type: attribute,
                transform: () => {
                  skipped.push('attribute');
                  return { bar: 'foo' };
                },
              },
            ],
          },
          {},
        );
        // keeps the changes made by the transforms that ran before the error
        expect(test).to.have.property('value', 'def');
        expect(test).to.have.property('name', 'foo-bar');
        expect(test.attributes).to.eql({ foo: 'bar' });
        expect(skipped).to.eql([]);

        const errors = GroupMessages.fetchMessages(TRANSFORM_ERRORS);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.include(
          'could not be transformed by "stop" transform. The remaining transforms were skipped for this token.',
        );
        expect(errors[0]).to.include('invalid token');
      });

      it('does not catch other errors thrown outside of a transform function', async () => {
        await expect(
          transformToken(
            { value: 'abc', path: ['foo'], original: { value: 'abc' } },
            {
              transforms: [
                {
                  type: transformTypeValue,
                  filter: () => {
                    throw new Error('filter error');
                  },
                  transform: () => 'def',
                },
              ],
            },
            {},
          ),
        ).to.eventually.be.rejectedWith('filter error');
      });
    });

    // This allows transformObject utility to then consider this token's transformation undefined and thus "deferred"
    it('returns a token as undefined if transitive transform dictates that the transformation has to be deferred', async () => {
      const result = await transformToken(
        {
          value: '16',
          original: {
            value: '16',
          },
        },
        {
          transforms: [
            {
              type: transformTypeValue,
              transitive: true,
              transform: () => {
                return undefined;
              },
            },
          ],
        },
        {},
      );

      expect(result).to.be.undefined;
    });

    // Add more tests
  });
});
