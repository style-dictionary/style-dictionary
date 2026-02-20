/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["integration output references should allow using outputReferencesTransformed to not output refs when value has been transitively transformed"] = 
`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --base: rgb(0,0,0);
  --referred: rgba(0,0,0,0.12);
}
`;
/* end snapshot integration output references should allow using outputReferencesTransformed to not output refs when value has been transitively transformed */

snapshots["integration output references should support outputReferencesTransformed for values that were originally objects"] = 
`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --axis-0: 0;
  --shadow: inset 0 0 0 0 rgba(0,0,0,0.4);
}
`;
/* end snapshot integration output references should support outputReferencesTransformed for values that were originally objects */

snapshots["integration output references should warn the user if filters out references briefly"] = 
`⚠️ __integration__/build/filteredVariables.css
While building filteredVariables.css, filtered out token references were found; output may be unexpected. Ignore this warning if intentional.

Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/`;
/* end snapshot integration output references should warn the user if filters out references briefly */

snapshots["integration output references should not warn the user if filters out references is prevented with outputReferencesFilter"] = 
`
css
✔︎ __integration__/build/filteredVariables.css`;
/* end snapshot integration output references should not warn the user if filters out references is prevented with outputReferencesFilter */

snapshots["integration output references should warn the user if filters out references with a detailed message when using verbose logging"] = 
`⚠️ __integration__/build/filteredVariables.css
While building filteredVariables.css, filtered out token references were found; output may be unexpected. Ignore this warning if intentional.
Here are the references that are used but not defined in the file:
color.core.neutral.100
color.core.neutral.0
color.core.neutral.200
color.core.red.0
color.core.orange.0
color.core.green.0
color.core.blue.0
This is caused when combining a filter and \`outputReferences\`.`;
/* end snapshot integration output references should warn the user if filters out references with a detailed message when using verbose logging */

snapshots["integration output references should properly reference tokens in dtcg format"] = 
`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --base: #ff0000;
  --referred: var(--base);
}
`;
/* end snapshot integration output references should properly reference tokens in dtcg format */

