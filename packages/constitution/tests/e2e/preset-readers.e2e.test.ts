import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

const packageFolder = join(import.meta.dir, '..', '..');

const LOAD_SPEC_SUFFIX = '-preset.e2e.test.ts';

const readersWithNoLoadSpec = (): readonly string[] =>
  readdirSync(join(packageFolder, 'presets')).filter(
    (reader) => !existsSync(join(import.meta.dir, `${reader}${LOAD_SPEC_SUFFIX}`)),
  );

describe('the readers of the presets', () => {
  it('should have a load spec of its own when a reader has a folder of preset files', () => {
    // Act
    const unspecified = readersWithNoLoadSpec();

    // Assert
    expect(unspecified).toStrictEqual([]);
  });
});
