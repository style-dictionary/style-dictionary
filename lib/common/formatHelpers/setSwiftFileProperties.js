/**
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} Options
 */

/**
 * Outputs an object with swift format configurations. Sets import, object type and access control.
 * @memberof module:formatHelpers
 * @name setSwiftFileProperties
 * @param {{objectType?:string; import?: string[]; accessControl?: string;}} options - The options object declared at configuration
 * @param {String} [objectType] - The type of the object in the final file. Could be a class, enum, struct, etc.
 * @param {String} [transformGroup] - The transformGroup of the file, so it can be applied proper import
 */
export default function setSwiftFileProperties(options, objectType, transformGroup) {
  if (options.objectType == null) {
    if (typeof objectType === 'undefined') {
      options.objectType = 'class';
    } else {
      options.objectType = objectType;
    }
  }

  if (typeof options.import === 'undefined') {
    if (typeof transformGroup === 'undefined') {
      options.import = ['UIKit'];
    } else if (['ios-swift', 'ios-swift-separate'].includes(transformGroup)) {
      options.import = ['UIKit'];
    } else {
      // future swift-ui transformGroup to be added here
      options.import = ['SwiftUI'];
    }
  } else if (typeof options.import === 'string') {
    options.import = [options.import];
  }

  if (typeof options.accessControl === 'undefined') {
    options.accessControl = 'public';
  } else if (options.accessControl !== '') {
    options.accessControl = `${options.accessControl}`;
  }

  return options;
}
