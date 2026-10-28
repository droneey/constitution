import { mkdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures';
import { temporaryFolder } from '#/__tests__/temporary-folder.fixtures';

import { confinedPathOf } from '../confined.utils';
import { isMissingPathError } from '../guards.utils';

const sandboxPath = temporaryFolder();

describe('confinedPathOf', () => {
  it.each([
    {
      givenPath: 'style-dictionary.config.ts',
      pathFromRoot: 'style-dictionary.config.ts',
    },
    {
      givenPath: './theme/../style-dictionary.config.ts',
      pathFromRoot: 'style-dictionary.config.ts',
    },
    {
      givenPath: '..config.ts',
      pathFromRoot: '..config.ts',
    },
    {
      givenPath: '.',
      pathFromRoot: '',
    },
  ])(
    'should give the real path of $givenPath, which stays in the root',
    ({ givenPath, pathFromRoot }) => {
      // Arrange
      const rootPath = join(sandboxPath(), 'root');

      mkdirSync(join(rootPath, 'theme'), {
        recursive: true,
      });
      writeFileSync(join(rootPath, 'style-dictionary.config.ts'), '');
      writeFileSync(join(rootPath, '..config.ts'), '');

      // Act
      const realPath = confinedPathOf({
        rootPath,
        givenPath,
      });

      // Assert
      expect(realPath).toBe(join(realpathSync(rootPath), pathFromRoot));
    },
  );

  it.each([
    '..',
    '../outside.config.ts',
    '../missing.config.ts',
  ])('should refuse %s, which leads out of the root', (givenPath) => {
    // Arrange
    const rootPath = join(sandboxPath(), 'root');

    mkdirSync(rootPath);
    writeFileSync(join(sandboxPath(), 'outside.config.ts'), '');

    // Act
    const realPath = confinedPathOf({
      rootPath,
      givenPath,
    });

    // Assert
    expect(realPath).toBeUndefined();
  });

  it('should refuse a link in the root to a file outside it', () => {
    // Arrange
    const rootPath = join(sandboxPath(), 'root');

    mkdirSync(rootPath);
    writeFileSync(join(sandboxPath(), 'outside.config.ts'), '');
    symlinkSync(join(sandboxPath(), 'outside.config.ts'), join(rootPath, 'linked.config.ts'));

    // Act
    const realPath = confinedPathOf({
      rootPath,
      givenPath: 'linked.config.ts',
    });

    // Assert
    expect(realPath).toBeUndefined();
  });

  it('should throw a failure that tells a missing path when nothing is at the path', () => {
    // Arrange
    const givenPath = 'missing.config.ts';

    // Act
    const failure = failureOf(() =>
      confinedPathOf({
        rootPath: sandboxPath(),
        givenPath,
      }),
    );

    // Assert
    expect(isMissingPathError(failure)).toBe(true);
  });
});
