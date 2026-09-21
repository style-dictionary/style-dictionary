import { expect } from 'chai';
import applyReferenceSafeOrdering from '../../../lib/common/formatHelpers/applyReferenceSafeOrdering.js';

const createToken = (name, value, originalValue, usesDtcg = false) => {
  const valueKey = usesDtcg ? '$value' : 'value';
  return {
    name,
    [valueKey]: value,
    original: { [valueKey]: originalValue },
    path: name.split('-'),
  };
};

describe('common', () => {
  describe('formatHelpers', () => {
    describe('applyReferenceSafeOrdering', () => {
      it('should preserve order when no references exist', () => {
        const tokenA = createToken('token-a', '#000', '#000');
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenD = createToken('token-d', '#333', '#333');

        const sortedTokens = [tokenC, tokenD, tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
          'token-d': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result).to.eql(sortedTokens);
      });

      it('should reorder to satisfy direct reference dependencies', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenA = createToken('token-a', '#111', '{token-b.value}');

        const sortedTokens = [tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result).to.eql([tokenB, tokenA]);
        expect(result.indexOf(tokenB)).to.be.lessThan(result.indexOf(tokenA));
      });

      it('should handle transitive dependencies (A -> B -> C)', () => {
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenB = createToken('token-b', '#222', '{token-c.value}');
        const tokenA = createToken('token-a', '#222', '{token-b.value}');

        const sortedTokens = [tokenA, tokenB, tokenC];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result).to.eql([tokenC, tokenB, tokenA]);
        expect(result.indexOf(tokenC)).to.be.lessThan(result.indexOf(tokenB));
        expect(result.indexOf(tokenB)).to.be.lessThan(result.indexOf(tokenA));
      });

      it('should preserve order when user-sorted order is (c,d,a,b) but references require minimal movement', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenA = createToken('token-a', '#111', '{token-b.value}');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenD = createToken('token-d', '#333', '#333');

        const sortedTokens = [tokenC, tokenD, tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
          'token-d': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result.indexOf(tokenB)).to.be.lessThan(result.indexOf(tokenA));
        expect(result.indexOf(tokenC)).to.be.lessThan(result.indexOf(tokenD));

        const cIdx = result.indexOf(tokenC);
        const dIdx = result.indexOf(tokenD);
        expect(cIdx).to.be.lessThan(dIdx);
      });

      it('should preserve relative order of independent tokens', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenA = createToken('token-a', '#111', '{token-b.value}');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenD = createToken('token-d', '#333', '#333');

        const sortedTokens = [tokenC, tokenD, tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
          'token-d': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result.indexOf(tokenC)).to.be.lessThan(result.indexOf(tokenD));
        expect(result.indexOf(tokenB)).to.be.lessThan(result.indexOf(tokenA));
      });

      it('should ignore references to tokens not in sortedTokens', () => {
        const tokenA = createToken('token-a', '#111', '{external-token.value}');
        const tokenB = createToken('token-b', '#222', '#222');

        const sortedTokens = [tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'external-token': createToken('external-token', '#000', '#000'),
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens, {
          unfilteredTokens: tokens,
        });

        expect(result).to.eql([tokenA, tokenB]);
      });

      it('should handle cycles deterministically by keeping original order', () => {
        const tokenA = createToken('token-a', '#111', '{token-b.value}');
        const tokenB = createToken('token-b', '#111', '{token-a.value}');

        const sortedTokens = [tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result.length).to.equal(2);
        expect(result).to.include(tokenA);
        expect(result).to.include(tokenB);
        expect(result).to.eql([tokenA, tokenB]);
      });

      it('should handle empty array', () => {
        const result = applyReferenceSafeOrdering([], {});
        expect(result).to.eql([]);
      });

      it('should handle tokens with multiple references', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenA = createToken('token-a', '#111 #222', '{token-b.value} {token-c.value}');

        const sortedTokens = [tokenA, tokenB, tokenC];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result.indexOf(tokenB)).to.be.lessThan(result.indexOf(tokenA));
        expect(result.indexOf(tokenC)).to.be.lessThan(result.indexOf(tokenA));
      });

      [
        ['default', false],
        ['dtcg', true],
      ].forEach(([tokenFormat, usesDtcg]) => {
        it(`should work with ${tokenFormat} format (usesDtcg=${usesDtcg})`, () => {
          const refKey = usesDtcg ? '$value' : 'value';
          const tokenB = createToken('token-b', '#111', '#111', usesDtcg);
          const tokenA = createToken('token-a', '#111', `{token-b.${refKey}}`, usesDtcg);

          const sortedTokens = [tokenA, tokenB];
          const tokens = {
            'token-a': tokenA,
            'token-b': tokenB,
          };

          const result = applyReferenceSafeOrdering(sortedTokens, tokens, { usesDtcg });

          expect(result).to.eql([tokenB, tokenA]);
        });
      });

      it('should preserve stability: when multiple tokens are available, choose earliest in original order', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenA = createToken('token-a', '#111', '{token-b.value}');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenD = createToken('token-d', '#333', '#333');

        const sortedTokens = [tokenC, tokenD, tokenB, tokenA];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
          'token-d': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result[0]).to.equal(tokenC);
        expect(result[1]).to.equal(tokenD);
        expect(result[2]).to.equal(tokenB);
        expect(result[3]).to.equal(tokenA);
      });

      it('should handle complex scenario: 2 base tokens and 2 referencing tokens', () => {
        const base1 = createToken('base-1', '#111', '#111');
        const base2 = createToken('base-2', '#222', '#222');
        const ref1 = createToken('ref-1', '#111', '{base-1.value}');
        const ref2 = createToken('ref-2', '#222', '{base-2.value}');

        const sortedTokens = [ref1, ref2, base1, base2];
        const tokens = {
          'base-1': base1,
          'base-2': base2,
          'ref-1': ref1,
          'ref-2': ref2,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result.indexOf(base1)).to.be.lessThan(result.indexOf(ref1));
        expect(result.indexOf(base2)).to.be.lessThan(result.indexOf(ref2));
        expect(result.indexOf(base1)).to.be.lessThan(result.indexOf(base2));
        expect(result.indexOf(ref1)).to.be.lessThan(result.indexOf(ref2));
      });
    });
  });
});
