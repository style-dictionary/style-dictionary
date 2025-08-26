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
import { expectThrowsAsync } from '../__helpers.js';
import { loadFile } from '../../lib/utils/loadFile.js';
import { stubMethod, restore } from 'hanbi';
import { isNode } from '../../lib/utils/isNode.js';

describe('utils', () => {
  describe('loadFile', () => {
    it('should fail on invalid JSON', async () => {
      await expectThrowsAsync(
        () => loadFile('__tests__/__json_files/broken/broken.json'),
        "Failed to load or parse JSON or JS Object:\n\nJSON5: invalid character '!' at 2:18",
      );
    });

    it('should support json5', async () => {
      const tokens = await loadFile('__tests__/__json_files/shallow/3.json5');
      expect(tokens).to.have.property('json5A', 5);
      expect(tokens.d).to.have.property('json5e', 1);
    });

    it('should support jsonc', async () => {
      const tokens = await loadFile('__tests__/__json_files/shallow/4.jsonc');
      expect(tokens).to.have.property('jsonCA', 5);
      expect(tokens.d).to.have.property('jsonCe', 1);
    });

    it('should support js', async () => {
      const tokens = await loadFile('__tests__/__json_files/simple.js');
      expect(tokens).to.have.property('foo', 'bar');
    });

    it('should structuredClone the original module', async () => {
      const load = () => loadFile('__tests__/__json_files/simple.js');
      (await load()).bar = 'baz';
      expect(await load()).not.have.property('bar');
    });

    it('should now throw if structuredClone of the original module fails due to dynamic content', async () => {
      let err;
      try {
        await loadFile('__tests__/__configs/test-dynamic.js');
      } catch (e) {
        err = e;
      }
      expect(err).to.be.undefined;
    });

    it('should throw error if it tries to import TS files with unsupported Node env', async () => {
      if (isNode) {
        const semver = (await import('semver')).default;
        const version = process.version;
        if (semver.lt(version, '22.18.0')) {
          let err;
          try {
            await loadFile('__tests__/__json_files/tokens.ts');
          } catch (e) {
            err = e;
          }
          await expect(err.message).to.matchSnapshot();
        }
      }
    });

    it('should support custom json extensions by warning about unrecognized file extension, using JSON5 parser as fallback', async () => {
      const stub = stubMethod(console, 'warn');
      const tokens = await loadFile('__tests__/__json_files/shallow/5.topojson');
      expect(tokens).to.have.property('jsonCA', 5);
      expect(tokens.d).to.have.property('jsonCe', 1);
      await expect([...stub.calls][0].args[0]).to.matchSnapshot();
      restore();
    });
  });
});
