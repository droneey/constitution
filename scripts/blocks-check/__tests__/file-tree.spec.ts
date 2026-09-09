import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { nodeFileTree } from '../file-tree';

const write = (root: string, path: string, text: string): void => {
  mkdirSync(join(root, path, '..'), {
    recursive: true,
  });
  writeFileSync(join(root, path), text);
};

describe('nodeFileTree', () => {
  let root = '';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'blocks-check-'));
    write(root, 'README.md', '# readme\n');
    write(root, 'blocks/core/block.yml', 'kind: core\n');
    write(root, 'node_modules/pkg/index.js', 'ignored');
    write(root, '.git/HEAD', 'ignored');
  });

  afterEach(() => {
    rmSync(root, {
      force: true,
      recursive: true,
    });
  });

  it('should list every file with posix paths, sorted, skipping git and dependencies', () => {
    // Act
    const listed = nodeFileTree(root).list();

    // Assert
    expect(listed).toStrictEqual([
      'README.md',
      'blocks/core/block.yml',
    ]);
  });

  it('should read a file by its listed path', () => {
    // Act
    const text = nodeFileTree(root).read('blocks/core/block.yml');

    // Assert
    expect(text).toBe('kind: core\n');
  });
});
