import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { FileSignature } from '../../value-objects';
import type { FileSignatures } from '../shell-tree.entity';
import { ShellTree } from '../shell-tree.entity';

const signaturesOf = (files: Readonly<Record<string, string>>): FileSignatures =>
  new Map(
    Object.entries(files).map(([path, signature]) => [
      AbsolutePath.create(path),
      FileSignature.create(signature),
    ]),
  );

const before = signaturesOf({
  '/work/a.ts': '1',
  '/work/b.ts': '2',
});

describe('ShellTree.changedBetween', () => {
  it.each([
    {
      after: signaturesOf({
        '/work/a.ts': '1',
        '/work/b.ts': '3',
        '/work/c.ts': '1',
      }),
      changed: [
        '/work/b.ts',
        '/work/c.ts',
      ],
      condition: 'one file changed and one was added',
    },
    {
      after: signaturesOf({
        '/work/a.ts': '1',
      }),
      changed: [],
      condition: 'a file was brought back to what HEAD holds, as a switch to another branch does',
    },
    {
      after: signaturesOf({
        '/work/a.ts': '1',
        '/work/b.ts': '2',
      }),
      changed: [],
      condition: 'every file kept its signature',
    },
  ])(
    'should name the files left changed whose signature differs when $condition',
    ({ after, changed }) => {
      // Act
      const named = ShellTree.changedBetween(before, after);

      // Assert
      expect<readonly string[]>(named).toStrictEqual(changed);
    },
  );
});
