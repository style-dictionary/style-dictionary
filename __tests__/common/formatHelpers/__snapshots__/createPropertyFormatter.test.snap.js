/* @web/test-runner snapshot v1 */
export const snapshots = {};
snapshots["common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 1"] = 
`  --color-red: #FF0000; /** Foo bar qux */`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 1 */

snapshots["common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 2"] = 
`  /**
   * Foo
   * bar
   * qux
   */
  --color-blue: #0000FF;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 2 */

snapshots["common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 3"] = 
`$color-red: #FF0000; // Foo bar qux`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 3 */

snapshots["common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 4"] = 
`// Foo
// bar
// qux
$color-blue: #0000FF;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle should default to putting comment next to the output value 4 */

snapshots["common formatHelpers createPropertyFormatter commentStyle allows overriding formatting commentStyle 1"] = 
`  /** Foo bar qux */
  --color-green: #00FF00;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle allows overriding formatting commentStyle 1 */

snapshots["common formatHelpers createPropertyFormatter commentStyle allows overriding formatting commentStyle 2"] = 
`// Foo bar qux
$color-green: #00FF00;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle allows overriding formatting commentStyle 2 */

snapshots["common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 1"] = 
`  --color-red: #FF0000; /* Foo bar qux red */`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 1 */

snapshots["common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 2"] = 
`  --color-green: #00FF00; /* Foo bar qux green */`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 2 */

snapshots["common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 3"] = 
`  /**
   * Foo
   * bar
   * qux
   * blue
   */
  --color-blue: #0000FF;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle supports DTCG spec $description property for comments 3 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 1"] = 
`  --color-red: #FF0000; /** Foo bar qux red */`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 1 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 2"] = 
`  --color-green: #00FF00; /** Foo bar qux green */`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 2 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 3"] = 
`  /**
   * Foo
   * bar
   * qux
   * blue
   */
  --color-blue: #0000FF;`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $description property for comments 3 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 1"] = 
`  --color-red: #FF0000; /* Foo bar qux red */`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 1 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 2"] = 
`  --color-green: #00FF00; /* Foo bar qux green */`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 2 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 3"] = 
`  /**
   * Foo
   * bar
   * qux
   * blue
   */
  --color-blue: #0000FF;`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences 3 */

snapshots["common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences"] = 
`  /**
   * Foo
   * bar
   * qux
   * ref
   */
  --color-ref: var(--color-red);`;
/* end snapshot common formatHelpers createPropertyFormatter DTCG supports DTCG spec $value for outputReferences */

snapshots["common formatHelpers createPropertyFormatter commentStyle allows the sassdoc commentStyle 1"] = 
`  /// Foo bar qux
  --color-green: #00FF00;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle allows the sassdoc commentStyle 1 */

snapshots["common formatHelpers createPropertyFormatter commentStyle allows the sassdoc commentStyle 2"] = 
`/// Foo bar qux
$color-green: #00FF00;`;
/* end snapshot common formatHelpers createPropertyFormatter commentStyle allows the sassdoc commentStyle 2 */

