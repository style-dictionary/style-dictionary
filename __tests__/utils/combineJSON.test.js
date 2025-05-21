import { expect } from 'chai';
import { join } from 'path-unified';
import yaml from 'yaml';
import { expectThrowsAsync } from '../__helpers.js';
import combineJSON from '../../lib/utils/combineJSON.js';

describe('utils', () => {
  describe('combineJSON', () => {
    it('should return an object with usesDtcg & tokens prop', async () => {
      const test = await combineJSON(['__tests__/__json_files/*.json']);
      expect(typeof test).to.equal('object');
      const { tokens, usesDtcg } = test;
      expect(typeof tokens).to.equal('object');
      expect(typeof usesDtcg).to.equal('boolean');
    });

    it('should handle wildcards', async () => {
      const test = await combineJSON(['__tests__/__json_files/*.json']);
      expect(typeof test).to.equal('object');
      const { tokens, usesDtcg } = test;
      expect(typeof tokens).to.equal('object');
      expect(typeof usesDtcg).to.equal('boolean');
    });

    it('should handle js modules that export objects', async () => {
      const absPath = join('__tests__', '__json_files', '*.js');
      const relativePath = '__tests__/__json_files/*.js';
      const test = await combineJSON([absPath, relativePath]);
      expect(typeof test).to.equal('object');
      const { tokens, usesDtcg } = test;
      expect(typeof tokens).to.equal('object');
      expect(typeof usesDtcg).to.equal('boolean');
    });

    it('should do a deep merge', async () => {
      const { tokens } = await combineJSON(['__tests__/__json_files/shallow/*.json'], true);
      expect(tokens).to.have.property('a', 2);
      expect(tokens.b).to.eql({ a: 1, c: 2 });
      expect(tokens).to.have.nested.property('d.e.f.g', 1);
      expect(tokens).to.have.nested.property('d.e.f.h', 2);
    });

    it('should do a shallow merge', async () => {
      const { tokens } = await combineJSON(['__tests__/__json_files/shallow/*.json']);
      expect(tokens).to.have.property('a', 2);
      expect(tokens.b).to.eql({ c: 2 });
      expect(tokens).to.have.deep.property('c', [3, 4]);
      expect(tokens).not.to.have.nested.property('d.e.f.g');
      expect(tokens).to.have.nested.property('d.e.f.h', 2);
    });

    it('should apply filePath for "falsy" values', async () => {
      const { tokens } = await combineJSON(['__tests__/__json_files/not_circular.json']);
      expect(tokens).to.have.deep.property('prop0', {
        value: 0,
        filePath: '__tests__/__json_files/not_circular.json',
        isSource: true,
      });
      expect(tokens).to.have.deep.property('prop01', {
        value: '',
        filePath: '__tests__/__json_files/not_circular.json',
        isSource: true,
      });
    });

    it('should fail if there is a collision and it is passed a collision function', async () => {
      await expectThrowsAsync(
        () =>
          combineJSON(['__tests__/__json_files/shallow/*.json'], true, function Collision(opts) {
            expect(opts).to.have.property('key', 'a');
            expect(opts.target[opts.key]).to.equal(1);
            expect(opts.copy[opts.key]).to.equal(2);
            throw new Error('test');
          }),
        'test',
      );
    });

    describe('custom parsers', () => {
      it('should support yaml.parse', async () => {
        const parsers = {
          'yaml-parser': {
            pattern: /\.yaml$/,
            // yaml.parse function matches the intended function signature
            parser: ({ contents }) => yaml.parse(contents),
          },
        };
        const { tokens } = await combineJSON(
          [`__tests__/__json_files/yaml.yaml`],
          false,
          null,
          false,
          parsers,
        );
        expect(tokens).to.have.property('foo', 'bar');
        expect(tokens).to.have.property('bar', '{foo}');
      });

      it('should multiple parsers on the same file', async () => {
        const testOutput = { test: 'test' };
        const parsers = {
          'json-foo': {
            pattern: /.json$/,
            parser: () => {
              return { test: 'foo' };
            },
          },
          'json-return': {
            pattern: /.json$/,
            parser: () => {
              return testOutput;
            },
          },
        };
        const { tokens } = await combineJSON(
          [`__tests__/__json_files/simple.json`],
          false,
          null,
          false,
          parsers,
        );
        expect(tokens).to.have.property('test', 'test');
      });

      it('should support asynchronous parsers', async () => {
        const parsers = {
          'json-test': {
            pattern: /.json$/,
            parser: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              return { test: 'foo' };
            },
          },
        };
        const { tokens } = await combineJSON(
          [`__tests__/__json_files/simple.json`],
          false,
          null,
          false,
          parsers,
        );
        expect(tokens).to.have.property('test', 'foo');
      });
    });
  });
});
