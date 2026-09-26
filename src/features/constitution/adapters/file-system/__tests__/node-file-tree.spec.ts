import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createNodeFileTree } from '../node-file-tree';

let root = '';

const write = (input: { path: string; text: string }): void => {
  mkdirSync(dirname(join(root, input.path)), {
    recursive: true,
  });
  writeFileSync(join(root, input.path), input.text);
};

const git = (args: readonly string[]): void => {
  execFileSync('git', args, {
    cwd: root,
    stdio: 'ignore',
  });
};

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'node-file-tree-'));
  git([
    'init',
    '--quiet',
  ]);
});

afterEach(() => {
  rmSync(root, {
    force: true,
    recursive: true,
  });
});

describe('createNodeFileTree', () => {
  it('should list tracked and untracked files but no ignored or deleted one when the root is a repository', () => {
    // Arrange
    write({
      path: '.gitignore',
      text: 'local/\n.DS_Store\n',
    });
    write({
      path: 'blocks/core/core.md',
      text: '# Core\n',
    });
    write({
      path: 'gone.md',
      text: 'x\n',
    });
    git([
      'add',
      '.',
    ]);
    rmSync(join(root, 'gone.md'));
    write({
      path: 'blocks/domains/ui/ui.md',
      text: '# UI\n',
    });
    write({
      path: 'local/plan.md',
      text: '# Plan\n',
    });
    write({
      path: 'blocks/core/.DS_Store',
      text: '',
    });
    const tree = createNodeFileTree({
      root,
    });

    // Act
    const paths = tree.list();

    // Assert
    expect(paths).toStrictEqual([
      '.gitignore',
      'blocks/core/core.md',
      'blocks/domains/ui/ui.md',
    ]);
  });

  it('should strip a byte-order mark and turn CRLF into LF when a file is read', () => {
    // Arrange
    write({
      path: 'blocks/core/core.md',
      text: '﻿---\r\nid: core\r\n---\r\n',
    });
    const tree = createNodeFileTree({
      root,
    });

    // Act
    const text = tree.read('blocks/core/core.md');

    // Assert
    expect(text).toBe('---\nid: core\n---\n');
  });
});
