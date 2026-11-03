import { expect } from 'chai';
import { stripMetaProps } from '../../../lib/common/formatHelpers/stripMetaProps.js';

describe('common', () => {
  describe('formatHelpers', () => {
    describe('stripMetaProps', () => {
      it('should return the tokens unchanged when strip is empty array', () => {
        const tokens = {
          foo: { value: '#FF0000', name: 'foo', path: ['foo'], filePath: 'foo.json' },
        };
        expect(stripMetaProps(tokens, { stripMeta: { strip: [] } })).to.deep.equal(tokens);
      });

      it('should strip style dictionary meta props when stripMeta is set to true', () => {
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

      it('should work for DTCG', () => {
        const tokens = {
          foo: {
            $value: '#FF0000',
            name: 'foo',
            path: ['foo'],
            filePath: 'foo.json',
            comment: 'a comment',
          },
        };
        const stripped = stripMetaProps(tokens, { usesDtcg: true, stripMeta: true });
        expect(Object.keys(stripped.foo)).to.deep.equal(['$value']);
      });

      it('should strip custom props when strip is an array', () => {
        const tokens = {
          foo: { value: '#FF0000', name: 'foo', path: ['foo'], filePath: 'foo.json' },
        };
        const stripped = stripMetaProps(tokens, { stripMeta: { strip: ['name'] } });
        expect(stripped.foo).to.not.have.property('name');
        expect(stripped.foo).to.have.property('filePath');
      });

      it('should only keep custom props when keep is an array', () => {
        const tokens = {
          foo: { value: '#FF0000', name: 'foo', path: ['foo'], filePath: 'foo.json' },
        };
        const stripped = stripMetaProps(tokens, { stripMeta: { keep: ['value', 'name'] } });
        expect(stripped.foo).to.not.have.property('path');
        expect(stripped.foo).to.not.have.property('filePath');
        expect(stripped.foo).to.have.property('value');
        expect(stripped.foo).to.have.property('name');
      });
    });
  });
});
