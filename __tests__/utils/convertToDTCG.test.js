/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { expect } from 'chai';
import { fs } from 'style-dictionary/fs';
import { hasInitialized } from '../__setup.js';
import {
  convertToDTCG,
  convertJSONToDTCG,
  convertZIPToDTCG,
  readZIP,
} from '../../lib/utils/convertToDTCG.js';

const paddingsOutput = {
  $type: 'dimension',
  size: {
    padding: {
      zero: {
        $value: 0,
      },
      tiny: {
        $value: '3',
      },
      small: {
        $value: '5',
      },
      base: {
        $value: '10',
      },
      large: {
        $value: '15',
      },
      xl: {
        $value: '20',
      },
      xxl: {
        $value: '30',
      },
    },
  },
};

const fontSizesOutput = {
  $type: 'fontSize',
  size: {
    font: {
      tiny: {
        $value: '11px',
      },
      small: {
        $value: '13px',
      },
      medium: {
        $value: '15px',
      },
      large: {
        $value: '17px',
      },
      xl: {
        $value: '21px',
      },
      xxl: {
        $value: '25px',
      },
      xxxl: {
        $value: '30px',
      },
      base: {
        $value: '{size.font.medium}',
      },
    },
  },
};

describe('utils', () => {
  describe('convertToDTCG', () => {
    it('should swap value, type and description to use $ property prefix', () => {
      const result = convertToDTCG(
        {
          colors: {
            red: {
              value: '#ff0000',
              type: 'color',
              description: 'A red color',
            },
            green: {
              value: '#00ff00',
              type: 'color',
              description: 'A green color',
            },
            blue: {
              value: '#0000ff',
              type: 'color',
              description: 'A blue color',
            },
          },
        },
        { applyTypesToGroup: false },
      );
      expect(result).to.eql({
        colors: {
          red: {
            $value: '#ff0000',
            $type: 'color',
            $description: 'A red color',
          },
          green: {
            $value: '#00ff00',
            $type: 'color',
            $description: 'A green color',
          },
          blue: {
            $value: '#0000ff',
            $type: 'color',
            $description: 'A blue color',
          },
        },
      });
    });

    it('should apply type to the upper most common ancestor', () => {
      const result = convertToDTCG({
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          green: {
            value: '#00ff00',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'color',
          },
        },
        dimensions: {
          sm: {
            value: '2px',
            type: 'dimension',
          },
          md: {
            value: '8px',
            type: 'dimension',
          },
          lg: {
            value: '16px',
            type: 'dimension',
          },
        },
      });
      expect(result).to.eql({
        colors: {
          $type: 'color',
          red: {
            $value: '#ff0000',
          },
          green: {
            $value: '#00ff00',
          },
          blue: {
            $value: '#0000ff',
          },
        },
        dimensions: {
          $type: 'dimension',
          sm: {
            $value: '2px',
          },
          md: {
            $value: '8px',
          },
          lg: {
            $value: '16px',
          },
        },
      });
    });

    it('should keep types as is when not shared with all siblings', () => {
      const result = convertToDTCG({
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          green: {
            value: '#00ff00',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'different-type',
          },
        },
        dimensions: {
          sm: {
            value: '2px',
            type: 'dimension',
          },
          md: {
            value: '8px',
            type: 'dimension',
          },
          lg: {
            value: '16px',
            type: 'dimension',
          },
        },
      });
      expect(result).to.eql({
        colors: {
          red: {
            $value: '#ff0000',
            $type: 'color',
          },
          green: {
            $value: '#00ff00',
            $type: 'color',
          },
          blue: {
            $value: '#0000ff',
            $type: 'different-type',
          },
        },
        dimensions: {
          $type: 'dimension',
          sm: {
            $value: '2px',
          },
          md: {
            $value: '8px',
          },
          lg: {
            $value: '16px',
          },
        },
      });
    });

    it('should handle input that is DTCG syntax already properly', () => {
      const result = convertToDTCG({
        colors: {
          red: {
            $value: '#ff0000',
            $type: 'color',
            $extensions: {
              'com.example': {
                modify: {
                  value: 0.5, // <- to check that it doesn't incorrectly identify this as a "token"
                  type: 'transparentize',
                },
              },
            },
          },
        },
      });
      expect(result).to.eql({
        $type: 'color',
        colors: {
          red: {
            $value: '#ff0000',
            $extensions: {
              'com.example': {
                modify: {
                  value: 0.5,
                  type: 'transparentize',
                },
              },
            },
          },
        },
      });

      const result2 = convertToDTCG({
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
            $extensions: {
              'com.example': {
                modify: {
                  value: 0.5, // <- to check that it doesn't incorrectly identify this as a "token"
                  type: 'transparentize',
                },
              },
            },
          },
        },
      });
      expect(result2).to.eql({
        $type: 'color',
        colors: {
          red: {
            $value: '#ff0000',
            $extensions: {
              'com.example': {
                modify: {
                  value: 0.5,
                  type: 'transparentize',
                },
              },
            },
          },
        },
      });
    });

    it('should work with any number of nestings', () => {
      const result = convertToDTCG({
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          grey: {
            100: {
              value: '#aaaaaa',
              type: 'color',
            },
            200: {
              deeper: {
                value: '#cccccc',
                type: 'color',
              },
            },
            400: {
              value: '#dddddd',
              type: 'color',
            },
            500: {
              foo: {
                bar: {
                  qux: {
                    value: '#eeeeee',
                    type: 'color',
                  },
                },
              },
            },
          },
          green: {
            value: '#00ff00',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'color',
          },
        },
      });
      expect(result).to.eql({
        $type: 'color',
        colors: {
          red: {
            $value: '#ff0000',
          },
          grey: {
            100: {
              $value: '#aaaaaa',
            },
            200: {
              deeper: {
                $value: '#cccccc',
              },
            },
            400: {
              $value: '#dddddd',
            },
            500: {
              foo: {
                bar: {
                  qux: {
                    $value: '#eeeeee',
                  },
                },
              },
            },
          },
          green: {
            $value: '#00ff00',
          },
          blue: {
            $value: '#0000ff',
          },
        },
      });
    });

    it('should handle scenarios where not all types are the same', () => {
      const result = convertToDTCG({
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          grey: {
            100: {
              value: '#aaaaaa',
              type: 'color',
            },
            200: {
              deeper: {
                value: '#cccccc',
                type: 'color',
              },
            },
            400: {
              value: '#dddddd',
              type: 'color',
            },
            500: {
              foo: {
                bar: {
                  qux: {
                    value: '#eeeeee',
                    type: 'different-type',
                  },
                },
              },
            },
          },
          green: {
            value: '#00ff00',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'color',
          },
        },
      });
      expect(result).to.eql({
        colors: {
          red: {
            $value: '#ff0000',
            $type: 'color',
          },
          grey: {
            100: {
              $value: '#aaaaaa',
              $type: 'color',
            },
            200: {
              $type: 'color',
              deeper: {
                $value: '#cccccc',
              },
            },
            400: {
              $value: '#dddddd',
              $type: 'color',
            },
            500: {
              $type: 'different-type',
              foo: {
                bar: {
                  qux: {
                    $value: '#eeeeee',
                  },
                },
              },
            },
          },
          green: {
            $value: '#00ff00',
            $type: 'color',
          },
          blue: {
            $value: '#0000ff',
            $type: 'color',
          },
        },
      });
    });

    it('should keep input property key order intact', () => {
      const input = {
        red: {
          type: 'color',
          value: '#ff0000',
        },
      };

      const inputKeys = Object.keys(input.red);
      const convertedKeys = Object.keys(convertToDTCG(input, { applyTypesToGroup: false }).red);
      expect(inputKeys.every((prop, index) => convertedKeys[index] === `$${prop}`)).to.be.true;
    });

    it('should order $type on group as first property', () => {
      const input = {
        colors: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          green: {
            value: '#00ff00',
            type: 'color',
          },
          blue: {
            value: '#0000ff',
            type: 'color',
          },
        },
        dimensions: {
          sm: {
            value: '2px',
            type: 'dimension',
          },
          md: {
            value: '8px',
            type: 'dimension',
          },
          lg: {
            value: '16px',
            type: 'dimension',
          },
        },
      };
      const output = convertToDTCG(input);
      const colorsKeys = Object.keys(output.colors);
      const dimensionsKeys = Object.keys(output.dimensions);
      expect(colorsKeys[0]).to.equal('$type');
      expect(dimensionsKeys[0]).to.equal('$type');
    });
  });

  describe('convertJSONToDTCG', async () => {
    const buf = await fs.promises.readFile('__tests__/__tokens/paddings.json');
    const jsonBlob = new Blob([buf], { type: 'application/json' });

    it('should allow passing a JSON blob, and converting it to DTCG JSON blob', async () => {
      const outputFile = await convertJSONToDTCG(jsonBlob);
      const output = JSON.parse(await outputFile.text());
      expect(output).to.eql(paddingsOutput);
    });

    it('should allow passing a JSON filepath, and converting it to DTCG JSON blob', async () => {
      const outputFile = await convertJSONToDTCG('__tests__/__tokens/paddings.json');
      const output = JSON.parse(await outputFile.text());
      expect(output).to.eql(paddingsOutput);
    });

    it('should throw when file is not JSON', async () => {
      // zip files mirrored to memfs for browser testing takes a while to initialize apparently...
      await hasInitialized;

      const buf = await fs.promises.readFile('__tests__/__tokens/tokens.zip');
      const zipBlob = new Blob([buf], { type: 'application/zip' });
      await expect(convertJSONToDTCG(zipBlob)).to.eventually.rejectedWith(
        'File (Blob) is of type application/zip, but a json type blob was expected.',
      );
    });
  });

  describe('convertZIPToDTCG', async () => {
    it('should allow passing a ZIP blob, and converting it to DTCG ZIP blob', async () => {
      // zip files mirrored to memfs for browser testing takes a while to initialize apparently...
      await hasInitialized;

      const buf = await fs.promises.readFile('__tests__/__tokens/tokens.zip');
      const zipBlob = new Blob([buf], { type: 'application/zip' });
      const outputZIP = await convertZIPToDTCG(zipBlob);
      const zipObjectWithData = await readZIP(outputZIP);
      expect(JSON.parse(zipObjectWithData['font_sizes.json'])).to.eql(fontSizesOutput);
      expect(JSON.parse(zipObjectWithData['paddings.json'])).to.eql(paddingsOutput);
    });

    it('should allow passing a ZIP filepath, and converting it to DTCG ZIP blob', async () => {
      // zip files mirrored to memfs for browser testing takes a while to initialize apparently...
      await hasInitialized;

      const outputZIP = await convertZIPToDTCG('__tests__/__tokens/tokens.zip');
      const zipObjectWithData = await readZIP(outputZIP);
      expect(JSON.parse(zipObjectWithData['font_sizes.json'])).to.eql(fontSizesOutput);
      expect(JSON.parse(zipObjectWithData['paddings.json'])).to.eql(paddingsOutput);
    });
  });
});
