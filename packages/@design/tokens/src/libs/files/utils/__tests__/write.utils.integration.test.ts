import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures';
import { temporaryFolder } from '#/__tests__/temporary-folder.fixtures';

import { writeWholeWhenChanged } from '../write.utils';
import { unrenamablePathIn } from './write.fixtures';

const CSS_TEXT = ':root {}\n';

const sandboxPath = temporaryFolder();

describe('writeWholeWhenChanged', () => {
  it('should write the text in a folder that does not exist yet, leaving no other file', () => {
    // Arrange
    const filePath = join(sandboxPath(), 'theme', 'constants', 'light.gen.ts');

    // Act
    writeWholeWhenChanged({
      path: filePath,
      text: CSS_TEXT,
    });

    // Assert
    expect([
      readFileSync(filePath, 'utf8'),
      readdirSync(join(sandboxPath(), 'theme', 'constants')),
    ]).toStrictEqual([
      CSS_TEXT,
      [
        'light.gen.ts',
      ],
    ]);
  });

  it('should replace a file that holds another text', () => {
    // Arrange
    const filePath = join(sandboxPath(), 'light.gen.css');

    writeFileSync(filePath, `${CSS_TEXT}\n`);

    // Act
    writeWholeWhenChanged({
      path: filePath,
      text: CSS_TEXT,
    });

    // Assert
    expect(readFileSync(filePath, 'utf8')).toBe(CSS_TEXT);
  });

  it('should throw when the rename fails', () => {
    // Arrange
    const filePath = unrenamablePathIn(sandboxPath());

    // Act
    const failure = failureOf(() =>
      writeWholeWhenChanged({
        path: filePath,
        text: CSS_TEXT,
      }),
    );

    // Assert
    expect(failure).toBeInstanceOf(Error);
  });

  it('should leave no pending file behind when the rename fails', () => {
    // Arrange
    const filePath = unrenamablePathIn(sandboxPath());

    // Act
    failureOf(() =>
      writeWholeWhenChanged({
        path: filePath,
        text: CSS_TEXT,
      }),
    );

    // Assert
    expect(readdirSync(dirname(filePath))).toStrictEqual([]);
  });

  it('should leave the very file in place when it already holds the text', () => {
    // Arrange
    const filePath = join(sandboxPath(), 'light.gen.css');

    writeFileSync(filePath, CSS_TEXT);

    const inodeBefore = statSync(filePath).ino;

    // Act
    writeWholeWhenChanged({
      path: filePath,
      text: CSS_TEXT,
    });

    // Assert
    expect(statSync(filePath).ino).toBe(inodeBefore);
  });
});
