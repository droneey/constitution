import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createNodeFileSystem } from '../node-file-system';

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

  it('should create the folder and write the text when the digest is new', () => {
    // Arrange
    const fileSystem = createNodeFileSystem({
      root,
    });

    // Act
    fileSystem.write({
      path: 'digests/index.tsv',
      text: '# header\n',
    });

    // Assert
    expect(readFileSync(join(root, 'digests/index.tsv'), 'utf8')).toBe(
      '# header\n',
    );
  });

  it('should replace the whole text when the digest already exists', () => {
    // Arrange
    write({
      path: 'digests/core.md',
      text: '# An older and longer core part\n',
    });
    const fileSystem = createNodeFileSystem({
      root,
    });

    // Act
    fileSystem.write({
      path: 'digests/core.md',
      text: '# Core\n',
    });

    // Assert
    expect(readFileSync(join(root, 'digests/core.md'), 'utf8')).toBe(
      '# Core\n',
    );
  });
});
