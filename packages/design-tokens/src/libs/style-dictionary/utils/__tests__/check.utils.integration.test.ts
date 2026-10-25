import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { staleFilesOf } from '../check.utils';
import { configOf, FILE, OUTPUT, platformlessConfig } from './style-dictionary.fixtures';

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

describe('staleFilesOf', () => {
  it('should list no file when each holds what its build writes', async () => {
    // Arrange
    writeFileSync(join(root, FILE), OUTPUT);

    // Act
    const stale = await staleFilesOf([
      configOf(`${root}/`),
    ]);

    // Assert
    expect(stale).toStrictEqual([]);
  });

  it('should list, across the configurations, every file that differs from what its build writes', async () => {
    // Arrange
    mkdirSync(join(root, 'light'));
    mkdirSync(join(root, 'dark'));
    writeFileSync(join(root, 'light', FILE), OUTPUT);
    writeFileSync(join(root, 'dark', FILE), `${OUTPUT}\n`);

    // Act
    const stale = await staleFilesOf([
      configOf(`${root}/light/`),
      configOf(`${root}/dark/`),
    ]);

    // Assert
    expect(stale).toStrictEqual([
      join(root, 'dark', FILE),
    ]);
  });

  it('should list nothing for a configuration with no platform', async () => {
    // Arrange
    const config = platformlessConfig;

    // Act
    const stale = await staleFilesOf([
      config,
    ]);

    // Assert
    expect(stale).toStrictEqual([]);
  });
});
