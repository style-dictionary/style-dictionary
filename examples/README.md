<img src="https://github.com/style-dictionary/style-dictionary/raw/main/docs/assets/logo.png" alt="Style Dictionary logo" title="StyleDictionary" width="100" align="right" />

# Examples

To get you started, there are some example packages included that you can use. You can [take a look at the code on Github](https://github.com/style-dictionary/style-dictionary/tree/main/examples/) or you can use the CLI included to generate a new package using some of these examples. Here is how you can do that:

```bash
$ mkdir MyFolder
$ cd MyFolder
$ style-dictionary init [example]
```

Where `[example]` is one of: `basic`, `complete`.

## Basic

[View on Github](https://github.com/style-dictionary/style-dictionary/tree/main/examples/basic)

This example code is bare-bones to show you what this framework can do. Use this if you want to play around with what the Style Dictionary can do.

## Complete

[View on Github](https://github.com/style-dictionary/style-dictionary/tree/main/examples/complete)

This is a more complete package and should have everything you need to get started. This package can be consumed as a Cocoapod on iOS, as a node module for web, and as a local library for Android.

## Advanced

[View the folder](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced)

If you want to look at more advanced examples of possible applications and customizations of Style Dictionary, the [`examples/advanced`](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/) folder on GitHub contains these extra folders:

- [**assets-base64-embed**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/assets-base64-embed) shows how it's possible to embed and distribute assets – like images, icons and fonts – directly as design tokens.
- [**create-react-app**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/create-react-app) shows how to integrate Style Dictionary into a React application.
- [**create-react-native-app**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/create-react-native-app) shows how to integrate Style Dictionary into a React Native application.
- [**custom-parser**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/custom-parser) shows how to use custom parsers for token files.
- [**custom-transforms**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/custom-transforms) shows how to use custom transforms (and transformGroups) to apply custom "transformations" to the design tokens.
- [**flutter**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/flutter) shows how to integrate with Flutter applications.
- [**matching-build-files**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/matching-build-files) shows how to output files 1-to-1 with source files.
- [**multi-brand-multi-platform**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/multi-brand-multi-platform) shows how to set up Style Dictionary to support a multi-brand (for brand theming) and multi-platform (web, iOS, Android) solution, with token values depending on brand and platforms.
- [**node-modules-as-config-and-properties**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/node-modules-as-config-and-properties) shows how to use Javascript rather than JSON for configuration and token files.
- [**npm-module**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/npm-module) shows how to set up a style dictionary as an npm module, either to publish to a local npm service or to publish externally.
- [**referencing_aliasing**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/referencing_aliasing) shows how to use referencing (or "aliasing") to reference a value -or an attribute– of a token and assign it to the value –or attribute– of another token.
- [**s3**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/s3) shows how to set up a style dictionary to build files for different platforms (web, iOS, Android) and upload those build artifacts, together with a group of assets, to an S3 bucket.
- [**tokens-deprecation**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/tokens-deprecation) shows one way to deprecate tokens by adding metadata to tokens and using custom formats to output comments in the generated files.
- [**transitive-transforms**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/transitive-transforms) shows how to use transitive transforms to transform references
- [**variables-in-outputs**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/variables-in-outputs) shows you how to use the `outputReferences` option to generate files variable references in them.
- [**yaml-tokens**](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/yaml-tokens) shows how to use a custom parser to define your source files in YAML rather than JSON.

---

#### Do you think an example is missing?<br/>Do you want to see another example added to the project?<br/>Do you have a working example that we can add to the list?

Fantastic! Let us know by [filing an issue](https://github.com/style-dictionary/style-dictionary/issues).
