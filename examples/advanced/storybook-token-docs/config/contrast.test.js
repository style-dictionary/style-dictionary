import { expect } from 'chai';
import { contrastLevel, contrastRatio, formatRatio } from './contrast.js';

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).to.equal(21);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#fff', '#767676')).to.equal(contrastRatio('#767676', '#fff'));
  });

  it('matches the known ratio for #767676 on white', () => {
    expect(formatRatio(contrastRatio('#767676', '#ffffff'))).to.equal('4.54:1');
  });
});

describe('contrastLevel', () => {
  it('maps ratios to WCAG levels', () => {
    expect(contrastLevel(7)).to.equal('AAA');
    expect(contrastLevel(4.5)).to.equal('AA');
    expect(contrastLevel(3)).to.equal('AA large text');
    expect(contrastLevel(2.99)).to.equal('Fail');
  });
});

describe('formatRatio', () => {
  it('rounds down so a failing ratio never reads as passing', () => {
    expect(formatRatio(4.499)).to.equal('4.49:1');
  });
});
