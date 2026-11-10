import type { AbsolutePath } from '#/kernel/value-objects';

import type { FileSignature } from '../value-objects';

type FileSignatures = ReadonlyMap<AbsolutePath, FileSignature>;

interface ShellTree {
  readonly fileSignatures: FileSignatures;
  readonly repositoryFolderPath: AbsolutePath;
}

// Why: the tree after the command names only the files that differ from HEAD, so a file it no
// longer names was brought back to what HEAD holds, as a switch, a pull or a checkout does, and is
// no change the command left.
const changedBetween = (before: FileSignatures, after: FileSignatures): readonly AbsolutePath[] =>
  [
    ...after.keys(),
  ].filter((path) => before.get(path) !== after.get(path));

const ShellTree = {
  changedBetween,
} as const;

export type { FileSignatures };
export { ShellTree };
