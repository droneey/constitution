import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { z } from 'zod';

import { readModelFile } from '../model-file';

const versionModel = z.object({
  version: z.string(),
});

let folder = '';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'model-file-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('readModelFile', () => {
  it('should give the data the model reads when the file holds it', () => {
    // Arrange
    writeFileSync(join(folder, 'package.json'), '{"version":"1.0.0","name":"x"}');

    // Act
    const read = readModelFile({
      model: versionModel,
      parse: JSON.parse,
      path: join(folder, 'package.json'),
    });

    // Assert
    expect(read).toStrictEqual({
      version: '1.0.0',
    });
  });

  it('should hand the parse the file as text when the parse reads text', () => {
    // Arrange
    writeFileSync(join(folder, 'VERSION'), ' 1.0.0\n');

    // Act
    const read = readModelFile({
      model: versionModel,
      parse: (text: string): unknown => ({
        version: text.trim(),
      }),
      path: join(folder, 'VERSION'),
    });

    // Assert
    expect(read).toStrictEqual({
      version: '1.0.0',
    });
  });

  it.each([
    {
      condition: 'the file is missing',
      write: (): void => {},
    },
    {
      condition: 'the path is a folder',
      write: (): void => {
        mkdirSync(join(folder, 'package.json'));
      },
    },
    {
      condition: 'the text does not parse',
      write: (): void => {
        writeFileSync(join(folder, 'package.json'), '{"version":');
      },
    },
    {
      condition: 'the data is of another shape',
      write: (): void => {
        writeFileSync(join(folder, 'package.json'), '{"version":1}');
      },
    },
  ])('should give undefined when $condition', ({ write }) => {
    // Arrange
    write();

    // Act
    const read = readModelFile({
      model: versionModel,
      parse: JSON.parse,
      path: join(folder, 'package.json'),
    });

    // Assert
    expect(read).toBeUndefined();
  });

  it('should let a failure of the parse that is no syntax error through', () => {
    // Arrange
    writeFileSync(join(folder, 'package.json'), '{}');

    // Act
    const read = (): unknown =>
      readModelFile({
        model: versionModel,
        parse: (): unknown => {
          throw new RangeError('a defect');
        },
        path: join(folder, 'package.json'),
      });

    // Assert
    expect(read).toThrow(new RangeError('a defect'));
  });
});
