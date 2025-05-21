import { expect } from 'chai';
import { fs } from 'style-dictionary/fs';
import StyleDictionary from 'style-dictionary';
import { fileExists, clearOutput } from './__helpers.js';

const StyleDictionaryExtended = new StyleDictionary({
  platforms: {
    android: {
      actions: ['cleanAction.test.js'],
      files: [],
    },
  },
});

StyleDictionaryExtended.registerAction({
  name: 'cleanAction.test.js',
  do: function () {
    fs.mkdirSync('__tests__/__output', { recursive: true });
    fs.writeFileSync('__tests__/__output/action.txt', 'hi');
  },
  undo: function () {
    fs.unlinkSync('__tests__/__output/action.txt');
  },
});

describe('cleanAction', () => {
  describe('clean actions', () => {
    beforeEach(() => {
      clearOutput();
    });

    afterEach(() => {
      clearOutput();
    });

    it('should delete a file properly', async () => {
      await StyleDictionaryExtended.buildPlatform('android');
      await StyleDictionaryExtended.cleanPlatform('android');
      expect(fileExists('__tests__/__output/action.txt')).to.be.false;
    });
  });
});
