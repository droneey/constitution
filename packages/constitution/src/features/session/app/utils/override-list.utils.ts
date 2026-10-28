import { UnitPath } from '#/kernel/value-objects';

import type { DigestOverride } from '../../domain/entities';

const overrideLine = (override: DigestOverride): string =>
  `- ${override.rule}: ${override.level}${UnitPath.isRepository(override.unit) ? '' : ` in ${override.unit}`}${
    override.until === undefined ? '' : ` until ${override.until.toString()}`
  }`;

const overrideListLines = (overrides: readonly DigestOverride[]): readonly string[] =>
  overrides.length === 0
    ? []
    : [
        '## Overrides',
        ...overrides.map(overrideLine),
      ];

export { overrideListLines };
