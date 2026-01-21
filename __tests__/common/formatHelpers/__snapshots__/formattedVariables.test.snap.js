/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["formatHelpers formattedVariables should format variables with CSS format and match snapshot"] = 
`  --color-base-red-400: #EF5350;
  --color-base-blue-500: #2196F3;`;
/* end snapshot formatHelpers formattedVariables should format variables with CSS format and match snapshot */

snapshots["formatHelpers formattedVariables should format variables with SASS format and match snapshot"] = 
`$color-base-red-400: #EF5350;
$color-base-blue-500: #2196F3;`;
/* end snapshot formatHelpers formattedVariables should format variables with SASS format and match snapshot */

snapshots["formatHelpers formattedVariables should format variables with LESS format and match snapshot"] = 
`@color-base-red-400: #EF5350;
@color-base-blue-500: #2196F3;`;
/* end snapshot formatHelpers formattedVariables should format variables with LESS format and match snapshot */

snapshots["formatHelpers formattedVariables should sort variables by name when sort option is \"name\" and match snapshot"] = 
`  --color-a: #000000;
  --color-z: #111111;`;
/* end snapshot formatHelpers formattedVariables should sort variables by name when sort option is "name" and match snapshot */

snapshots["formatHelpers formattedVariables should output references when outputReferences=true and match snapshot"] = 
`  --color-base-red-400: #EF5350;
  --color-semantic-primary: var(--color-base-red-400);`;
/* end snapshot formatHelpers formattedVariables should output references when outputReferences=true and match snapshot */

