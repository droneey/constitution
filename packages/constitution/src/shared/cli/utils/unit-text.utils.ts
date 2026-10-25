import { UnitPath } from '#/kernel/value-objects';

const REPOSITORY_NAME = '.';

/** A unit's folder as a report names it: "." for the repository. */
const unitText = (unit: UnitPath): string => (UnitPath.isRepository(unit) ? REPOSITORY_NAME : unit);

export { unitText };
