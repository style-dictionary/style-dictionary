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

export const verbosityInfo = `Use log.verbosity "verbose" or use CLI option --verbose for more details.\nRefer to: https://styledictionary.com/reference/logging/`;

export class GroupMessages {
  constructor() {
    /** @type {{[key: string]: string[]}} */
    this.groupedMessages = {};
    this.GROUP = {
      PropertyReferenceWarnings: 'Property Reference Errors',
      PropertyValueCollisions: 'Property Value Collisions',
      TemplateDeprecationWarnings: 'Template Deprecation Warnings',
      RegisterTemplateDeprecationWarnings: 'Register Template Deprecation Warnings',
      SassMapFormatDeprecationWarnings: 'Sass Map Format Deprecation Warnings',
      MissingRegisterTransformErrors: 'Missing Register Transform Errors',
      PropertyNameCollisionWarnings: 'Property Name Collision Warnings',
      FilteredOutputReferences: 'Filtered Output Reference Warnings',
      UnknownCSSFontProperties: 'Unknown CSS Font Shorthand Properties',
    };
  }

  /**
   *
   * @param {string} messageGroup
   * @returns {string[]}
   */
  flush(messageGroup) {
    const messages = this.fetchMessages(messageGroup);
    this.clear(messageGroup);
    return messages;
  }

  /**
   * @param {string} messageGroup
   * @param {string} message
   */
  add(messageGroup, message) {
    if (messageGroup) {
      if (!this.groupedMessages[messageGroup]) {
        this.groupedMessages[messageGroup] = [];
      }
      if (this.groupedMessages[messageGroup].indexOf(message) === -1) {
        this.groupedMessages[messageGroup].push(message);
      }
    }
  }

  /**
   * @param {string} messageGroup
   * @param {string} message
   */
  remove(messageGroup, message) {
    if (messageGroup && this.groupedMessages[messageGroup]?.length > 0) {
      const index = this.groupedMessages[messageGroup].indexOf(message);
      if (index !== -1) {
        this.groupedMessages[messageGroup].splice(index, 1);
      }
    }
  }

  /**
   *
   * @param {string} messageGroup
   * @returns {number}
   */
  count(messageGroup) {
    return this.groupedMessages[messageGroup] ? this.groupedMessages[messageGroup].length : 0;
  }

  /**
   *
   * @param {string} messageGroup
   * @returns {string[]}
   */
  fetchMessages(messageGroup) {
    return (messageGroup && this.groupedMessages[messageGroup]) || [];
  }

  /**
   * @param {string} messageGroup
   */
  clear(messageGroup) {
    messageGroup && this.groupedMessages[messageGroup] && delete this.groupedMessages[messageGroup];
  }
}

export default new GroupMessages();
