import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { visit } from 'unist-util-visit';

const defaultTypeFile = fileURLToPath(new URL('../../types/Config.ts', import.meta.url));
const markerPattern = /^~ sd-type(?:\s+([A-Za-z_$][\w$]*))?$/;
const ignoredTypeNames = new Set([
  'Array',
  'Record',
  'Set',
  'String',
  'boolean',
  'false',
  'number',
  'string',
  'true',
  'unknown',
]);
const sourceBase = 'https://github.com/style-dictionary/style-dictionary/blob/main/types/';

function declarations(sourceFile) {
  const result = new Map();
  for (const statement of sourceFile.statements) {
    const isType = ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement);
    const isExported = statement.modifiers?.some(
      ({ kind }) => kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isType || !isExported) continue;

    const start = statement.getStart(sourceFile);
    const { line } = sourceFile.getLineAndCharacterOfPosition(start);
    result.set(statement.name.text, {
      name: statement.name.text,
      source: statement.getText(sourceFile).trim(),
      line,
    });
  }

  return result;
}

function importedTypes(sourceFile) {
  const result = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause?.isTypeOnly) continue;
    const moduleName = statement.moduleSpecifier.text;
    if (!moduleName.startsWith('./')) continue;

    const namedBindings = statement.importClause.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;
    for (const element of namedBindings.elements) {
      const sourcePath = moduleName.replace(/^\.\//, '').replace(/\.js$/, '.ts');
      result.set(element.name.text, `${sourceBase}${sourcePath}`);
    }
  }

  return result;
}

function referencedNames(declaration) {
  return [
    ...new Set(
      declaration.source
        .match(/\b[A-Z][A-Za-z0-9_$]*\b/g)
        ?.filter((name) => name !== declaration.name && !ignoredTypeNames.has(name)) ?? [],
    ),
  ];
}

function referenceNodes(names, localDeclarations, imports, typeFile) {
  const typeFileName = basename(typeFile);
  const links = names.flatMap((name) => {
    if (localDeclarations.has(name)) {
      const declaration = localDeclarations.get(name);
      return [
        {
          type: 'link',
          url: `${sourceBase}${typeFileName}#L${declaration.line}`,
          children: [{ type: 'inlineCode', value: name }],
        },
      ];
    }
    if (imports.has(name)) {
      return [
        {
          type: 'link',
          url: imports.get(name),
          children: [{ type: 'inlineCode', value: name }],
        },
      ];
    }
    return [];
  });

  if (links.length === 0) return [];

  return [
    { type: 'text', value: 'Referenced types: ' },
    ...links.flatMap((link, index) =>
      index === 0 ? [link] : [{ type: 'text', value: ', ' }, link],
    ),
    { type: 'text', value: '.' },
  ];
}

async function typeNodes(typeFile, typeName) {
  const source = await readFile(typeFile, 'utf8');
  const sourceFile = ts.createSourceFile(typeFile, source, ts.ScriptTarget.Latest, true);
  const localDeclarations = declarations(sourceFile);
  const declaration = localDeclarations.get(typeName);
  if (!declaration) {
    throw new Error(`No exported type named ${typeName} found in ${typeFile}`);
  }

  const references = referenceNodes(
    referencedNames(declaration),
    localDeclarations,
    importedTypes(sourceFile),
    typeFile,
  );

  return [
    {
      type: 'heading',
      depth: 3,
      children: [{ type: 'text', value: declaration.name }],
    },
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'Generated from the canonical TypeScript definition.' },
        ...(references.length > 0 ? [{ type: 'text', value: ' ' }, ...references] : []),
      ],
    },
    {
      type: 'code',
      lang: 'typescript',
      value: declaration.source,
    },
  ];
}

export function remarkTypes({ typeFile = defaultTypeFile } = {}) {
  return async function transformer(tree) {
    const targets = [];

    visit(tree, 'paragraph', (node, index, parent) => {
      const value = node.children.length === 1 && node.children[0].value;
      const match = typeof value === 'string' && value.match(markerPattern);
      if (match && typeof index === 'number' && parent) {
        targets.push({ index, parent, typeName: match[1] ?? 'Config' });
      }
    });

    for (const { index, parent, typeName } of targets.reverse()) {
      parent.children.splice(index, 1, ...(await typeNodes(typeFile, typeName)));
    }

    return tree;
  };
}
