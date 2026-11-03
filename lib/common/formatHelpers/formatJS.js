/**
 * Prettier format JS contents
 * @param {string} content
 * @param {boolean} [ts] whether or not to use typescript
 */
export async function formatJS(content, ts = false) {
  const prettier = await import('prettier/standalone');
  const prettierPluginBabel = await import('prettier/plugins/babel');
  const prettierPluginEstree = await import('prettier/plugins/estree');
  const prettierPluginTypescript = await import('prettier/plugins/typescript');

  return prettier.format(content, {
    parser: ts ? `typescript` : `babel`,
    plugins: [
      prettierPluginBabel,
      /** @type {import('prettier').Plugin} */ (prettierPluginEstree),
      prettierPluginTypescript,
    ],
  });
}
