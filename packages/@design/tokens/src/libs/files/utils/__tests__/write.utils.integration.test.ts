import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { writeWholeWhenChanged } from '../write.utils';

const TEXT = ':root {}\n';

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

describe('writeWholeWhenChanged', () => {
  it('should write the text in a folder that does not exist yet, leaving no other file', () => {
    // Arrange
    const path = join(folder, 'theme', 'constants', 'light.gen.ts');

    // Act
    writeWholeWhenChanged({
      path,
      text: TEXT,
    });

    // Assert
    expect([
      readFileSync(path, 'utf8'),
      readdirSync(join(folder, 'theme', 'constants')),
    ]).toStrictEqual([
      TEXT,
      [
        'light.gen.ts',
      ],
    ]);
  });

  it('should replace a file that holds another text', () => {
    // Arrange
    const path = join(folder, 'light.gen.css');

    writeFileSync(path, `${TEXT}\n`);

    // Act
    writeWholeWhenChanged({
      path,
      text: TEXT,
    });

    // Assert
    expect(readFileSync(path, 'utf8')).toBe(TEXT);
  });

  it('should leave the very file in place when it already holds the text', () => {
    // Arrange
    const path = join(folder, 'light.gen.css');

    writeFileSync(path, TEXT);

    const before = statSync(path).ino;

    // Act
    writeWholeWhenChanged({
      path,
      text: TEXT,
    });

    // Assert
    expect(statSync(path).ino).toBe(before);
  });
});
