import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';

const defaultRoot = fileURLToPath(new URL('../..', import.meta.url));
const marker = '~ sd-enums';
const exportPattern = /export\s+\{[^}]+\}\s+from\s+'\.\/([^']+\.js)';/g;

function titleFromPath(filePath) {
  return basename(filePath, '.js')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());
}

async function enumNodes(root) {
  const enumDirectory = join(root, 'lib', 'enums');
  const indexSource = await readFile(join(enumDirectory, 'index.js'), 'utf8');
  const sourcePaths = [...indexSource.matchAll(exportPattern)].map((match) => match[1]);
  const uniquePaths = [...new Set(sourcePaths)];

  if (uniquePaths.length === 0) {
    throw new Error('No enum modules were exported from lib/enums/index.js');
  }

  const sources = await Promise.all(
    uniquePaths.map(async (sourcePath) => ({
      sourcePath,
      value: (await readFile(join(enumDirectory, sourcePath), 'utf8')).trimEnd(),
    })),
  );

  return sources.flatMap(({ sourcePath, value }) => [
    {
      type: 'heading',
      depth: 3,
      children: [{ type: 'text', value: titleFromPath(sourcePath) }],
    },
    {
      type: 'code',
      lang: 'javascript',
      value,
    },
  ]);
}

export function remarkEnums({ root = defaultRoot } = {}) {
  return async function transformer(tree) {
    const targets = [];

    visit(tree, 'paragraph', (node, index, parent) => {
      if (
        node.children.length === 1 &&
        node.children[0].type === 'text' &&
        node.children[0].value === marker &&
        typeof index === 'number' &&
        parent
      ) {
        targets.push({ index, parent });
      }
    });

    if (targets.length === 0) {
      return tree;
    }

    const nodes = await enumNodes(root);

    for (const { index, parent } of targets.reverse()) {
      parent.children.splice(index, 1, ...structuredClone(nodes));
    }

    return tree;
  };
}
