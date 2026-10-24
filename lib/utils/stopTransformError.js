/**
 * Throw this error from a transform to stop transforming the token.
 * The remaining transforms of the platform are skipped for that token,
 * and the token keeps the changes made by the transforms that ran before.
 * Like any other error thrown by a transform, it is reported as a transform error.
 */
export class StopTransformError extends Error {
  /**
   * @param {string} [message]
   * @param {ErrorOptions} [options]
   */
  constructor(message, options) {
    super(message, options);
    this.name = 'StopTransformError';
  }
}
