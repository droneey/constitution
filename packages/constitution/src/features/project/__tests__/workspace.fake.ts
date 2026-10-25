import { UnitPath } from '#/kernel/value-objects';

import type { Workspace } from '../domain/contracts';

// A workspace that declares the members given, around any project.
const createFakeWorkspace = (members: readonly string[] = []): Workspace => ({
  membersOf: (): readonly UnitPath[] => members.map(UnitPath.create),
});

export { createFakeWorkspace };
