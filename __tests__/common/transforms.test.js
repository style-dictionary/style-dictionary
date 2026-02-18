import { expect } from 'chai';
import Color from 'tinycolor2';
import transforms, { isColor, isDTCGColorObject } from '../../lib/common/transforms.js';
import { transforms as transformNames } from '../../lib/enums/index.js';

const {
  nameCamel,
  nameKebab,
  nameSnake,
  nameConstant,
  attributeColor,
  attributeCti,
  colorHex,
  colorHex8,
  colorHex8android,
  colorRgb,
  colorHsl4,
  colorHsl,
  colorComposeColor,
  colorUIColor,
  colorUIColorSwift,
  colorColorSwiftUI,
  colorHex8flutter,
  colorCss,
  colorSketch,
  colorOklch,
  colorOklab,
  colorP3,
  colorLch,
  sizeSp,
  sizeDp,
  sizeObject,
  sizeRemToSp,
  sizeRemToDp,
  sizePx,
  sizeRemToPt,
  sizeComposeRemToSp,
  sizeComposeEm,
  sizeComposeRemToDp,
  sizeComposeDp,
  sizeComposeSp,
  sizeSwiftRemToCGFloat,
  sizeRemToPx,
  sizePxToRem,
  sizeRem,
  sizeFlutterRemToDouble,
  contentQuote,
  htmlIcon,
  contentObjCLiteral,
  assetUrl,
  assetObjCLiteral,
  timeSeconds,
  fontFamilyCss,
  cubicBezierCss,
  typographyCssShorthand,
  borderCssShorthand,
  strokeStyleCssShorthand,
  transitionCssShorthand,
  shadowCssShorthand,
  assetPath,
} = transformNames;

describe('common', () => {
  describe('transforms', () => {
    describe(nameCamel, () => {
      it('should handle prefix', () => {
        expect(
          transforms[nameCamel].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {
              prefix: 'prefix',
            },
          ),
        ).to.equal('prefixOneTwoThree');
      });

      it('should handle no prefix', () => {
        expect(
          transforms[nameCamel].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {},
          ),
        ).to.equal('oneTwoThree');
      });
    });

    describe(nameKebab, () => {
      it('should handle prefix', () => {
        expect(
          transforms[nameKebab].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {
              prefix: 'prefix',
            },
          ),
        ).to.equal('prefix-one-two-three');
      });

      it('should handle no prefix', () => {
        expect(
          transforms[nameKebab].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {},
          ),
        ).to.equal('one-two-three');
      });
    });

    describe(nameSnake, () => {
      it('should handle prefix', () => {
        expect(
          transforms[nameSnake].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {
              prefix: 'prefix',
            },
          ),
        ).to.equal('prefix_one_two_three');
      });

      it('should handle no prefix', () => {
        expect(
          transforms[nameSnake].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {},
          ),
        ).to.equal('one_two_three');
      });
    });

    describe(nameConstant, () => {
      it('should handle prefix', () => {
        expect(
          transforms[nameConstant].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {
              prefix: 'prefix',
            },
          ),
        ).to.equal('PREFIX_ONE_TWO_THREE');
      });

      it('should handle no prefix', () => {
        expect(
          transforms[nameConstant].transform(
            {
              path: ['one', 'two', 'three'],
            },
            {},
          ),
        ).to.equal('ONE_TWO_THREE');
      });
    });

    describe(attributeColor, () => {
      it('should handle normal colors', () => {
        const attributes = transforms[attributeColor].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(attributes).to.have.nested.property('rgb.a', 1);
        expect(attributes).to.have.nested.property('rgb.r', 170);
        expect(attributes).to.have.nested.property('hsl.s', 0);
      });
      it('should handle colors with transparency', () => {
        const attributes = transforms[attributeColor].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        const attributes2 = transforms[attributeColor].transform(
          {
            value: 'rgba(170,170,170,0.6)',
          },
          {},
          {},
        );
        expect(attributes).to.have.nested.property('rgb.a', 0.6);
        expect(attributes).to.have.nested.property('rgb.r', 170);
        expect(attributes).to.have.nested.property('hsl.s', 0);
        expect(attributes2).to.have.nested.property('rgb.a', 0.6);
        expect(attributes2).to.have.nested.property('rgb.r', 170);
        expect(attributes2).to.have.nested.property('hsl.s', 0);
      });
    });

    describe('transform', () => {
      describe(attributeCti, () => {
        const prop = {
          path: ['color', 'background', 'button', 'primary', 'active', 'extra'],
        };
        const propShort = { path: ['color', 'primary'] };
        const propOverride = {
          path: ['button', 'primary', 'border', 'width'],
          attributes: { category: 'size', component: 'button' },
        };

        const attrs = transforms[attributeCti].transform(prop, {}, {});
        const attrsShort = transforms[attributeCti].transform(propShort, {}, {});
        const attrsOverride = transforms[attributeCti].transform(propOverride, {}, {});

        it('should assign attributes correctly', () => {
          expect(attrs).eql({
            category: 'color',
            type: 'background',
            item: 'button',
            subitem: 'primary',
            state: 'active',
          });
        });

        it('should not assign path props when path is short', () => {
          expect(attrsShort).eql({
            category: 'color',
            type: 'primary',
          });
        });

        it('should leave other attributes alone', () => {
          expect(attrsOverride).to.have.property('component', 'button');
        });

        it('should not override previously assigned path attributes', () => {
          expect(attrsOverride).to.have.property('category', 'size');
        });
      });
    });

    describe(colorHex, () => {
      it('should handle hex colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa');
      });

      it('should handle hex8 colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: '#aaaaaaaa',
          },
          {},
          {},
        );
        const value2 = transforms[colorHex].transform(
          {
            value: '#aaaaaaff',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaaaa');
        expect(value2).to.equal('#aaaaaa');
      });

      it('should handle rgb colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: 'rgb(170,170,170)',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa');
      });

      it('should handle rgba colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: 'rgba(170,170,170,0.5)',
          },
          {},
          {},
        );
        const value2 = transforms[colorHex].transform(
          {
            value: 'rgba(170,170,170,1.0)',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa80');
        expect(value2).to.equal('#aaaaaa');
      });

      it('should handle rgb (object) colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: {
              r: '170',
              g: '170',
              b: '170',
            },
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa');
      });

      it('should handle rgba (object) colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: {
              r: '170',
              g: '170',
              b: '170',
              a: '0.5',
            },
          },
          {},
          {},
        );
        const value2 = transforms[colorHex].transform(
          {
            value: {
              r: '170',
              g: '170',
              b: '170',
              a: '1.0',
            },
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa80');
        expect(value2).to.equal('#aaaaaa');
      });

      it('should handle hsl colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: 'hsl(0,0,0.5)',
          },
          {},
          {},
        );
        expect(value).to.equal('#808080');
      });

      it('should handle hsla colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: 'hsla(0,0,0.5,0.5)',
          },
          {},
          {},
        );
        const value2 = transforms[colorHex].transform(
          {
            value: 'hsla(0,0,0.5,1.0)',
          },
          {},
          {},
        );
        expect(value).to.equal('#80808080');
        expect(value2).to.equal('#808080');
      });

      it('should handle hsl (object) colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: {
              h: '0',
              s: '0',
              l: '0.5',
            },
          },
          {},
          {},
        );
        expect(value).to.equal('#808080');
      });

      it('should handle hsla (object) colors', () => {
        const value = transforms[colorHex].transform(
          {
            value: {
              h: '0',
              s: '0',
              l: '0.5',
              a: '0.5',
            },
          },
          {},
          {},
        );
        const value2 = transforms[colorHex].transform(
          {
            value: {
              h: '0',
              s: '0',
              l: '0.5',
              a: '1.0',
            },
          },
          {},
          {},
        );
        expect(value).to.equal('#80808080');
        expect(value2).to.equal('#808080');
      });

      it('should handle DTCG sRGB object format', () => {
        const value = transforms[colorHex].transform(
          {
            $value: { colorSpace: 'srgb', components: [1, 0.42, 0.21], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('#ff6b36');
      });

      it('should handle DTCG object format with alpha', () => {
        const value = transforms[colorHex].transform(
          {
            $value: { colorSpace: 'srgb', components: [0.667, 0.667, 0.667], alpha: 0.5 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('#aaaaaa80');
      });

      it('should handle DTCG oklch color space', () => {
        const value = transforms[colorHex].transform(
          {
            $value: { colorSpace: 'oklch', components: [0.628, 0.258, 29.23], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        // Should convert oklch to sRGB hex
        expect(value).to.match(/^#[0-9a-f]{6}$/i);
      });

      it('should use hex fallback for out-of-gamut colors', () => {
        const value = transforms[colorHex].transform(
          {
            $value: {
              colorSpace: 'display-p3',
              components: [1, 0, 0],
              alpha: 1,
              hex: '#ff0000',
            },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('#ff0000');
      });
    });

    describe(colorHex8, () => {
      it('should handle hex colors', () => {
        const value = transforms[colorHex8].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaaff');
      });

      it('should handle rgb colors', () => {
        const value = transforms[colorHex8].transform(
          {
            value: 'rgb(170,170,170)',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaaff');
      });

      it('should handle rgba colors', () => {
        const value = transforms[colorHex8].transform(
          {
            value: 'rgba(170,170,170,0.6)',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa99');
      });
    });

    describe(colorHex8android, () => {
      it('should handle colors without alpha', () => {
        const value = transforms[colorHex8android].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('#ffaaaaaa');
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorHex8android].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('#99aaaaaa');
      });
    });

    describe(colorRgb, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorRgb].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('rgb(170, 170, 170)');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorRgb].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('rgba(170, 170, 170, 0.6)');
      });

      it('should handle DTCG sRGB object format', () => {
        const value = transforms[colorRgb].transform(
          {
            $value: { colorSpace: 'srgb', components: [0.667, 0.667, 0.667], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('rgb(170, 170, 170)');
      });

      it('should handle DTCG object format with alpha', () => {
        const value = transforms[colorRgb].transform(
          {
            $value: { colorSpace: 'srgb', components: [0.667, 0.667, 0.667], alpha: 0.6 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('rgba(170, 170, 170, 0.6)');
      });
    });

    describe(colorHsl4, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorHsl4].transform(
          {
            value: '#009688',
          },
          {},
          {},
        );
        expect(value).to.equal('hsl(174 100% 29%)');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorHsl4].transform(
          {
            value: '#00968899',
          },
          {},
          {},
        );
        expect(value).to.equal('hsl(174 100% 29% / 0.6)');
      });
    });

    describe(colorHsl, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorHsl].transform(
          {
            value: '#009688',
          },
          {},
          {},
        );
        expect(value).to.equal('hsl(174, 100%, 29%)');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorHsl].transform(
          {
            value: '#00968899',
          },
          {},
          {},
        );
        expect(value).to.equal('hsla(174, 100%, 29%, 0.6)');
      });
    });

    describe(colorComposeColor, () => {
      it('should handle color without alpha', () => {
        const value = transforms[colorComposeColor].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(0xffaaaaaa)');
      });

      it('should handle color with alpha', () => {
        const value = transforms[colorComposeColor].transform(
          {
            value: '#aaaaaaff',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(0xffaaaaaa)');
      });
    });

    describe(colorUIColor, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorUIColor].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal(
          '[UIColor colorWithRed:0.667f green:0.667f blue:0.667f alpha:1.000f]',
        );
      });

      it('should retain enough precision when converting to decimal', () => {
        const value = transforms[colorUIColor].transform(
          {
            value: '#1d1d1d',
          },
          {},
          {},
        );
        expect(value).to.equal(
          '[UIColor colorWithRed:0.114f green:0.114f blue:0.114f alpha:1.000f]',
        );
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorUIColor].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal(
          '[UIColor colorWithRed:0.667f green:0.667f blue:0.667f alpha:0.600f]',
        );
      });
    });

    describe(colorUIColorSwift, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorUIColorSwift].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('UIColor(red: 0.667, green: 0.667, blue: 0.667, alpha: 1)');
      });

      it('should retain enough precision when converting to decimal', () => {
        const value = transforms[colorUIColorSwift].transform(
          {
            value: '#1d1d1d',
          },
          {},
          {},
        );
        expect(value).to.equal('UIColor(red: 0.114, green: 0.114, blue: 0.114, alpha: 1)');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorUIColorSwift].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('UIColor(red: 0.667, green: 0.667, blue: 0.667, alpha: 0.6)');
      });
    });

    describe(colorColorSwiftUI, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorColorSwiftUI].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(red: 0.667, green: 0.667, blue: 0.667, opacity: 1)');
      });

      it('should retain enough precision when converting to decimal', () => {
        const value = transforms[colorColorSwiftUI].transform(
          {
            value: '#1d1d1d',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(red: 0.114, green: 0.114, blue: 0.114, opacity: 1)');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorColorSwiftUI].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(red: 0.667, green: 0.667, blue: 0.667, opacity: 0.6)');
      });
    });

    describe(colorHex8flutter, () => {
      it('should handle colors without alpha', () => {
        const value = transforms[colorHex8flutter].transform(
          {
            value: '#aaaaaa',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(0xFFAAAAAA)');
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorHex8flutter].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('Color(0x99AAAAAA)');
      });
    });

    describe(colorCss, () => {
      it('should handle normal colors', () => {
        const value = transforms[colorCss].transform(
          {
            value: 'rgb(170, 170, 170)',
          },
          {},
          {},
        );
        expect(value).to.equal('#aaaaaa');
      });

      it('should handle colors with transparency', () => {
        const value = transforms[colorCss].transform(
          {
            value: '#aaaaaa99',
          },
          {},
          {},
        );
        expect(value).to.equal('rgba(170, 170, 170, 0.6)');
      });
    });

    describe(colorSketch, () => {
      it('should retain hex specificity', () => {
        const originalHex = '#0b7dbb';
        const value = transforms[colorSketch].transform(
          {
            value: originalHex,
          },
          {},
          {},
        );
        const newHex = Color({
          r: value.red * 255,
          g: value.green * 255,
          b: value.blue * 255,
        });
        expect(originalHex).equal(newHex.toHexString());
      });

      it('should handle DTCG sRGB object format', () => {
        const value = transforms[colorSketch].transform(
          {
            $value: { colorSpace: 'srgb', components: [0.5, 0.5, 0.5], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(parseFloat(value.red)).to.be.closeTo(0.5, 0.01);
        expect(parseFloat(value.green)).to.be.closeTo(0.5, 0.01);
        expect(parseFloat(value.blue)).to.be.closeTo(0.5, 0.01);
        expect(value.alpha).to.equal(1);
      });
    });

    describe(colorOklch, () => {
      it('should transform hex color to oklch', () => {
        const value = transforms[colorOklch].transform(
          {
            value: '#ff0000',
          },
          {},
          {},
        );
        expect(value).to.match(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\.\d+\)$/);
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorOklch].transform(
          {
            value: 'rgba(255, 0, 0, 0.5)',
          },
          {},
          {},
        );
        expect(value).to.match(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\.\d+ \/ 0\.5\)$/);
      });

      it('should handle DTCG oklch object format', () => {
        const value = transforms[colorOklch].transform(
          {
            $value: { colorSpace: 'oklch', components: [0.7, 0.15, 180], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('oklch(0.7000 0.1500 180.00)');
      });

      it('should handle DTCG sRGB color conversion to oklch', () => {
        const value = transforms[colorOklch].transform(
          {
            $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.match(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\.\d+\)$/);
      });
    });

    describe(colorOklab, () => {
      it('should transform hex color to oklab', () => {
        const value = transforms[colorOklab].transform(
          {
            value: '#ff0000',
          },
          {},
          {},
        );
        expect(value).to.match(/^oklab\(\d+\.\d+ -?\d+\.\d+ -?\d+\.\d+\)$/);
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorOklab].transform(
          {
            value: 'rgba(255, 0, 0, 0.5)',
          },
          {},
          {},
        );
        expect(value).to.match(/^oklab\(\d+\.\d+ -?\d+\.\d+ -?\d+\.\d+ \/ 0\.5\)$/);
      });

      it('should handle DTCG oklab object format', () => {
        const value = transforms[colorOklab].transform(
          {
            $value: { colorSpace: 'oklab', components: [0.7, -0.1, 0.1], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('oklab(0.7000 -0.1000 0.1000)');
      });
    });

    describe(colorP3, () => {
      it('should transform hex color to display-p3', () => {
        const value = transforms[colorP3].transform(
          {
            value: '#ff0000',
          },
          {},
          {},
        );
        expect(value).to.match(/^color\(display-p3 \d+\.\d+ \d+\.\d+ \d+\.\d+\)$/);
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorP3].transform(
          {
            value: 'rgba(255, 0, 0, 0.5)',
          },
          {},
          {},
        );
        expect(value).to.match(/^color\(display-p3 \d+\.\d+ \d+\.\d+ \d+\.\d+ \/ 0\.5\)$/);
      });

      it('should handle DTCG display-p3 object format', () => {
        const value = transforms[colorP3].transform(
          {
            $value: { colorSpace: 'display-p3', components: [0.5, 0.5, 0.5], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('color(display-p3 0.50000 0.50000 0.50000)');
      });
    });

    describe(colorLch, () => {
      it('should transform hex color to lch', () => {
        const value = transforms[colorLch].transform(
          {
            value: '#ff0000',
          },
          {},
          {},
        );
        expect(value).to.match(/^lch\(\d+\.\d+% \d+\.\d+ \d+\.\d+\)$/);
      });

      it('should handle colors with alpha', () => {
        const value = transforms[colorLch].transform(
          {
            value: 'rgba(255, 0, 0, 0.5)',
          },
          {},
          {},
        );
        expect(value).to.match(/^lch\(\d+\.\d+% \d+\.\d+ \d+\.\d+ \/ 0\.5\)$/);
      });

      it('should handle DTCG lch object format', () => {
        const value = transforms[colorLch].transform(
          {
            $value: { colorSpace: 'lch', components: [50, 30, 180], alpha: 1 },
            $type: 'color',
          },
          {},
          { usesDtcg: true },
        );
        expect(value).to.equal('lch(50.00% 30.00 180.00)');
      });
    });

    describe(sizeSp, () => {
      it('should work', () => {
        const value = transforms[sizeSp].transform(
          {
            value: '12px',
          },
          {},
          {},
        );
        const value2 = transforms[sizeSp].transform(
          {
            value: '12',
          },
          {},
          {},
        );
        expect(value).to.equal('12.00sp');
        expect(value2).to.equal('12.00sp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeSp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeDp, () => {
      it('should work', () => {
        const value = transforms[sizeDp].transform(
          {
            value: '12px',
          },
          {},
          {},
        );
        const value2 = transforms[sizeDp].transform(
          {
            value: '12',
          },
          {},
          {},
        );
        expect(value).to.equal('12.00dp');
        expect(value2).to.equal('12.00dp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeDp].transform({ value: 'a' })).to.throw();
      });
    });

    describe(sizeObject, () => {
      it('should work', () => {
        const value = transforms[sizeObject].transform(
          {
            value: '1px',
          },
          {},
          {},
        );
        expect(value.original).to.equal('1px');
        expect(value.number).to.equal(1);
        expect(value.decimal).equal(0.01);
        expect(value.scale).to.equal(16);
      });
      it('should work with custom base font', () => {
        const value = transforms[sizeObject].transform({ value: '1' }, { basePxFontSize: 14 }, {});
        expect(value.original).to.equal('1');
        expect(value.number).to.equal(1);
        expect(value.decimal).equal(0.01);
        expect(value.scale).to.equal(14);
      });
      it('should throw an error if prop value is NaN', () => {
        expect(() => transforms[sizeObject].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeRemToSp, () => {
      it('should work', () => {
        const value = transforms[sizeRemToSp].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00sp');
      });
      it('converts rem to sp using custom base font', () => {
        const value = transforms[sizeRemToSp].transform({ value: '1' }, { basePxFontSize: 14 }, {});
        expect(value).to.equal('14.00sp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeRemToSp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeRemToDp, () => {
      it('should work', () => {
        const value = transforms[sizeRemToDp].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00dp');
      });
      it('converts rem to dp using custom base font', () => {
        const value = transforms[sizeRemToDp].transform({ value: '1' }, { basePxFontSize: 14 }, {});
        expect(value).to.equal('14.00dp');
      });
      it('should throw an error if prop value is NaN', () => {
        expect(() => transforms[sizeRemToDp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizePx, () => {
      it('should work', () => {
        const value = transforms[sizePx].transform(
          {
            value: '10',
          },
          {},
          {},
        );
        expect(value).to.equal('10px');
      });
      it('should work for negative values', () => {
        const value = transforms[sizePx].transform(
          {
            value: '-10',
          },
          {},
          {},
        );
        expect(value).to.equal('-10px');
      });
      it('should throw an error if prop value is NaN', () => {
        expect(() => transforms[sizePx].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeRemToPt, () => {
      it('should work', () => {
        const value = transforms[sizeRemToPt].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00f');
      });
      it('converts rem to pt using custom base font', () => {
        const value = transforms[sizeRemToPt].transform({ value: '1' }, { basePxFontSize: 14 }, {});
        expect(value).to.equal('14.00f');
      });
      it('should throw an error if prop value is NaN', () => {
        expect(() => transforms[sizeRemToPt].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeComposeRemToSp, () => {
      it('should work', () => {
        const value = transforms[sizeComposeRemToSp].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00.sp');
      });
      it('converts rem to sp using custom base font', () => {
        const value = transforms[sizeComposeRemToSp].transform(
          { value: '1' },
          { basePxFontSize: 14 },
          {},
        );
        expect(value).to.equal('14.00.sp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeComposeRemToSp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeComposeSp, () => {
      it('should work', () => {
        const value = transforms[sizeComposeSp].transform(
          {
            value: '12px',
          },
          {},
          {},
        );
        const value2 = transforms[sizeComposeSp].transform(
          {
            value: '12',
          },
          {},
          {},
        );
        expect(value).to.equal('12.00.sp');
        expect(value2).to.equal('12.00.sp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeComposeSp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeComposeDp, () => {
      it('should work', () => {
        const value = transforms[sizeComposeDp].transform(
          {
            value: '12px',
          },
          {},
          {},
        );
        const value2 = transforms[sizeComposeDp].transform(
          {
            value: '12',
          },
          {},
          {},
        );
        expect(value).to.equal('12.00.dp');
        expect(value2).to.equal('12.00.dp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeComposeDp].transform({ value: 'a' })).to.throw();
      });
    });

    describe(sizeComposeEm, () => {
      it('should work', () => {
        const value = transforms[sizeComposeEm].transform(
          {
            value: '10',
          },
          {},
          {},
        );
        expect(value).to.equal('10.em');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeComposeEm].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeComposeRemToDp, () => {
      it('should work', () => {
        const value = transforms[sizeComposeRemToDp].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00.dp');
      });
      it('converts rem to dp using custom base font', () => {
        const value = transforms[sizeComposeRemToDp].transform(
          { value: '1' },
          { basePxFontSize: 14 },
          {},
        );
        expect(value).to.equal('14.00.dp');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeComposeRemToDp].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeSwiftRemToCGFloat, () => {
      it('should work', () => {
        const value = transforms[sizeSwiftRemToCGFloat].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('CGFloat(16.00)');
      });
      it('converts rem to CGFloat using custom base font', () => {
        const value = transforms[sizeSwiftRemToCGFloat].transform(
          { value: '1' },
          { basePxFontSize: 14 },
          {},
        );
        expect(value).to.equal('CGFloat(14.00)');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() =>
          transforms[sizeSwiftRemToCGFloat].transform({ value: 'a' }, {}, {}),
        ).to.throw();
      });
    });

    describe(sizeRemToPx, () => {
      it('should work', () => {
        const value = transforms[sizeRemToPx].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16px');
      });
      it('converts rem to px using custom base font', () => {
        const value = transforms[sizeRemToPx].transform({ value: '1' }, { basePxFontSize: 14 }, {});
        expect(value).to.equal('14px');
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => transforms[sizeRemToPx].transform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizePxToRem, () => {
      const pxToRemTransform = transforms[sizePxToRem].transform;

      ['12', '12px', '12rem'].forEach((value) => {
        it(`ignoring unit, scales "${value}" to rem`, () => {
          expect(pxToRemTransform({ value }, {}, {})).to.equal('0.75rem');
        });
      });
      it('converts pixel to rem using custom base font', () => {
        expect(pxToRemTransform({ value: '14px' }, { basePxFontSize: 14 }, {})).to.equal('1rem');
      });
      ['0', '0px', '0rem'].forEach((value) => {
        it(`zero value "${value}" is returned without a unit`, () => {
          expect(pxToRemTransform({ value }, {}, {})).to.equal('0');
        });
      });
      it('should throw an error if prop value is Nan', () => {
        expect(() => pxToRemTransform({ value: 'a' }, {}, {})).to.throw();
      });
    });

    describe(sizeRem, () => {
      it('should work', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('1rem');
      });
      it('should work for negative values with unit', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '-1rem',
          },
          {},
          {},
        );
        expect(value).to.equal('-1rem');
      });
      it('should work for negative values', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '-1',
          },
          {},
          {},
        );
        expect(value).to.equal('-1rem');
      });
      it('should work for positive values', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '+1',
          },
          {},
          {},
        );
        expect(value).to.equal('1rem');
      });
      it('should work for floating values', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '.5',
          },
          {},
          {},
        );
        expect(value).to.equal('0.5rem');
      });
      ['0', 0].forEach((value) => {
        it('zero value is returned without a unit and remains same type', () => {
          expect(
            transforms[sizeRem].transform(
              {
                value,
              },
              {},
              {},
            ),
          ).to.equal(value);
        });
      });
      it('should throw an error if prop value is NaN', () => {
        expect(() => transforms[sizeRem].transform({ value: 'a' }, {}, {})).to.throw();
      });

      it('should not change the unit to rem if the value already has a unit', () => {
        const value = transforms[sizeRem].transform(
          {
            value: '5px',
          },
          {},
          {},
        );
        expect(value).to.equal('5px');
      });
    });

    describe(sizeFlutterRemToDouble, () => {
      it('should work', () => {
        const value = transforms[sizeFlutterRemToDouble].transform(
          {
            value: '1',
          },
          {},
          {},
        );
        expect(value).to.equal('16.00');
      });
      it('converts rem to double using custom base font', () => {
        const value = transforms[sizeFlutterRemToDouble].transform(
          { value: '1' },
          { basePxFontSize: 14 },
          {},
        );
        expect(value).to.equal('14.00');
      });
    });

    describe(contentQuote, () => {
      it('should work', () => {
        const value = transforms[contentQuote].transform(
          {
            value: 'hello',
          },
          {},
          {},
        );
        expect(value).to.equal("'hello'");
      });
    });

    describe(htmlIcon, () => {
      it('should work', () => {
        const value = transforms[htmlIcon].transform(
          {
            value: '&#xE001;',
          },
          {},
          {},
        );
        expect(value).to.equal("'\\E001'");
      });
    });

    describe(contentObjCLiteral, () => {
      it('should work', () => {
        const value = transforms[contentObjCLiteral].transform(
          {
            value: 'hello',
          },
          {},
          {},
        );
        expect(value).to.equal('@"hello"');
      });
    });

    describe(assetUrl, () => {
      it('should work', () => {
        const value = transforms[assetUrl].transform(
          {
            value: 'https://example.com',
          },
          {},
          {},
        );
        expect(value).to.equal('url("https://example.com")');
      });

      it('should escape double quotes', () => {
        const value = transforms[assetUrl].transform(
          {
            value:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="90" height="45"%3E%3Cpath d="M10 10h60" stroke="%2300F" stroke-width="5"/%3E%3Cpath d="M10 20h60" stroke="%230F0" stroke-width="5"/%3E%3Cpath d="M10 30h60" stroke="red" stroke-width="5"/%3E%3C/svg%3E"',
          },
          {},
          {},
        );
        expect(value).to.equal(
          'url("data:image/svg+xml,%3Csvg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"90\\" height=\\"45\\"%3E%3Cpath d=\\"M10 10h60\\" stroke=\\"%2300F\\" stroke-width=\\"5\\"/%3E%3Cpath d=\\"M10 20h60\\" stroke=\\"%230F0\\" stroke-width=\\"5\\"/%3E%3Cpath d=\\"M10 30h60\\" stroke=\\"red\\" stroke-width=\\"5\\"/%3E%3C/svg%3E\\"")',
        );
      });
    });

    describe(assetObjCLiteral, () => {
      it('should work', () => {
        const value = transforms[assetObjCLiteral].transform(
          {
            value: 'hello',
          },
          {},
          {},
        );
        expect(value).to.equal('@"hello"');
      });
    });

    describe(timeSeconds, () => {
      it('should work', () => {
        const value = transforms[timeSeconds].transform(
          {
            value: '1000',
          },
          {},
          {},
        );
        expect(value).to.equal('1.00s');
      });
    });

    describe(fontFamilyCss, () => {
      const fontFamilyTransform = (token) => transforms[fontFamilyCss].transform(token, {}, {});

      it('should handle simple fontFamily as is', () => {
        expect(fontFamilyTransform({ value: 'Arial', type: 'fontFamily' })).to.equal('Arial');
      });

      it('should comma separated type fontFamily values', () => {
        expect(fontFamilyTransform({ value: 'Arial, sans-serif', type: 'fontFamily' })).to.equal(
          'Arial, sans-serif',
        );
      });

      it('should handle array type fontFamily values', () => {
        expect(
          fontFamilyTransform({ value: ['Arial', 'sans-serif'], type: 'fontFamily' }),
        ).to.equal('Arial, sans-serif');
      });

      it('should handle double quoted fontFamily values', () => {
        expect(
          fontFamilyTransform({
            value: 'Some Font, "With Double Quotes", \'And Single Quotes\'',
            type: 'fontFamily',
          }),
        ).to.equal("'Some Font', \"With Double Quotes\", 'And Single Quotes'");
      });

      it('should wrap fontFamily values with spaces in quotes', () => {
        expect(fontFamilyTransform({ value: 'Gill Sans', type: 'fontFamily' })).to.equal(
          "'Gill Sans'",
        );
        expect(
          fontFamilyTransform({
            value: 'Gill Sans, Arial, Comic Sans, Open Sans, sans-serif',
            type: 'fontFamily',
          }),
        ).to.equal("'Gill Sans', Arial, 'Comic Sans', 'Open Sans', sans-serif");
        expect(
          fontFamilyTransform({
            value: ['Gill Sans', 'Arial', 'Comic Sans', 'Open Sans', 'sans-serif'],
            type: 'fontFamily',
          }),
        ).to.equal("'Gill Sans', Arial, 'Comic Sans', 'Open Sans', sans-serif");
      });

      it('should handle fontFamily prop within typography tokens', () => {
        expect(
          fontFamilyTransform({
            value: {
              fontFamily: ['Gill Sans', 'sans-serif'],
              fontWeight: 300,
              fontSize: '20px',
              lineHeight: '1.5',
            },
            type: 'typography',
          }),
        ).to.eql({
          fontFamily: "'Gill Sans', sans-serif",
          fontWeight: 300,
          fontSize: '20px',
          lineHeight: '1.5',
        });

        expect(
          fontFamilyTransform({
            value: {
              fontWeight: 300,
              fontSize: '20px',
              lineHeight: '1.5',
            },
            type: 'typography',
          }),
        ).to.eql({
          fontWeight: 300,
          fontSize: '20px',
          lineHeight: '1.5',
        });
      });
    });

    describe(cubicBezierCss, () => {
      const cubicBezierTransform = (token) => transforms[cubicBezierCss].transform(token, {}, {});

      it('should stringify cubicBezier values to cubicBezier() CSS function', () => {
        expect(cubicBezierTransform({ value: [0.5, 0, 1, 1], type: 'cubicBezier' })).to.equal(
          'cubic-bezier(0.5, 0, 1, 1)',
        );
        expect(cubicBezierTransform({ value: 'ease-in-out', type: 'cubicBezier' })).to.equal(
          'ease-in-out',
        );
      });

      it('should stringify transition token cubicBezier properties to cubicBezier() CSS function', () => {
        expect(
          cubicBezierTransform({
            value: {
              duration: '200ms',
              delay: '0ms',
              timingFunction: [0.5, 0, 1, 1],
            },
            type: 'transition',
          }),
        ).to.eql({
          duration: '200ms',
          delay: '0ms',
          timingFunction: 'cubic-bezier(0.5, 0, 1, 1)',
        });
        expect(
          cubicBezierTransform({
            value: {
              duration: '200ms',
              delay: '0ms',
              timingFunction: 'ease-in-out',
            },
            type: 'transition',
          }),
        ).to.eql({
          duration: '200ms',
          delay: '0ms',
          timingFunction: 'ease-in-out',
        });

        expect(
          cubicBezierTransform({
            value: {
              duration: '200ms',
              delay: '0ms',
            },
            type: 'transition',
          }),
        ).to.eql({
          duration: '200ms',
          delay: '0ms',
        });
      });
    });

    describe(typographyCssShorthand, () => {
      const typographyTransform = (value, platformConfig = {}) =>
        transforms[typographyCssShorthand].transform({ value }, platformConfig, {});

      it('transforms typography object to typography shorthand', () => {
        expect(
          typographyTransform({
            fontWeight: '500',
            fontSize: '20px',
            fontVariant: 'small-caps',
            fontWidth: 'condensed',
            fontStyle: 'italic',
            lineHeight: '1.5',
            fontFamily: 'Arial',
          }),
        ).to.equal('italic small-caps 500 condensed 20px/1.5 Arial');
      });

      it('transforms fontWeight prop according to fontweight map for CSS and px dimensions', () => {
        expect(
          typographyTransform({
            fontWeight: 300,
            fontSize: '20px',
            lineHeight: '1.5',
            fontFamily: 'Arial',
          }),
        ).to.equal('300 20px/1.5 Arial');
      });

      it('provides defaults for missing properties', () => {
        expect(typographyTransform({})).to.equal('16px sans-serif');
        expect(typographyTransform({}, { basePxFontSize: 12 })).to.equal('12px sans-serif');
      });
    });

    // https://design-tokens.github.io/community-group/format/#border
    describe(borderCssShorthand, () => {
      const borderTransform = (value) =>
        transforms[borderCssShorthand].transform({ value, type: 'border' }, {}, {});

      it('transforms border object to border shorthand', () => {
        expect(
          borderTransform({
            width: '5px',
            style: 'dashed',
            color: '#000000',
          }),
        ).to.equal('5px dashed #000000');
      });

      // https://design-tokens.github.io/community-group/format/#example-fallback-for-object-stroke-style
      it('handles stroke style of type object using dashed fallback', () => {
        expect(
          borderTransform({
            width: '5px',
            style: {
              dashArray: ['0.5rem', '0.25rem'],
              lineCap: 'round',
            },
            color: '#000000',
          }),
        ).to.equal('5px dashed #000000');
      });

      it('handles color prop when using DTCGColorValue', () => {
        expect(
          borderTransform({
            width: '5px',
            style: {
              dashArray: ['0.5rem', '0.25rem'],
              lineCap: 'round',
            },
            color: {
              colorSpace: 'lab',
              components: [60.17, 93.54, -60.5],
            },
          }),
        ).to.match(/^5px dashed lab\(\d+.\d+ \d+.\d+ -\d+.\d+\)$/);

        // with alpha
        expect(
          borderTransform({
            width: '5px',
            style: {
              dashArray: ['0.5rem', '0.25rem'],
              lineCap: 'round',
            },
            color: {
              colorSpace: 'lab',
              components: [60.17, 93.54, -60.5],
              alpha: 0.5,
            },
          }),
        ).to.equal('5px dashed lab(60.17 93.54 -60.5 / 0.5)');
      });

      it.skip('supports specifying to what format the color prop should be stringified', () => {
        expect(
          transforms[borderCssShorthand].transform(
            {
              value: {
                width: '5px',
                style: {
                  dashArray: ['0.5rem', '0.25rem'],
                  lineCap: 'round',
                },
                color: {
                  colorSpace: 'lab',
                  components: [60.17, 93.54, -60.5],
                  alpha: 0.5,
                },
              },
              type: 'border',
            },
            { cssShorthandsColorSpace: 'srgb', cssShorthandsColorFormat: 'rgba' },
            {},
          ),
        ).to.match(/^5px dashed rgba\(\d+(\.\d+)?%, \d+(\.\d+)?%, \d+(\.\d+)?%, \d+(\.\d+)?\)$/);
      });

      it('allows every property to be optional', () => {
        expect(borderTransform({})).to.equal('none');
      });
    });

    describe(strokeStyleCssShorthand, () => {
      const strokeTransform = (value, platformConfig = {}) =>
        transforms[strokeStyleCssShorthand].transform({ value }, platformConfig, {});

      it('transforms strokeStyle object value to strokeStyle CSS fallback string value', () => {
        expect(
          strokeTransform({
            dashArray: ['0.5rem', '0.25rem'],
            lineCap: 'round',
          }),
        ).to.equal('dashed');

        expect(strokeTransform('dotted')).to.equal('dotted');
      });
    });

    describe(transitionCssShorthand, () => {
      const transitionTransform = (value, platformConfig = {}) =>
        transforms[transitionCssShorthand].transform({ value }, platformConfig, {});

      it('transforms transition object value to transition CSS shorthand string value', () => {
        expect(
          transitionTransform({
            duration: '200ms',
            delay: '0ms',
            timingFunction: 'cubic-bezier(0.5, 0, 1, 1)',
          }),
        ).to.equal('200ms cubic-bezier(0.5, 0, 1, 1) 0ms');

        expect(
          transitionTransform({
            duration: '200ms',
            delay: '0ms',
            timingFunction: 'ease-in-out',
          }),
        ).to.equal('200ms ease-in-out 0ms');

        expect(transitionTransform('200ms linear 50ms')).to.equal('200ms linear 50ms');
      });
    });

    describe(shadowCssShorthand, () => {
      const shadowTransform = (value, platformConfig = {}) =>
        transforms[transformNames.shadowCssShorthand].transform({ value }, platformConfig, {});

      it('transforms shadow object value to shadow CSS shorthand string value', () => {
        expect(
          shadowTransform({
            type: 'inset',
            color: '#00000080',
            offsetX: '4px',
            offsetY: '4px',
            blur: '12px',
            spread: '6px',
          }),
        ).to.equal('inset 4px 4px 12px 6px #00000080');

        expect(shadowTransform('4px 4px 12px 6px #00000080')).to.equal(
          '4px 4px 12px 6px #00000080',
        );
      });

      it('transforms shadow object value with missing properties using defaults', () => {
        expect(shadowTransform({})).to.equal('0 0 0 #000000');
      });

      it('handles arrays of shadows', () => {
        expect(
          shadowTransform([
            {
              type: 'inset',
              color: '#000000',
              offsetX: '4px',
              offsetY: '4px',
              blur: '12px',
              spread: '6px',
            },
            {
              color: 'rgba(0,0,0, 0.4)',
              offsetX: '2px',
              offsetY: '2px',
              blur: '4px',
            },
          ]),
        ).to.equal('inset 4px 4px 12px 6px #000000, 2px 2px 4px rgba(0,0,0, 0.4)');
      });

      it('handles DTCG color values in shadows', () => {
        expect(
          shadowTransform([
            {
              type: 'inset',
              color: {
                colorSpace: 'lab',
                components: [60.17, 90, -60.5],
              },
              offsetX: '4px',
              offsetY: '4px',
              blur: '12px',
              spread: '6px',
            },
            {
              color: {
                colorSpace: 'lab',
                components: [60.17, 90, -60.5],
                alpha: 0.5,
              },
              offsetX: '2px',
              offsetY: '2px',
              blur: '4px',
            },
          ]),
        ).to.equal(
          'inset 4px 4px 12px 6px lab(60.17 90 -60.5), 2px 2px 4px lab(60.17 90 -60.5 / 0.5)',
        );
      });

      it('supports DTCG inset boolean property', () => {
        expect(
          shadowTransform({
            inset: true,
            color: '#00000080',
            offsetX: '4px',
            offsetY: '4px',
            blur: '12px',
            spread: '6px',
          }),
        ).to.equal('inset 4px 4px 12px 6px #00000080');
      });

      // Probably we want to run transforms transitively on deep token props instead of specifying this via
      // platform config options
      it.skip('supports specifying to what format the color prop should be stringified', () => {
        expect(
          transforms[transformNames.shadowCssShorthand].transform(
            {
              value: [
                {
                  type: 'inset',
                  color: {
                    colorSpace: 'lab',
                    components: [60.17, 90, -60.5],
                  },
                  offsetX: '4px',
                  offsetY: '4px',
                  blur: '12px',
                  spread: '6px',
                },
                {
                  color: {
                    colorSpace: 'lab',
                    components: [60.17, 90, -60.5],
                    alpha: 0.5,
                  },
                  offsetX: '2px',
                  offsetY: '2px',
                  blur: '4px',
                },
              ],
            },
            { cssShorthandsColorSpace: 'srgb', cssShorthandsColorFormat: 'rgba' },
            {},
          ),
        ).to.match(
          /^inset 4px 4px 12px 6px rgba\(\d+(\.\d+)?%, \d+(\.\d+)?%, \d+(\.\d+)?%(, \d+(\.\d+)?)?\), 2px 2px 4px rgba\(\d+(\.\d+)?%, \d+(\.\d+)?%, \d+(\.\d+)?%(, \d+(\.\d+)?)?\)$/,
        );
      });
    });

    /**
     * The spec for gradient type tokens is not very well thought out at this moment
     * https://design-tokens.github.io/community-group/format/#gradient
     * This will inevitably change in a breaking manner, so any transform written as of the time of writing (13-05-24)
     * will require a breaking change when it does.
     * Therefore, a community-built custom transform is the better fit for now.
     */
    describe.skip('gradient/css/shorthand', () => {
      const gradientTransform = (value, platformConfig = {}) =>
        transforms['gradient/css/shorthand'].transform({ value }, platformConfig, {});

      it('transforms gradient object value to gradient CSS shorthand string value', () => {
        expect(
          gradientTransform([
            {
              color: '#0000ff',
              position: 0,
            },
            {
              color: '#ff0000',
              position: 1,
            },
          ]),
        ).to.equal('inset 4px 4px 12px 6px #000000, 2px 2px 4px rgba(0,0,0, 0.4)');

        expect(gradientTransform('4px 4px 12px 6px #00000080')).to.equal(
          '4px 4px 12px 6px #00000080',
        );
      });
    });

    // FIXME: find a browser/node cross compatible way to transform local path
    // current implementation incorrectly uses process.cwd() rather than using
    // the filePath of the token to determine where the asset is located relative to the token that refers to it
    describe.skip(assetPath, () => {
      it('should work', () => {
        const value = transforms[transformNames.assetPath].transform(
          {
            value: 'foo.json',
          },
          {},
          {},
        );
        expect(value).to.equal('foo.json');
      });
    });
  });

  describe('transform filters', () => {
    describe('isColor', () => {
      it('should match short hex colors', () => {
        expect(isColor({ type: 'color', value: '369' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: '#369' }, {})).to.be.true;
      });

      it('should match standard hex colors', () => {
        expect(isColor({ type: 'color', value: 'e66465' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: '#e66465' }, {})).to.be.true;
      });

      it('should match 8-digit hex colors', () => {
        expect(isColor({ type: 'color', value: 'e66465FF' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: '#e66465FF' }, {})).to.be.true;
      });

      it('should match legacy rgb/rgba colors', () => {
        expect(isColor({ type: 'color', value: 'rgb(132, 99, 255)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'rgb(132, 99, 255, 0.5)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'rgba(132, 99, 255, 0.5)' }, {})).to.be.true;
      });

      it('should match rgb colors', () => {
        expect(isColor({ type: 'color', value: 'rgb(132 99 255)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'rgb(132 99 255 / .5)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'rgb(132 99 255 / 50%)' }, {})).to.be.true;
      });

      it('should match legacy hsl/hsla colors', () => {
        expect(isColor({ type: 'color', value: 'hsl(30, 100%, 50%, 0.6)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'hsla(30, 100%, 50%, 0.6)' }, {})).to.be.true;
      });

      it('should match hsl colors', () => {
        expect(isColor({ type: 'color', value: 'hsl(30 100% 50% / .6)' }, {})).to.be.true;
        expect(isColor({ type: 'color', value: 'hsl(30.2 100% 50% / 60%)' }, {})).to.be.true;
      });

      it('should match named colors', () => {
        expect(isColor({ type: 'color', value: 'red' }, {})).to.be.true;
      });

      it('should ignore gradients', () => {
        expect(isColor({ type: 'color', value: 'linear-gradient(#e66465, #9198e5)' }, {})).to.be
          .false;
        expect(isColor({ type: 'color', value: 'linear-gradient(red, yellow)' }, {})).to.be.false;
        expect(
          isColor(
            { type: 'color', value: 'linear-gradient(rgba(0, 0, 0, 0.00), rgba(0, 0, 0, 0.60))' },
            {},
          ),
        ).to.be.false;
        expect(isColor({ type: 'color', value: 'repeating-linear-gradient(#e66465, #9198e5)' }, {}))
          .to.be.false;
        expect(isColor({ type: 'color', value: 'radial-gradient(#e66465, #9198e5)' }, {})).to.be
          .false;
        expect(isColor({ type: 'color', value: 'repeating-radial-gradient(#e66465, #9198e5)' }, {}))
          .to.be.false;
      });

      it('should ignore values that cannot convert to a color', () => {
        expect(isColor({ type: 'color', value: 'currentColor' }, {})).to.be.false;
      });

      it('should match DTCG object format colors', () => {
        expect(
          isColor(
            {
              $type: 'color',
              $value: { colorSpace: 'srgb', components: [1, 0.42, 0.21], alpha: 1 },
            },
            { usesDtcg: true },
          ),
        ).to.be.true;
        expect(
          isColor(
            {
              $type: 'color',
              $value: { colorSpace: 'oklch', components: [0.7, 0.15, 180], alpha: 0.5 },
            },
            { usesDtcg: true },
          ),
        ).to.be.true;
        expect(
          isColor(
            {
              $type: 'color',
              $value: { colorSpace: 'display-p3', components: [0.5, 0.5, 0.5] },
            },
            { usesDtcg: true },
          ),
        ).to.be.true;
      });

      it('should reject DTCG objects with invalid colorSpace', () => {
        expect(
          isColor(
            {
              $type: 'color',
              $value: { colorSpace: 'invalid', components: [1, 0, 0] },
            },
            { usesDtcg: true },
          ),
        ).to.be.false;
      });
    });

    describe('isDTCGColorObject', () => {
      it('should return true for valid DTCG color objects', () => {
        expect(isDTCGColorObject({ colorSpace: 'srgb', components: [1, 0, 0] })).to.be.true;
        expect(isDTCGColorObject({ colorSpace: 'oklch', components: [0.7, 0.15, 180], alpha: 0.5 }))
          .to.be.true;
        expect(isDTCGColorObject({ colorSpace: 'display-p3', components: [0.5, 0.5, 0.5] })).to.be
          .true;
      });

      it('should return false for non-DTCG values', () => {
        expect(isDTCGColorObject('#ff0000')).to.be.false;
        expect(isDTCGColorObject('rgb(255, 0, 0)')).to.be.false;
        expect(isDTCGColorObject(null)).to.be.false;
        expect(isDTCGColorObject(undefined)).to.be.false;
        expect(isDTCGColorObject({ colorSpace: 'invalid', components: [1, 0, 0] })).to.be.false;
        expect(isDTCGColorObject({ colorSpace: 'srgb' })).to.be.false; // missing components
      });
    });
  });
});
