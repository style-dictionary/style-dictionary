/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["integration > logger > should support subclassers to write logs to the logger under their own namespace, which can then later be logged"] = 
`⚠︎ Dimensions that are not multiples of 4 were found with transform \`sd-utils/multipleOfFour\` for 2 tokens.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`;
/* end snapshot integration > logger > should support subclassers to write logs to the logger under their own namespace, which can then later be logged */

snapshots["integration > logger > should also work with a different verbosity"] = 
`⚠︎ Dimensions that are not multiples of 4 were found with transform \`sd-utils/multipleOfFour\` for 2 tokens.
Value is not a multiple of 4, for the following tokens:
{dimensions.big} -> 15 which divided by four is 3.75
{dimensions.huge} -> 22 which divided by four is 5.5
`;
/* end snapshot integration > logger > should also work with a different verbosity */

snapshots["integration > logger > should also work with a different log levels set"] = 
`Dimensions that are not multiples of 4 were found with transform \`sd-utils/multipleOfFour\` for 2 tokens.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`;
/* end snapshot integration > logger > should also work with a different log levels set */

snapshots["integration > logger > should also work with a different log levels set on the namespace level specifically"] = 
`⚠︎ Dimensions that are not multiples of 4 were found with transform \`sd-utils/multipleOfFour\` for 2 tokens.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`;
/* end snapshot integration > logger > should also work with a different log levels set on the namespace level specifically */

