import { UnitPath } from '#/kernel/value-objects';

const REPOSITORY_NAME = '.';

const unitText = (unit: UnitPath): string => (UnitPath.isRepository(unit) ? REPOSITORY_NAME : unit);

export { unitText };
