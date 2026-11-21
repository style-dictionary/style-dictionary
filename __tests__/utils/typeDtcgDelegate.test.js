import { expect } from 'chai';
import { typeDtcgDelegate } from '../../lib/utils/typeDtcgDelegate.js';

describe('utils', () => {
  describe('typeDtcgDelegate', () => {
    it('should resolve alias types before inheriting a group type', () => {
      const tokens = {
        alias: { $value: '{mixed.color}' },
        mixed: {
          $type: 'dimension',
          color: { $value: '{ palette.accent.$root }' },
          explicit: { $type: 'dimension', $value: '{palette.accent.$root}' },
          interpolation: { $value: 'prefix {palette.accent.$root}' },
        },
        palette: {
          $type: 'color',
          accent: { $root: { $value: '#ff0000' } },
        },
      };

      const delegated = typeDtcgDelegate(tokens);
      expect(delegated.alias).to.eql({ $value: '{mixed.color}', $type: 'color' });
      expect(delegated.mixed.color).to.eql({
        $value: '{ palette.accent.$root }',
        $type: 'color',
      });
      expect(delegated.mixed.explicit.$type).to.equal('dimension');
      expect(delegated.mixed.interpolation.$type).to.equal('dimension');
      expect(tokens.mixed.color).not.to.have.property('$type');
    });

    it('should fall back to the alias group type when a reference is missing', () => {
      const delegated = typeDtcgDelegate({
        untyped: { $value: '{base.unit}' },
        spacing: {
          $type: 'dimension',
          missing: { $value: '{base.unit}' },
          chain: { $value: '{numbers.missing}' },
        },
        numbers: {
          $type: 'number',
          missing: { $value: '{base.unit}' },
        },
      });

      expect(delegated.untyped).not.to.have.property('$type');
      expect(delegated.spacing.missing.$type).to.equal('dimension');
      expect(delegated.spacing.chain.$type).to.equal('dimension');
      expect(delegated.numbers.missing.$type).to.equal('number');
    });

    it('should fall back to each alias group type in a circular reference', () => {
      const delegated = typeDtcgDelegate({
        spacing: { $type: 'dimension', first: { $value: '{numbers.second}' } },
        numbers: { $type: 'number', second: { $value: '{spacing.first}' } },
      });

      expect(delegated.spacing.first.$type).to.equal('dimension');
      expect(delegated.numbers.second.$type).to.equal('number');
    });

    it('should correctly let tokens inherit the $type property while respecting local overrides', () => {
      const tokens = {
        dimension: {
          $type: 'dimension',
          scale: {
            $value: '2',
            $type: 'math',
          },
          xs: {
            $value: '4',
          },
          nested: {
            deep: {
              deeper: {
                $value: '12',
              },
            },
            deep2: {
              $type: 'math',
              deeper: {
                $type: 'other',
                evenDeeper: {
                  $value: '12',
                  $type: 'math',
                },
                evenDeeper2: {
                  $value: '12',
                },
              },
            },
          },
          sm: {
            $value: '8',
          },
        },
      };

      expect(typeDtcgDelegate(tokens)).to.eql({
        dimension: {
          scale: {
            $value: '2',
            $type: 'math',
          },
          xs: {
            $value: '4',
            $type: 'dimension',
          },
          nested: {
            deep: {
              deeper: {
                $value: '12',
                $type: 'dimension',
              },
            },
            deep2: {
              deeper: {
                evenDeeper: {
                  $value: '12',
                  $type: 'math',
                },
                evenDeeper2: {
                  $value: '12',
                  $type: 'other',
                },
              },
            },
          },
          sm: {
            $value: '8',
            $type: 'dimension',
          },
        },
      });
    });

    it('should work regardless at which position the $type property sits', () => {
      const tokens = {
        dimension: {
          scale: {
            $value: '2',
            $type: 'math',
          },
          xs: {
            $value: '4',
          },
          nested: {
            deep: {
              deeper: {
                $value: '12',
              },
            },
            deep2: {
              $type: 'math',
              deeper: {
                $type: 'other',
                evenDeeper: {
                  $value: '12',
                  $type: 'math',
                },
                evenDeeper2: {
                  $value: '12',
                },
              },
            },
          },
          sm: {
            $value: '8',
          },
          $type: 'dimension',
        },
      };

      expect(typeDtcgDelegate(tokens)).to.eql({
        dimension: {
          scale: {
            $value: '2',
            $type: 'math',
          },
          xs: {
            $value: '4',
            $type: 'dimension',
          },
          nested: {
            deep: {
              deeper: {
                $value: '12',
                $type: 'dimension',
              },
            },
            deep2: {
              deeper: {
                evenDeeper: {
                  $value: '12',
                  $type: 'math',
                },
                evenDeeper2: {
                  $value: '12',
                  $type: 'other',
                },
              },
            },
          },
          sm: {
            $value: '8',
            $type: 'dimension',
          },
        },
      });
    });
  });
});
