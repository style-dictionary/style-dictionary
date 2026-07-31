import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import { remarkTypes } from '../docs/src/remark-types.js';

describe('remarkTypes', () => {
  it('replaces a type marker with the canonical declaration and references', async () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '~ sd-type Config' }],
        },
      ],
    };

    await remarkTypes()(tree);

    expect(tree.children.map((node) => node.type)).to.deep.equal(['heading', 'paragraph', 'code']);
    expect(tree.children[0].children[0].value).to.equal('Config');
    expect(tree.children[2].lang).to.equal('typescript');
    expect(tree.children[2].value).to.contain('export interface Config');
    expect(tree.children[2].value).to.contain('File globs containing the design tokens');
    expect(tree.children[1].children.some((node) => node.type === 'link')).to.equal(true);
    expect(tree.children).not.to.deep.include({
      type: 'paragraph',
      children: [{ type: 'text', value: '~ sd-type Config' }],
    });
  });

  it('leaves trees without a type marker unchanged', async () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Configuration' }],
        },
      ],
    };
    const expected = structuredClone(tree);

    await remarkTypes()(tree);

    expect(tree).to.deep.equal(expected);
  });

  it('reports a missing exported type', async () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '~ sd-type Missing' }],
        },
      ],
    };
    const typeFile = fileURLToPath(new URL('__fixtures__/empty-types.ts', import.meta.url));

    let error;
    try {
      await remarkTypes({ typeFile })(tree);
    } catch (caught) {
      error = caught;
    }

    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.contain('No exported type named Missing');
  });
});
