import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { buildAll } from '../build.utils';
import {
  configOf,
  FILE,
  OUTPUT,
  platformlessConfig,
  textlessConfigOf,
} from './style-dictionary.fixtures';

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

  it('should write no file for a format that gives no text', async () => {
    // Arrange
    const configs = [
      textlessConfigOf(`${root}/`),
    ];

    // Act
    await buildAll(configs);

    // Assert
    expect(existsSync(join(root, FILE))).toBe(false);
  });

  it('should build a configuration with no platform', async () => {
    // Arrange
    const configs = [
      platformlessConfig,
    ];

    // Act
    const built = buildAll(configs);

    // Assert
    await expect(built).resolves.toBeUndefined();
  });
});
