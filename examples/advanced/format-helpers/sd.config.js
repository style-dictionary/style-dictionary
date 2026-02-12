import {
  createPropertyFormatter,
  fileHeader,
  formattedVariables,
  sortByReference,
} from 'style-dictionary/utils';
import { fileHeaderCommentStyles, transformGroups } from 'style-dictionary/enums';

export default {
  hooks: {
    formats: {
      myFormat: async ({ dictionary, options, file }) => {
        const { outputReferences } = options;
        // createPropertyFormatter will return a function that can be passed to
        // .map() to format each token. Pass it the `outputReferences` and dictionary
        // along with a formatting object that tells the function how to format
        // each line.
        const formatProperty = createPropertyFormatter({
          outputReferences,
          dictionary,
          formatting: {
            prefix: '$',
            separator: ':',
            suffix: ';',
          },
        });

        // fileHeader takes in the file configuration as well as a commentStyle
        // or formatting object and will generate a file header comment in the
        // proper style. If the file has a custom file header defined, or
        // showFileHeader option, it will honor those.
        // Use fileHeaderCommentStyles enum for the commentStyle parameter.
        return (
          (await fileHeader({ file, commentStyle: fileHeaderCommentStyles.short })) +
          dictionary.allTokens
            // sortByReference returns a function that can be used as to sort
            // an array. This will sort the array so that references always
            // come after their instantiation so that there are no errors
            // when consuming this file.
            .sort(sortByReference(dictionary))
            .map(formatProperty)
            .join('\n')
        );
      },

      // You could also use the formattedVariables function which is a quicker
      // way to do all the steps above. It will take formatting information
      // and sort and map all the tokens.
      myOtherFormat: async ({ dictionary, options, file }) => {
        const { outputReferences } = options;
        const lineSeparator = `\n`;

        // Here we are using fileHeader with the formatting.fileHeader API,
        // this will show the file header with a block-style comment
        return (
          (await fileHeader({
            file,
            formatting: {
              fileHeader: {
                lineSeparator,
                prefix: ` * `,
                header: `/**${lineSeparator}`,
                footer: `${lineSeparator} */${lineSeparator}${lineSeparator}`,
              },
            },
          })) +
          formattedVariables({
            dictionary,
            outputReferences,
            formatting: {
              prefix: '$',
              separator: ':',
              suffix: ';',
            },
          })
        );
      },
    },
  },
  source: ['tokens/**/*'],
  platforms: {
    scss: {
      transformGroup: transformGroups.scss,
      buildPath: 'build/',
      files: [
        {
          destination: 'variables.scss',
          format: 'myFormat',
        },
        {
          destination: 'variablesWithReferences.scss',
          format: 'myOtherFormat',
          options: {
            outputReferences: true,
            // Creates a custom file header message
            // the `fileHeader` format helper function will use this file header
            // for this file.
            fileHeader: (defaultMessage) => [
              ...defaultMessage,
              'hello',
              "is it me you're looking for?",
            ],
          },
        },
      ],
    },
  },
};
