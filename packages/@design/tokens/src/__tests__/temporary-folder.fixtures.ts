import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach } from 'bun:test';

const temporaryFolder = (): (() => string) => {
  let folderPath: string | undefined;

  beforeEach(() => {
    folderPath = mkdtempSync(join(tmpdir(), 'design-tokens-'));
  });

  afterEach(() => {
    if (folderPath !== undefined) {
      rmSync(folderPath, {
        force: true,
        recursive: true,
      });
      folderPath = undefined;
    }
  });

  return () => {
    if (folderPath === undefined) {
      throw new Error('no case has made its temporary folder: read it inside a case');
    }

    return folderPath;
  };
};

export { temporaryFolder };
