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
      TransformErrors: 'Transform Errors',
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
