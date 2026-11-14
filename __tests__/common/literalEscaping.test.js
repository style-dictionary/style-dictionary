import { expect } from 'chai';
import transforms from '../../lib/common/transforms.js';

describe('double-quoted literal transforms', () => {
  for (const platform of ['swift', 'objC', 'flutter']) {
    for (const type of ['content', 'asset']) {
      const name = `${type}/${platform}/literal`;
      describe(name, () => {
        for (const usesDtcg of [false, true]) {
          describe(usesDtcg ? 'DTCG tokens' : 'legacy tokens', () => {
            const cases = [
              ['ordinary strings', 'hello', 'hello'],
              ['empty strings', '', ''],
              ['embedded quotes', 'He said "hi"', 'He said \\"hi\\"'],
              ['backslashes', 'C:\\temp', 'C:\\\\temp'],
              ['trailing backslashes', 'path\\', 'path\\\\'],
              ['backslashes followed by quotes', '\\"', '\\\\\\"'],
              ['Unicode', 'বাংলা', 'বাংলা'],
            ];

            for (const [description, value, escaped] of cases) {
              it(`should preserve ${description}`, () => {
                const token = usesDtcg ? { $type: type, $value: value } : { type, value };
                const result = transforms[name].transform(token, {}, { usesDtcg });
                const prefix = platform === 'objC' ? '@' : '';
                expect(result).to.equal(`${prefix}"${escaped}"`);
              });
            }
          });
        }
      });
    }
  }
});
