import { readFile } from 'node:fs/promises';
import { expect } from 'chai';
import { remarkEnums } from '../docs/src/remark-enums.js';

describe('remarkEnums', () => {
  it('replaces the enum marker with headings and current source', async () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '~ sd-enums' }],
        },
      ],
    };

    await remarkEnums()(tree);

    const headings = tree.children.filter((node) => node.type === 'heading');
    const codeBlocks = tree.children.filter((node) => node.type === 'code');
    const actionsSource = await readFile(
      new URL('../lib/enums/actions.js', import.meta.url),
      'utf8',
    );

    expect(headings.map((node) => node.children[0].value)).to.include.members([
      'Actions',
      'Formats',
      'Token Types',
      'Transforms',
    ]);
    expect(codeBlocks[0]).to.deep.equal({
      type: 'code',
      lang: 'javascript',
      value: actionsSource.trimEnd(),
    });
    expect(tree.children).not.to.deep.include({
      type: 'paragraph',
      children: [{ type: 'text', value: '~ sd-enums' }],
    });
  });

  it('leaves trees without an enum marker unchanged', async () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Enums' }],
        },
      ],
    };
    const expected = structuredClone(tree);

    await remarkEnums()(tree);

    expect(tree).to.deep.equal(expected);
  });
});
