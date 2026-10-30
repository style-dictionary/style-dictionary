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

      it('should only move the referencing token, keeping independent tokens in their relative order', () => {
        const tokenB = createToken('token-b', '#111', '#111');
        const tokenA = createToken('token-a', '#111', '{token-b.value}');
        const tokenC = createToken('token-c', '#222', '#222');
        const tokenD = createToken('token-d', '#333', '#333');

        // user order: c, d, a, b — only "a" needs to move (after "b")
        const sortedTokens = [tokenC, tokenD, tokenA, tokenB];
        const tokens = {
          'token-a': tokenA,
          'token-b': tokenB,
          'token-c': tokenC,
          'token-d': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        expect(result).to.eql([tokenC, tokenD, tokenB, tokenA]);
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

      it('should keep all tokens that share an output name', () => {
        const base = createToken('base', '#111', '#111');
        // two tokens collide on the output name "dup" (different paths)
        const dupA = { ...createToken('dup', '#111', '{base.value}'), path: ['a', 'dup'] };
        const dupB = { ...createToken('dup', '#222', '#222'), path: ['b', 'dup'] };

        const sortedTokens = [dupA, dupB, base];
        const tokens = { base, dup: dupA };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        // neither colliding token is dropped, and the group still follows its dependency
        expect(result).to.eql([base, dupA, dupB]);
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

      it('should keep a referencing token in place when its dependency already precedes it', () => {
        const base = createToken('base', '#111', '#111');
        const ref = createToken('ref', '#111', '{base.value}');
        const other = createToken('other', '#222', '#222');

        const sortedTokens = [base, ref, other];
        const tokens = { base, ref, other };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        // define-before-use is already satisfied, so nothing moves
        // (a depth-based sorter would move "ref" after "other")
        expect(result).to.eql([base, ref, other]);
      });

      it('should only move referencing tokens after their dependencies, keeping everything else in order', () => {
        // name-sorted input: a -> d, b -> c
        const tokenA = createToken('a-token', '#333', '{d-token.value}');
        const tokenB = createToken('b-token', '#222', '{c-token.value}');
        const tokenC = createToken('c-token', '#222', '#222');
        const tokenD = createToken('d-token', '#333', '#333');

        const sortedTokens = [tokenA, tokenB, tokenC, tokenD];
        const tokens = {
          'a-token': tokenA,
          'b-token': tokenB,
          'c-token': tokenC,
          'd-token': tokenD,
        };

        const result = applyReferenceSafeOrdering(sortedTokens, tokens);

        // each referencing token is output once its dependency has been,
        // instead of all referencing tokens being pushed to the end
        expect(result).to.eql([tokenC, tokenB, tokenD, tokenA]);
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
