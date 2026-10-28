import { UnitPath } from '#/kernel/value-objects';

import type { DigestOverride } from '../../domain/entities';

const overrideLine = (override: DigestOverride): string =>
  `- ${override.rule}: ${override.level}${UnitPath.isRepository(override.unit) ? '' : ` in ${override.unit}`}${
    override.until === undefined ? '' : ` until ${override.until.toString()}`
  }`;

/** The rules the project lowered, each with its level, the member it applies to and its end. */
const overrideListLines = (overrides: readonly DigestOverride[]): readonly string[] =>
  overrides.length === 0
    ? []
    : [
        '## Overrides',
        ...overrides.map(overrideLine),
      ];

export { overrideListLines };
