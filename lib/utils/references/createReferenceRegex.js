export const regexDefault = createReferenceRegex();
export const regexCaptureGroups = createReferenceRegex(true);

/**
 * @param {boolean} [captureGroups]
 * @returns {RegExp}
 */
function createReferenceRegex(captureGroups = false) {
  return new RegExp(
    `${captureGroups ? '(' : ''}\\{${captureGroups ? '' : '('}[^}]+${captureGroups ? '' : ')'}\\}${captureGroups ? ')' : ''}`,
    'g',
  );
}
