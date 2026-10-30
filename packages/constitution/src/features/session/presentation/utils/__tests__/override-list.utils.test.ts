import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { RuleSlug, repositoryUnit, UnitPath } from '#/kernel/value-objects';

import type { DigestOverride } from '../../../domain/session-digest/entities';
import { overrideListLines } from '../override-list.utils';

describe('overrideListLines', () => {
  it("should list each override's rule, level, member and end under one heading", () => {
    // Arrange
    const overrides: readonly DigestOverride[] = [
      {
        level: Level.Should,
        rule: RuleSlug.create('inputs-are-labelled'),
        unit: repositoryUnit,
        until: Temporal.PlainDate.from('2026-07-01'),
      },
      {
        level: Level.May,
        rule: RuleSlug.create('themes-are-tokens'),
        unit: UnitPath.create('apps/web'),
      },
    ];

    // Act
    const lines = overrideListLines(overrides);

    // Assert
    expect(lines).toStrictEqual([
      '## Overrides',
      '- inputs-are-labelled: SHOULD until 2026-07-01',
      '- themes-are-tokens: MAY in apps/web',
    ]);
  });

  it('should give no line when no rule is overridden', () => {
    // Act
    const lines = overrideListLines([]);

    // Assert
    expect(lines).toStrictEqual([]);
  });
});
