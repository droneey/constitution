import type { ListedOverride } from '#/kernel/entities';
import { UnitPath } from '#/kernel/value-objects';

const overrideLine = (override: ListedOverride): string =>
  `- ${override.rule}: ${override.level}${UnitPath.isRepository(override.unit) ? '' : ` in ${override.unit}`}${
    override.until === undefined ? '' : ` until ${override.until.toString()}`
  }`;

/** The rules the project lowered, each with its level, the member it applies to and its end. */
const overrideListLines = (overrides: readonly ListedOverride[]): readonly string[] =>
  overrides.length === 0
    ? []
    : [
        '## Overrides',
        ...overrides.map(overrideLine),
      ];

export { overrideListLines };
