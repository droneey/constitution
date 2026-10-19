import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import {
  createNodeBaseTree,
  createNodeFileSystem,
  repositoryRootOf,
} from '../node-file-system.adapter';

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
  root = mkdtempSync(join(tmpdir(), 'node-file-system-'));
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

describe('createNodeFileSystem', () => {
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
    const fileSystem = createNodeFileSystem({
      root,
    });

    // Act
    const paths = fileSystem.list();

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
    const fileSystem = createNodeFileSystem({
      root,
    });

    // Act
    const text = fileSystem.read('blocks/core/core.md');

    // Assert
    expect(text).toBe('---\nid: core\n---\n');
  });
});

describe('repositoryRootOf', () => {
  it('should give the root of the repository when the folder sits in a package of it', () => {
    // Arrange
    write({
      path: 'packages/constitution/package.json',
      text: '{}\n',
    });

    // Act
    const found = repositoryRootOf(join(root, 'packages', 'constitution'));

    // Assert
    expect(realpathSync(found)).toBe(realpathSync(root));
  });
});

describe('createNodeBaseTree', () => {
  it('should list the blocks and the vocabulary of an unpacked Constitution and nothing else when it holds both', () => {
    // Arrange
    write({
      path: 'blocks/core/core.md',
      text: '# Core\r\n',
    });
    write({
      path: 'presets/common/biome/foundation/self.jsonc',
      text: '{}\n',
    });
    write({
      path: 'vocabulary.yaml',
      text: 'architecture: {}\n',
    });
    const tree = createNodeBaseTree({
      root,
    });

    // Act
    const listed = tree.list();

    // Assert
    expect({
      core: tree.read('blocks/core/core.md'),
      listed,
    }).toStrictEqual({
      core: '# Core\n',
      listed: [
        'blocks/core/core.md',
        'vocabulary.yaml',
      ],
    });
  });

  it('should list nothing when the folder holds no Constitution', () => {
    // Arrange
    const tree = createNodeBaseTree({
      root,
    });

    // Act
    const listed = tree.list();

    // Assert
    expect(listed).toStrictEqual([]);
  });
});
