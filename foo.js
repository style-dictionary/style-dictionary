import { globSync } from 'glob';
import fs from 'node:fs/promises';

const files = globSync('examples/**/*', { ignore: 'node_modules/**/*', nodir: true });

const deleteCopyrights = async (filePath) => {
  const contents = await fs.readFile(filePath, 'utf-8');
  const copyMatch = contents.match(/^(.|\n)*Copyright(.|\n)*?((\/|\*)\/\n)/gm);
  if (copyMatch?.[0]) {
    const newContents = contents.split(copyMatch)[1].trimStart();
    await fs.writeFile(filePath, newContents, 'utf-8');
  }
};

await Promise.all(files.map(deleteCopyrights));
