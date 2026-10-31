import type { AbsolutePath } from '#/kernel/value-objects';

import type { FileSignature } from '../value-objects';

type FileSignatures = ReadonlyMap<AbsolutePath, FileSignature>;

interface ShellTree {
  readonly fileSignatures: FileSignatures;
  readonly repositoryFolderPath: AbsolutePath;
}

const changedBetween = (before: FileSignatures, after: FileSignatures): readonly AbsolutePath[] =>
  [
    ...new Set([
      ...before.keys(),
      ...after.keys(),
    ]),
  ].filter((path) => before.get(path) !== after.get(path));

const ShellTree = {
  changedBetween,
} as const;

export type { FileSignatures };
export { ShellTree };
