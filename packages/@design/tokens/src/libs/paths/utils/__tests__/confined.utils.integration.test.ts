import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { confinedPathOf } from '../confined.utils';

let folder = '';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'design-tokens-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('confinedPathOf', () => {
  it.each([
    {
      input: 'style-dictionary.config.ts',
      within: 'style-dictionary.config.ts',
    },
    {
      input: './theme/../style-dictionary.config.ts',
      within: 'style-dictionary.config.ts',
    },
    {
      input: '..config.ts',
      within: '..config.ts',
    },
    {
      input: '.',
      within: '',
    },
  ])('should give the real path of $input, which stays in the root', ({ input, within }) => {
    // Arrange
    const root = join(folder, 'root');

    mkdirSync(join(root, 'theme'), {
      recursive: true,
    });
    writeFileSync(join(root, 'style-dictionary.config.ts'), '');
    writeFileSync(join(root, '..config.ts'), '');

    // Act
    const path = confinedPathOf(root, input);

    // Assert
    expect(path).toBe(join(realpathSync(root), within));
  });

  it.each([
    '..',
    '../outside.config.ts',
  ])('should refuse %s, which leads out of the root', (input) => {
    // Arrange
    const root = join(folder, 'root');

    mkdirSync(root);
    writeFileSync(join(folder, 'outside.config.ts'), '');

    // Act
    const path = confinedPathOf(root, input);

    // Assert
    expect(path).toBeUndefined();
  });

  it('should throw when nothing is at the path', () => {
    // Arrange
    const input = 'missing.config.ts';

    // Act
    const confine = (): string | undefined => confinedPathOf(folder, input);

    // Assert
    expect(confine).toThrow();
  });
});
