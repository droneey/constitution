import type { AbsolutePath, UnitPath } from '#/kernel/value-objects';

interface Workspace {
  readonly membersOf: (repositoryFolderPath: AbsolutePath) => readonly UnitPath[];
}

export type { Workspace };
