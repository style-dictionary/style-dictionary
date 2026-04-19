import StyleDictionary from 'style-dictionary';
import { fileHeader } from 'style-dictionary/utils';
import { fileHeaderCommentStyles } from 'style-dictionary/enums';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import webScssTemplate from './templates/web-scss.template.js';
import iosPlistTemplate from './templates/ios-plist.template.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sd = await StyleDictionary.extend(__dirname + '/config.json');

console.log('Build started...');
console.log('\n==============================================');

sd.registerFormat({
  name: 'custom/format/scss',
  format: async ({ dictionary, file, options }) => {
    const { allTokens } = dictionary;
    const header = await fileHeader({ file, commentStyle: fileHeaderCommentStyles.long });
    return webScssTemplate({ allTokens, file, options, header });
  },
});

sd.registerFormat({
  name: 'custom/format/ios-plist',
  format: async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file, commentStyle: 'xml' });
    return iosPlistTemplate({ dictionary, options, file, header });
  },
});

// FINALLY, BUILD ALL THE PLATFORMS
await sd.buildAllPlatforms();

console.log('\n==============================================');
console.log('\nBuild completed!');
