import { expect } from 'chai';
import { formatJS, stripMetaProps } from '../../../lib/common/formats.js';

describe('common', () => {
  describe('formats', () => {
    describe('stripMetaProps', () => {
      it('should return the tokens unchanged when stripMeta is not set', () => {
        const tokens = {
          foo: { value: '#FF0000', name: 'foo', path: ['foo'], filePath: 'foo.json' },
        };
        expect(stripMetaProps(tokens, {})).to.deep.equal(tokens);
      });

      it('should strip style dictionary meta props when stripMeta is true', () => {
        const tokens = {
          foo: {
            value: '#FF0000',
            name: 'foo',
            path: ['foo'],
            filePath: 'foo.json',
            comment: 'a comment',
          },
        };
        const stripped = stripMetaProps(tokens, { stripMeta: true });
        expect(Object.keys(stripped.foo)).to.deep.equal(['value']);
      });

      it('should strip custom props when stripMeta is an object', () => {
        const tokens = {
          foo: { value: '#FF0000', name: 'foo', path: ['foo'], filePath: 'foo.json' },
        };
        const stripped = stripMetaProps(tokens, { stripMeta: { strip: ['name'] } });
        expect(stripped.foo).to.not.have.property('name');
        expect(stripped.foo).to.have.property('filePath');
      });
    });

    describe('formatJS', () => {
      it('should format javascript contents', async () => {
        const formatted = await formatJS('const   a=1;');
        expect(formatted).to.be.a('string');
        expect(formatted).to.contain('const a = 1;');
      });
    });
  });
});
