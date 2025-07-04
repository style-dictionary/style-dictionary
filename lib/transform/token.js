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

import usesReferences from '../utils/references/usesReferences.js';
import { transformTypes } from '../enums/index.js';

/**
 * @typedef {import('../../types/Volume.d.ts').Volume} Volume
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../types/Config.d.ts').Config} Config
 * @typedef {import('../../types/Transform.d.ts').Transform} Transform
 * @typedef {import('../../types/Transform.d.ts').NameTransform} NameTransform
 */

const {
  value: transformTypeValue,
  name: transformTypeName,
  attribute: transformTypeAttribute,
} = transformTypes;

/**
 *
 * @param {Token} token
 * @param {Error} error
 * @param {string} name
 * @param {boolean} usesDtcg
 */
function createErrorMessage(token, error, name, usesDtcg) {
  const { path, filePath } = token;
  const value = usesDtcg ? token.$value : token.value;
  return `Transform Error: token "${path.join('.')}"${filePath ? ` (${filePath})` : ''} with value: 
  \`${JSON.stringify(value, null, 2)}\` (type: ${typeof value})
could not be transformed by "${name}" transform. Threw the following error: ${error ? `\n\n${error.message}\n${error.stack}` : ''}`;
}

/**
 * @typedef {{
 *   token: Token,
 *   error: Error,
 *   message: string,
 *   transformName: string
 * }} TransformError
 */

/**
 * @param {Transform} transform
 * @param {Token} token
 * @param {PlatformConfig} config
 * @param {Config} options
 * @param {Volume} [vol]
 */
async function _transformTokenWrapper(transform, token, config, options, vol) {
  let to_ret;
  try {
    to_ret = await transform.transform(token, config, options, vol);
  } catch (e) {
    if (e instanceof Error) {
      const transformError = createErrorMessage(token, e, transform.name, !!options?.usesDtcg);
      options.logger?.add('error.transforms', /** @type {string} */ (token.key), {
        token,
        error: e,
        message: transformError,
        transformName: transform.name,
      });

      // Return a sensible fallback value
      switch (transform.type) {
        case 'attribute':
          return token.attributes;
        case 'name':
          return token.name;
        case 'value':
          return options.usesDtcg ? token.$value : token.value;
      }
    }
  }
  return to_ret;
}

/**
 * Applies all transforms to a token. This is a pure function,
 * it returns a new token object rather than mutating it inline.
 * @private
 * @param {Token} token
 * @param {PlatformConfig} config
 * @param {Config} options
 * @param {Volume} [vol]
 * @returns {Promise<Token|undefined>} - A new property object with transforms applied.
 */
export default async function transformToken(token, config, options, vol) {
  const to_ret = structuredClone(token);

  const transforms = /** @type {Transform[]} */ (config.transforms) || [];

  for (let i = 0; i < transforms.length; i++) {
    const transform = transforms[i];

    if (!transform.filter || transform.filter(to_ret, options)) {
      if (transform.type === transformTypeName) {
        to_ret.name = /** @type {string} */ (
          await _transformTokenWrapper(transform, to_ret, config, options, vol)
        );
      }
      // Don't try to transform the value if it is referencing another value
      // Only try to transform if the value is not a string or if it has '{}'
      if (
        transform.type === transformTypeValue &&
        !usesReferences(options.usesDtcg ? token.$value : token.value)
      ) {
        // Only transform non-referenced values (from original)
        // and transitive transforms if the value has been resolved
        if (
          !usesReferences(options.usesDtcg ? token.original.$value : token.original.value) ||
          transform.transitive
        ) {
          const transformedValue = await _transformTokenWrapper(
            transform,
            to_ret,
            config,
            options,
            vol,
          );
          if (transformedValue === undefined) {
            return undefined;
          }
          to_ret[options.usesDtcg ? '$value' : 'value'] = transformedValue;
        }
      }

      if (transform.type === transformTypeAttribute) {
        const attrs = /** @type {Record<string, unknown>} */ (
          await _transformTokenWrapper(transform, to_ret, config, options, vol)
        );

        to_ret.attributes = {
          ...to_ret.attributes,
          ...attrs,
        };
      }
    }
  }

  return to_ret;
}
