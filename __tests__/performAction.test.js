import { expect } from 'chai';
import { fs } from 'style-dictionary/fs';
import StyleDictionary from 'style-dictionary';
import { clearOutput, fileExists } from './__helpers.js';

describe('performAction', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  describe('handle actions', () => {
    it('should write to a file properly', async () => {
      const sd = new StyleDictionary({
        platforms: {
          android: {
            actions: ['test'],
            files: [],
          },
        },
      });
      await sd.hasInitialized;

      sd.registerAction({
        name: 'test',
        do: function () {
          fs.mkdirSync('__tests__/__output', { recursive: true });
          fs.writeFileSync('__tests__/__output/action.txt', 'hi', 'utf-8');
        },
        undo: function () {
          fs.unlinkSync('__tests__/__output/action.txt');
        },
      });
      await sd.buildPlatform('android');

      expect(fileExists('__tests__/__output/action.txt')).to.be.true;
    });

    it('should handle async actions to write to a file', async () => {
      const sd = new StyleDictionary({
        platforms: {
          android: {
            actions: ['test-async'],
            files: [],
          },
        },
      });
      await sd.hasInitialized;

      sd.registerAction({
        name: 'test-async',
        do: async function () {
          fs.promises.mkdir('__tests__/__output', { recursive: true });
          fs.promises.writeFile('__tests__/__output/action.txt', 'hi', 'utf-8');
        },
        undo: async function () {
          fs.promises.unlink('__tests__/__output/action.txt');
        },
      });
      await sd.buildPlatform('android');

      expect(fileExists('__tests__/__output/action.txt')).to.be.true;
    });
  });
});
