import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

const packageFolder = join(import.meta.dir, '..', '..');

const presetsFolder = join(packageFolder, 'presets');
const LOAD_SPEC_SUFFIX = '-preset.e2e.test.ts';
const AXIS_MARK = '@';
const ID_SEPARATOR = '/';

const readersOf = (folder: string): readonly string[] =>
  readdirSync(join(presetsFolder, folder), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const path = folder === '' ? entry.name : `${folder}${ID_SEPARATOR}${entry.name}`;

    if (!entry.isDirectory() || entry.name.startsWith(AXIS_MARK) || entry.name === 'plugins') {
      return [];
    }

    const isReader = readdirSync(join(presetsFolder, path)).some((name) =>
      name.startsWith(AXIS_MARK),
    );

    return [
      ...(isReader
        ? [
            path,
          ]
        : []),
      ...readersOf(path),
    ];
  });

const readersWithNoLoadSpec = (): readonly string[] =>
  readersOf('').filter(
    (reader) =>
      !existsSync(
        join(import.meta.dir, `${reader.split(ID_SEPARATOR).at(-1) ?? reader}${LOAD_SPEC_SUFFIX}`),
      ),
  );

describe('the readers of the presets', () => {
  it('should have a load spec of its own when a reader has a folder of preset files', () => {
    // Act
    const unspecified = readersWithNoLoadSpec();

    // Assert
    expect(unspecified).toStrictEqual([]);
  });
});
