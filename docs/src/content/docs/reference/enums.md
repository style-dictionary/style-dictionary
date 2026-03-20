---
title: Enums
sidebar:
  order: 4
---

This page documents the enums introduced in Style-Dictionary. Enums provide a set of named constants that enhance code maintainability, readability, and type safety.

Although Style-Dictionary offers TypeScript type definition files, it cannot provide actual TypeScript enums because its code base is written in JavaScript using JSDocs type annotations, and real enums are a TypeScript-only feature. To still leverage the benefits of enums and reduce the use of hardcoded strings throughout the JavaScript codebase of Style-Dictionary itself, we have introduced enum-like JavaScript objects, which provide the same kind of type safety, but can also be used in JavaScript projects.

These enum-like objects are used internally within Style-Dictionary, and you can also use them in your own configurations, whether you are working with TypeScript or JavaScript.

## Enums Usage Example

The following shows how to use some of the provided enum-like objects in an exmaple Style-Dictionary configuration.

```javascript
import StyleDictionary from 'style-dictionary';
import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  logVerbosityLevels,
  transformGroups,
  transforms,
} from 'style-dictionary/enums';

const sd = new StyleDictionary({
  source: ['tokens/*.json'],
  platforms: {
    scss: {
      transformGroup: transformGroups.scss,
      transforms: [transforms.nameKebab],
      buildPath: 'build/',
      files: [
        {
          destination: 'variables.scss',
          format: formats.scssVariables,
        },
      ],
    },
  },
  log: {
    warnings: logWarningLevels.warn,
    verbosity: logVerbosityLevels.verbose,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw,
    },
  },
});
```

### Read-Only Enums in Typescript

Optionally, if you want to ensure that the enums are completely read-only, you can use `as const`, like it is described in [the Typescript docs](https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums).
This means a type error will also be shown if the enum itself is being assigned to or if something attempts to introduce or delete a member.

```typescript
import { formats, transforms } from 'style-dictionary/enums';

const formatsReadOnly = formats as const;
```

## List of Enums

### Actions

```javascript
// enums/actions.js
export const actions = {
  androidCopyImages: 'android/copyImages',
  copyAssets: 'copy_assets',
};
```

### Comment Positions

```javascript
// enums/commentPositions.js
export const commentPositions = {
  above: 'above',
  inline: 'inline',
};
```

### Comment Styles

```javascript
// enums/commentStyles.js
export const commentStyles = {
  short: 'short',
  long: 'long',
  none: 'none',
};
```

### File Header Comment Styles

```javascript
// enums/fileHeaderCommentStyles.js
export const fileHeaderCommentStyles = {
  short: 'short',
  long: 'long',
  xml: 'xml',
};
```

### Formats

```javascript
// enums/formats.js
export const formats = {
  androidColors: 'android/colors',
  androidDimens: 'android/dimens',
  androidFontDimens: 'android/fontDimens',
  androidIntegers: 'android/integers',
  androidResources: 'android/resources',
  androidStrings: 'android/strings',
  composeObject: 'compose/object',
  cssVariables: 'css/variables',
  flutterClassDart: 'flutter/class.dart',
  iosColorsH: 'ios/colors.h',
  iosColorsM: 'ios/colors.m',
  iosMacros: 'ios/macros',
  iosPlist: 'ios/plist',
  iosSingletonH: 'ios/singleton.h',
  iosSingletonM: 'ios/singleton.m',
  iosStaticH: 'ios/static.h',
  iosStaticM: 'ios/static.m',
  iosStringsH: 'ios/strings.h',
  iosStringsM: 'ios/strings.m',
  iosSwiftAnySwift: 'ios-swift/any.swift',
  iosSwiftClassSwift: 'ios-swift/class.swift',
  iosSwiftEnumSwift: 'ios-swift/enum.swift',
  javascriptEs6: 'javascript/es6',
  javascriptModule: 'javascript/module',
  javascriptModuleFlat: 'javascript/module-flat',
  javascriptObject: 'javascript/object',
  javascriptUmd: 'javascript/umd',
  json: 'json',
  jsonNested: 'json/nested',
  jsonFlat: 'json/flat',
  sketchPalette: 'sketchPalette',
  sketchPaletteV2: 'sketch/palette/v2',
  lessIcons: 'less/icons',
  lessVariables: 'less/variables',
  scssIcons: 'scss/icons',
  scssMapDeep: 'scss/map-deep',
  scssMapFlat: 'scss/map-flat',
  scssVariables: 'scss/variables',
  stylusVariables: 'stylus/variables',
  typescriptEs6Declarations: 'typescript/es6-declarations',
  typescriptModuleDeclarations: 'typescript/module-declarations',
};
```

### Log Broken Reference Levels

```javascript
// enums/logBrokenReferenceLevels.js
export const logBrokenReferenceLevels = {
  throw: 'throw',
  console: 'console',
};
```

### Log Verbosity Levels

```javascript
// enums/logVerbosityLevels.js
export const logVerbosityLevels = {
  default: 'default',
  silent: 'silent',
  verbose: 'verbose',
};
```

### Log Warning Levels

```javascript
// enums/logWarningLevels.js
export const logWarningLevels = {
  warn: 'warn',
  error: 'error',
  disabled: 'disabled',
};
```

### Property Format Names

```javascript
// enums/propertyFormatNames.js
export const propertyFormatNames = {
  css: 'css',
  sass: 'sass',
  less: 'less',
  stylus: 'stylus',
};
```

### Sorts

```javascript
// enums/sorts.js
export const builtInSorts = {
  name: 'name',
};
```

### Token Types (WIP)

> This will become its own page, to cover all token types and all properties within token type values.
> For now, all we have is the `dimension` token type `unit` property.

####

```javascript
export const dimensionUnit = {
  px: /** @type {'px'} */ ('px'),
  rem: /** @type {'rem'} */ ('rem'),
};
```

### Transform Groups

```javascript
// enums/transformGroups.js
export const transformGroups = {
  web: 'web',
  js: 'js',
  scss: 'scss',
  css: 'css',
  less: 'less',
  html: 'html',
  android: 'android',
  compose: 'compose',
  ios: 'ios',
  iosSwift: 'ios-swift',
  iosSwiftSeparate: 'ios-swift-separate',
  assets: 'assets',
  flutter: 'flutter',
  flutterSeparate: 'flutter-separate',
  reactNative: 'react-native',
};
```

### Transforms

```javascript
// enums/transforms.js
export const transforms = {
  attributeCti: 'attribute/cti',
  attributeColor: 'attribute/color',
  nameHuman: 'name/human',
  nameCamel: 'name/camel',
  nameKebab: 'name/kebab',
  nameSnake: 'name/snake',
  nameConstant: 'name/constant',
  namePascal: 'name/pascal',
  colorRgb: 'color/rgb',
  colorHsl: 'color/hsl',
  colorHsl4: 'color/hsl-4',
  colorHex: 'color/hex',
  colorHex8android: 'color/hex8android',
  colorComposeColor: 'color/composeColor',
  colorUIColor: 'color/UIColor',
  colorUIColorSwift: 'color/UIColorSwift',
  colorColorSwiftUI: 'color/ColorSwiftUI',
  colorCss: 'color/css',
  colorSketch: 'color/sketch',
  sizeSp: 'size/sp',
  sizeDp: 'size/dp',
  sizeObject: 'size/object',
  sizeRemToSp: 'size/remToSp',
  sizeRemToDp: 'size/remToDp',
  sizePx: 'size/px',
  sizeRem: 'size/rem',
  sizeRemToPt: 'size/remToPt',
  sizeComposeRemToSp: 'size/compose/remToSp',
  sizeComposeRemToDp: 'size/compose/remToDp',
  sizeComposeEm: 'size/compose/em',
  sizeComposeDp: 'size/compose/dp',
  sizeComposeSp: 'size/compose/sp',
  sizeSwiftRemToCGFloat: 'size/swift/remToCGFloat',
  sizeRemToPx: 'size/remToPx',
  sizePxToRem: 'size/pxToRem',
  htmlIcon: 'html/icon',
  contentQuote: 'content/quote',
  contentObjCLiteral: 'content/objC/literal',
  contentSwiftLiteral: 'content/swift/literal',
  timeSeconds: 'time/seconds',
  fontFamilyCss: 'fontFamily/css',
  cubicBezierCss: 'cubicBezier/css',
  strokeStyleCssShorthand: 'strokeStyle/css/shorthand',
  borderCssShorthand: 'border/css/shorthand',
  typographyCssShorthand: 'typography/css/shorthand',
  transitionCssShorthand: 'transition/css/shorthand',
  shadowCssShorthand: 'shadow/css/shorthand',
  assetUrl: 'asset/url',
  assetBase64: 'asset/base64',
  assetPath: 'asset/path',
  assetObjCLiteral: 'asset/objC/literal',
  assetSwiftLiteral: 'asset/swift/literal',
  colorHex8flutter: 'color/hex8flutter',
  contentFlutterLiteral: 'content/flutter/literal',
  assetFlutterLiteral: 'asset/flutter/literal',
  sizeFlutterRemToDouble: 'size/flutter/remToDouble',
  /**
   * @deprecated use 'color/hex instead
   */
  colorHex8: 'color/hex8',
};
```

### Transform Types

```javascript
// enums/transformTypes.js
export const transformTypes = {
  attribute: 'attribute',
  name: 'name',
  value: 'value',
};
```

## Benefits of Using Enums

Enums, or enumerations, offer a robust way to define a set of named constants in your code. Unlike hardcoded string values, enums provide several key benefits:

1. **Consistency**: Enums centralize the definition of constants, making it easier to manage and update them across your codebase. This reduces the risk of typos and inconsistencies that can occur with hardcoded strings. This improves maintainability.
2. **Readability**: By using descriptive names for constants, enums make your code more readable and self-documenting. This helps other developers understand the purpose and usage of the constants without needing to refer to external documentation.
3. **Type Safety**: Enums can provide better type checking during development, catching errors at compile time rather than runtime. This ensures that only valid values are used, reducing the likelihood of bugs.
4. **Future-proofing**: Enums offer greater flexibility for future changes. When you need to add or modify values, you can do so in a single location without having to search and replace hardcoded strings throughout your code. This also means that on the consumer side, such a change is not a breaking change.
