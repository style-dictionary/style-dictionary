import { expect } from 'chai';
import { fileExists, clearOutput } from './__helpers.js';
import cleanFile from '../lib/cleanFile.js';
import StyleDictionary from '../lib/StyleDictionary.js';

describe('cleanFile', () => {
  const buildPath = '__tests__/__output/';
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should delete a file properly', async () => {
    const file = { destination: 'test.txt', format: 'foo' };
    const sd = new StyleDictionary({
      tokens: { foo: { $value: 'bar' } },
      hooks: {
        formats: {
          foo: () => 'hi',
        },
      },
      platforms: {
        bar: {
          buildPath,
          files: [file],
        },
      },
    });
    await sd.buildPlatform('bar');
    await cleanFile(file, { buildPath });
    expect(fileExists('__tests__/__output/test.txt')).to.be.false;
  });

  it('should not error when a buildPath is specified but the destination is empty', async () => {
    const file = { destination: 'text.txt', format: 'foo' };
    const noDestination = { destination: '', format: 'foo' };
    const sd = new StyleDictionary({
      tokens: { foo: { $value: 'bar' } },
      hooks: {
        formats: {
          foo: () => 'hi',
        },
      },
      platforms: {
        bar: {
          buildPath,
          files: [file, noDestination],
        },
      },
    });
    await sd.buildPlatform('bar');
    await cleanFile(noDestination, { buildPath });
    expect(fileExists('__tests__/__output/test.txt')).to.be.false;
  });

  describe('if a file does not exist', () => {
    it('should not throw', async () => {
      await expect(cleanFile({ destination: 'non-existent.txt', format: 'foo' }, { buildPath })).to
        .not.be.rejected;
    });

    it('should not throw even in silent mode', async () => {
      await expect(
        cleanFile(
          { destination: 'test.txt', format: 'foo' },
          { buildPath, log: { verbosity: 'silent' } },
        ),
      ).to.not.be.rejected;
    });
  });
});
