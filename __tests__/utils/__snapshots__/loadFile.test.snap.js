/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["utils loadFile should support custom json extensions by warning about unrecognized file extension, using JSON5 parser as fallback"] = 
`Unrecognized file extension: .topojson. Using JSON5 parser as a default. Alternatively, create a custom parser to handle this filetype https://styledictionary.com/reference/hooks/parsers/`;
/* end snapshot utils loadFile should support custom json extensions by warning about unrecognized file extension, using JSON5 parser as fallback */

snapshots["utils loadFile should throw error if it tries to import TS files with unsupported Node env"] = 
`Failed to load or parse JSON or JS Object:

Could not import TypeScript file: __tests__/__json_files/tokens.ts

Executing typescript files during runtime is only possible via
- NodeJS >= 22.6.0 with '--experimental-strip-types' flag
- NodeJS >= 22.18.0 where type stripping is enabled by default, no flag needed
- Deno
- Bun

If you are not able to satisfy the above requirements, consider transpiling the TypeScript file to plain JavaScript before running the Style Dictionary build process.`;
/* end snapshot utils loadFile should throw error if it tries to import TS files with unsupported Node env */

