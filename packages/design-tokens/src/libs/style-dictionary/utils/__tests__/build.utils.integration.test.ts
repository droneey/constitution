import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { buildAll } from '../build.utils';
import { configOf, FILE, OUTPUT } from './style-dictionary.fixtures';

let root = '';

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'design-tokens-'));
});

afterEach(() => {
  rmSync(root, {
    force: true,
    recursive: true,
  });
});

describe('buildAll', () => {
  it('should write the files of every configuration', async () => {
    // Arrange
    const configs = [
      configOf(`${root}/light/`),
      configOf(`${root}/dark/`),
    ];

    // Act
    await buildAll(configs);

    // Assert
    expect([
      readFileSync(join(root, 'light', FILE), 'utf8'),
      readFileSync(join(root, 'dark', FILE), 'utf8'),
    ]).toStrictEqual([
      OUTPUT,
      OUTPUT,
    ]);
  });
});
