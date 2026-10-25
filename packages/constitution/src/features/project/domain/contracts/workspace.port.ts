import type { UnitPath } from '#/kernel/value-objects';

interface Workspace {
  /**
   * each member's folder from the project's, in the order of their paths; none when the project
   * declares no workspace
   */
  readonly membersOf: (project: string) => readonly UnitPath[];
}

export type { Workspace };
