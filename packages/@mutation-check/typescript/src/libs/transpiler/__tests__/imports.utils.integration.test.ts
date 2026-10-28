import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, describe, expect, it } from 'bun:test';

import { importsOf } from '../imports.utils.ts';

const outerFolderPath = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-imports-')));
const workingFolderPath = join(outerFolderPath, 'unit');

const FILES = {
  'outside.ts': 'export const outside = 1;\n',
  'unit/node_modules/shop/index.ts': 'export const shop = 1;\n',
  // a file Bun reads as markup imports React's runtime of markup, which a project with one installs
  'unit/node_modules/react/index.js': 'export {};\n',
  'unit/node_modules/react/jsx-dev-runtime.js': 'export {};\n',
  'unit/node_modules/react/package.json': '{ "name": "react", "main": "index.js" }\n',
  'unit/node_modules/shop/package.json': '{ "name": "shop", "main": "index.ts" }\n',
  // its cast only TypeScript reads: a reader of markup refuses it
  'unit/src/order.ts':
    "import { shop } from 'shop';\nimport { outside } from '../../outside.ts';\nimport { rate } from './rate.ts';\nimport { view } from './view.tsx';\nimport 'node:path';\n\nexport const order = <unknown>[shop, outside, rate, view];\n",
  'unit/src/rate.ts': 'export const rate = 1;\n',
  'unit/src/view.tsx': "import { rate } from './rate.ts';\n\nexport const view = <b>{rate}</b>;\n",
  'unit/src/legacy.js': "import { rate } from './rate.ts';\n\nexport const legacy = rate;\n",
  'unit/src/stale.ts':
    "import { gone } from './gone.ts';\nimport { rate } from './rate.ts';\n\nexport const stale = [gone, rate];\n",
} as const satisfies Readonly<Record<string, string>>;

for (const [filePath, text] of Object.entries(FILES)) {
  mkdirSync(dirname(join(outerFolderPath, filePath)), {
    recursive: true,
  });
  writeFileSync(join(outerFolderPath, filePath), text);
}

afterAll(() => {
  rmSync(outerFolderPath, {
    force: true,
    recursive: true,
  });
});

describe('importsOf', () => {
  it.each([
    {
      condition: 'a TypeScript file imports files of the folder, a package and a file outside',
      filePath: 'src/order.ts',
      importedPaths: [
        'src/rate.ts',
        'src/view.tsx',
      ],
    },
    {
      condition: 'a file Bun reads as markup imports a file of the folder',
      filePath: 'src/view.tsx',
      importedPaths: [
        'src/rate.ts',
      ],
    },
    {
      condition: 'a file imports one that is not there',
      filePath: 'src/stale.ts',
      importedPaths: [
        'src/rate.ts',
      ],
    },
    {
      condition: 'the file is no TypeScript',
      filePath: 'src/legacy.js',
      importedPaths: [],
    },
  ])(
    'should list the files of the working folder the file imports when $condition',
    ({ filePath, importedPaths }) => {
      // Act
      const found = importsOf({
        filePath,
        workingFolderPath,
      });

      // Assert
      expect(found).toStrictEqual(importedPaths);
    },
  );
});
