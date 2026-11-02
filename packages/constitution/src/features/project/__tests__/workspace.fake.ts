import { UnitPath } from '#/kernel/value-objects';

import type { Workspace } from '../application/contracts';

const createFakeWorkspace = (members: readonly string[] = []): Workspace => ({
  membersOf: (): readonly UnitPath[] => members.map(UnitPath.create),
});

export { createFakeWorkspace };
