import { expect } from 'chai';
import { typeDtcgDelegate } from '../../lib/utils/typeDtcgDelegate.js';

describe('utils', () => {
  describe('typeDtcgDelegate', () => {
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
