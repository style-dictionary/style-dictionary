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
import { clearOutput, fileExists } from './__helpers.js';
import cleanFiles from '../lib/cleanFiles.js';
import StyleDictionary from '../lib/StyleDictionary.js';

const tokens = {
  foo: { $value: 'bar' },
};

const hooks = {
  formats: {
    foo: (dictionary) => JSON.stringify(dictionary.tokens),
  },
};

const platform = {
  files: [
    {
      destination: '__tests__/__output/test.json',
      format: 'foo',
    },
  ],
};

const platformWithBuildPath = {
  buildPath: '__tests__/__output/',
  files: [
    {
      destination: 'test.json',
      format: 'foo',
    },
  ],
};

describe('cleanFiles', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should delete without buildPath', async () => {
    const sd = new StyleDictionary({
      hooks,
      tokens,
      platforms: {
        bar: platform,
      },
    });
    await sd.buildPlatform('bar');
    await cleanFiles(platform);
    expect(fileExists('__tests__/__output/test.json')).to.be.false;
  });

  it('should delete with buildPath', async () => {
    const sd = new StyleDictionary({
      hooks,
      tokens,
      platforms: {
        bar: platformWithBuildPath,
      },
    });
    await sd.buildPlatform('bar');
    await cleanFiles(platformWithBuildPath);
    expect(fileExists('__tests__/__output/test.json')).to.be.false;
  });
});
