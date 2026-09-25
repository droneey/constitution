import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createNodeFileTree } from '../node-file-tree';

const write = (input: { path: string; root: string; text: string }): void => {
  mkdirSync(join(input.root, input.path, '..'), {
    recursive: true,
  });
  writeFileSync(join(input.root, input.path), input.text);
};

describe('createNodeFileTree', () => {
  let root = '';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'constitution-'));

    for (const [path, text] of [
      [
        'README.md',
        '# readme\n',
      ],
      [
        'blocks/core/core.md',
        '# Core\n',
      ],
      [
        'blocks/core/.DS_Store',
        '',
      ],
      [
        'node_modules/pkg/index.js',
        'ignored',
      ],
      [
        '.git/HEAD',
        'ignored',
      ],
    ] as const) {
      write({
        path,
        root,
        text,
      });
    }
  });

  afterEach(() => {
    rmSync(root, {
      force: true,
      recursive: true,
    });
  });

  it('should list files with posix paths, sorted, skipping git, dependencies and .DS_Store', () => {
    // Act
    const listed = createNodeFileTree({
      root,
    }).list();

    // Assert
    expect(listed).toStrictEqual([
      'README.md',
      'blocks/core/core.md',
    ]);
  });

  it('should read a file by its listed path', () => {
    // Act
    const text = createNodeFileTree({
      root,
    }).read('blocks/core/core.md');

    // Assert
    expect(text).toBe('# Core\n');
  });
});
