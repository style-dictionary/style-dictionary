import { transformGroups, transforms } from '../enums/index.js';

const {
  attributeCti,
  attributeColor,
  nameHuman,
  nameCamel,
  nameKebab,
  nameSnake,
  namePascal,
  colorHex,
  colorHex8android,
  colorComposeColor,
  colorUIColor,
  colorUIColorSwift,
  colorCss,
  sizeObject,
  sizeRemToSp,
  sizeRemToDp,
  sizePx,
  sizeRem,
  sizeRemToPt,
  sizeComposeRemToSp,
  sizeComposeRemToDp,
  sizeComposeEm,
  sizeSwiftRemToCGFloat,
  htmlIcon,
  contentObjCLiteral,
  contentSwiftLiteral,
  timeSeconds,
  fontFamilyCss,
  cubicBezierCss,
  strokeStyleCssShorthand,
  borderCssShorthand,
  typographyCssShorthand,
  transitionCssShorthand,
  shadowCssShorthand,
  assetUrl,
  assetObjCLiteral,
  assetSwiftLiteral,
  colorHex8flutter,
  contentFlutterLiteral,
  assetFlutterLiteral,
  sizeFlutterRemToDouble,
} = transforms;

/**
 * @namespace TransformGroups
 */

/**
 * @type {Record<string, string[]>}
 */
export default {
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/kebab](/reference/hooks/transforms/predefined#namectikebab)
   * [size/px](/reference/hooks/transforms/predefined#sizepx)
   * [color/css](/reference/hooks/transforms/predefined#colorcss)
   *
   * @memberof TransformGroups
   */
  [transformGroups.web]: [attributeCti, nameKebab, sizePx, colorCss],

  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/pascal](/reference/hooks/transforms/predefined#namectipascal)
   * [size/rem](/reference/hooks/transforms/predefined#sizerem)
   * [color/hex](/reference/hooks/transforms/predefined#colorhex)
   *
   * @memberof TransformGroups
   */
  [transformGroups.js]: [attributeCti, namePascal, sizeRem, colorHex],

  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/kebab](/reference/hooks/transforms/predefined#namectikebab)
   * [time/seconds](/reference/hooks/transforms/predefined#timeseconds)
   * [html/icon](/reference/hooks/transforms/predefined#htmlicon)
   * [size/rem](/reference/hooks/transforms/predefined#sizerem)
   * [color/css](/reference/hooks/transforms/predefined#colorcss)
   * [asset/url](/reference/hooks/transforms/predefined#asset/url)
   * [fontFamily/css](/reference/hooks/transforms/predefined#fontfamilycss)
   * [cubicBezier/css](/reference/hooks/transforms/predefined#cubicbezier)
   * [strokeStyle/css/shorthand](/reference/hooks/transforms/predefined#strokestylecssshorthand)
   * [border/css/shorthand](/reference/hooks/transforms/predefined#bordercssshorthand)
   * [typography/css/shorthand](/reference/hooks/transforms/predefined#typographycssshorthand)
   * [transition/css/shorthand](/reference/hooks/transforms/predefined#transitioncssshorthand)
   * [shadow/css/shorthand](/reference/hooks/transforms/predefined#shadowcssshorthand)
   *
   * @memberof TransformGroups
   */
  [transformGroups.scss]: [
    attributeCti,
    nameKebab,
    timeSeconds,
    htmlIcon,
    sizeRem,
    colorCss,
    assetUrl,
    fontFamilyCss,
    cubicBezierCss,
    // object-value tokens
    strokeStyleCssShorthand,
    borderCssShorthand,
    typographyCssShorthand,
    transitionCssShorthand,
    shadowCssShorthand,
  ],

  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/kebab](/reference/hooks/transforms/predefined#namectikebab)
   * [time/seconds](/reference/hooks/transforms/predefined#timeseconds)
   * [html/icon](/reference/hooks/transforms/predefined#htmlicon)
   * [size/rem](/reference/hooks/transforms/predefined#sizerem)
   * [color/css](/reference/hooks/transforms/predefined#colorcss)
   * [asset/url](/reference/hooks/transforms/predefined#asset/url)
   * [fontFamily/css](/reference/hooks/transforms/predefined#fontfamilycss)
   * [cubicBezier/css](/reference/hooks/transforms/predefined#cubicbezier)
   * [strokeStyle/css/shorthand](/reference/hooks/transforms/predefined#strokestylecssshorthand)
   * [border/css/shorthand](/reference/hooks/transforms/predefined#bordercssshorthand)
   * [typography/css/shorthand](/reference/hooks/transforms/predefined#typographycssshorthand)
   * [transition/css/shorthand](/reference/hooks/transforms/predefined#transitioncssshorthand)
   * [shadow/css/shorthand](/reference/hooks/transforms/predefined#shadowcssshorthand)
   *
   * @memberof TransformGroups
   */
  [transformGroups.css]: [
    attributeCti,
    nameKebab,
    timeSeconds,
    htmlIcon,
    sizeRem,
    colorCss,
    assetUrl,
    fontFamilyCss,
    cubicBezierCss,
    // object-value tokens
    strokeStyleCssShorthand,
    borderCssShorthand,
    typographyCssShorthand,
    transitionCssShorthand,
    shadowCssShorthand,
  ],

  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/kebab](/reference/hooks/transforms/predefined#namectikebab)
   * [time/seconds](/reference/hooks/transforms/predefined#timeseconds)
   * [html/icon](/reference/hooks/transforms/predefined#htmlicon)
   * [size/rem](/reference/hooks/transforms/predefined#sizerem)
   * [color/hex](/reference/hooks/transforms/predefined#colorhex)
   * [asset/url](/reference/hooks/transforms/predefined#asset/url)
   * [fontFamily/css](/reference/hooks/transforms/predefined#fontfamilycss)
   * [cubicBezier/css](/reference/hooks/transforms/predefined#cubicbezier)
   * [strokeStyle/css/shorthand](/reference/hooks/transforms/predefined#strokestylecssshorthand)
   * [border/css/shorthand](/reference/hooks/transforms/predefined#bordercssshorthand)
   * [typography/css/shorthand](/reference/hooks/transforms/predefined#typographycssshorthand)
   * [transition/css/shorthand](/reference/hooks/transforms/predefined#transitioncssshorthand)
   * [shadow/css/shorthand](/reference/hooks/transforms/predefined#shadowcssshorthand)
   *
   * @memberof TransformGroups
   */
  [transformGroups.less]: [
    attributeCti,
    nameKebab,
    timeSeconds,
    htmlIcon,
    sizeRem,
    colorHex,
    assetUrl,
    fontFamilyCss,
    cubicBezierCss,
    // object-value tokens
    strokeStyleCssShorthand,
    borderCssShorthand,
    typographyCssShorthand,
    transitionCssShorthand,
    shadowCssShorthand,
  ],

  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [attribute/color](/reference/hooks/transforms/predefined#attributecolor)
   * [name/human](/reference/hooks/transforms/predefined#namehuman)
   *
   * @memberof TransformGroups
   */
  [transformGroups.html]: [attributeCti, attributeColor, nameHuman],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/snake](/reference/hooks/transforms/predefined#namectisnake)
   * [color/hex8android](/reference/hooks/transforms/predefined#colorhex8android)
   * [size/remToSp](/reference/hooks/transforms/predefined#sizeremtosp)
   * [size/remToDp](/reference/hooks/transforms/predefined#sizeremtodp)
   *
   * @memberof TransformGroups
   */
  [transformGroups.android]: [attributeCti, nameSnake, colorHex8android, sizeRemToSp, sizeRemToDp],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/camel](/reference/hooks/transforms/predefined#namecamel)
   * [color/composeColor](/reference/hooks/transforms/predefined#colorcomposecolor)
   * [size/compose/em](/reference/hooks/transforms/predefined#sizecomposeem)
   * [size/compose/remToSp](/reference/hooks/transforms/predefined#sizecomposeremtosp)
   * [size/compose/remToDp](/reference/hooks/transforms/predefined#sizecomposeremtodp)
   *
   * @memberof TransformGroups
   */
  [transformGroups.compose]: [
    attributeCti,
    nameCamel,
    colorComposeColor,
    sizeComposeEm,
    sizeComposeRemToSp,
    sizeComposeRemToDp,
  ],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/pascal](/reference/hooks/transforms/predefined#namectipascal)
   * [color/UIColor](/reference/hooks/transforms/predefined#coloruicolor)
   * [content/objC/literal](/reference/hooks/transforms/predefined#contentobjcliteral)
   * [asset/objC/literal](/reference/hooks/transforms/predefined#assetobjcliteral)
   * [size/remToPt](/reference/hooks/transforms/predefined#sizeremtopt)
   *
   * @memberof TransformGroups
   */
  [transformGroups.ios]: [
    attributeCti,
    namePascal,
    colorUIColor,
    contentObjCLiteral,
    assetObjCLiteral,
    sizeRemToPt,
  ],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/camel](/reference/hooks/transforms/predefined#namecamel)
   * [color/UIColorSwift](/reference/hooks/transforms/predefined#coloruicolorswift)
   * [content/swift/literal](/reference/hooks/transforms/predefined#contentswiftliteral)
   * [asset/swift/literal](/reference/hooks/transforms/predefined#assetswiftliteral)
   * [size/swift/remToCGFloat](/reference/hooks/transforms/predefined#sizeswiftremtocgfloat)
   *
   * @memberof TransformGroups
   */
  [transformGroups.iosSwift]: [
    attributeCti,
    nameCamel,
    colorUIColorSwift,
    contentSwiftLiteral,
    assetSwiftLiteral,
    sizeSwiftRemToCGFloat,
  ],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/camel](/reference/hooks/transforms/predefined#namecamel)
   * [color/UIColorSwift](/reference/hooks/transforms/predefined#coloruicolorswift)
   * [content/swift/literal](/reference/hooks/transforms/predefined#contentswiftliteral)
   * [asset/swift/literal](/reference/hooks/transforms/predefined#assetswiftliteral)
   * [size/swift/remToCGFloat](/reference/hooks/transforms/predefined#sizeswiftremtocgfloat)
   *
   * This is to be used if you want to have separate files per category and you don't want the category (e.g., color) as the lead value in the name of the token (e.g., StyleDictionaryColor.baseText instead of StyleDictionary.colorBaseText).
   *
   * @memberof TransformGroups
   */
  [transformGroups.iosSwiftSeparate]: [
    attributeCti,
    nameCamel,
    colorUIColorSwift,
    contentSwiftLiteral,
    assetSwiftLiteral,
    sizeSwiftRemToCGFloat,
  ],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   *
   * @memberof TransformGroups
   */
  [transformGroups.assets]: [attributeCti],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/camel](/reference/hooks/transforms/predefined#nameccamel)
   * [color/hex8flutter](/reference/hooks/transforms/predefined#colorhex8flutter)
   * [size/flutter/remToDouble](/reference/hooks/transforms/predefined#sizeflutterremtodouble)
   * [content/flutter/literal](/reference/hooks/transforms/predefined#contentflutterliteral)
   * [asset/flutter/literal](/reference/hooks/transforms/predefined#assetflutterliteral)
   *
   * @memberof TransformGroups
   */
  [transformGroups.flutter]: [
    attributeCti,
    nameCamel,
    colorHex8flutter,
    sizeFlutterRemToDouble,
    contentFlutterLiteral,
    assetFlutterLiteral,
  ],
  /**
   * Transforms:
   *
   * [attribute/cti](/reference/hooks/transforms/predefined#attributecti)
   * [name/camel](/reference/hooks/transforms/predefined#namecamel)
   * [color/hex8flutter](/reference/hooks/transforms/predefined#colorhex8flutter)
   * [size/flutter/remToDouble](/reference/hooks/transforms/predefined#sizeflutterremtodouble)
   * [content/flutter/literal](/reference/hooks/transforms/predefined#contentflutterliteral)
   * [asset/flutter/literal](/reference/hooks/transforms/predefined#assetflutterliteral)
   *
   * This is to be used if you want to have separate files per category and you don't want the category (e.g., color) as the lead value in the name of the token (e.g., StyleDictionaryColor.baseText instead of StyleDictionary.colorBaseText).
   *
   * @memberof TransformGroups
   */
  [transformGroups.flutterSeparate]: [
    attributeCti,
    nameCamel,
    colorHex8flutter,
    sizeFlutterRemToDouble,
    contentFlutterLiteral,
    assetFlutterLiteral,
  ],

  /**
   * Transforms:
   *
   * [name/camel](/reference/hooks/transforms/predefined#namecamel)
   * [size/object](/reference/hooks/transforms/predefined#sizeobject)
   * [color/css](/reference/hooks/transforms/predefined#colorcss)
   *
   * @memberof TransformGroups
   */
  [transformGroups.reactNative]: [nameCamel, colorCss, sizeObject],
};
