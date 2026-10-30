import { describe, expect, it } from 'bun:test';

import { repositoryUnit, UnitPath } from '#/kernel/value-objects';

import { ConfigOverride, MemberProblem, ProjectConfig } from '../project-config.entity';

const LINE = 7;

const overrideOf = (fields: Partial<ConfigOverride>): ConfigOverride =>
  ConfigOverride.create({
    level: undefined,
    line: LINE,
    reason: undefined,
    rule: undefined,
    until: undefined,
    ...fields,
  });

describe('ConfigOverride', () => {
  it.each([
    {
      condition: 'it gives none of its fields',
      expected: {
        line: LINE,
      },
      fields: {},
    },
    {
      condition: 'it gives only a level',
      expected: {
        level: 'should',
        line: LINE,
      },
      fields: {
        level: 'should',
      },
    },
    {
      condition: 'it gives only a reason',
      expected: {
        line: LINE,
        reason: 'a legacy module',
      },
      fields: {
        reason: 'a legacy module',
      },
    },
    {
      condition: 'it gives only a rule',
      expected: {
        line: LINE,
        rule: 'a',
      },
      fields: {
        rule: 'a',
      },
    },
    {
      condition: 'it gives only an until',
      expected: {
        line: LINE,
        until: '2026-07-01',
      },
      fields: {
        until: '2026-07-01',
      },
    },
    {
      condition: 'it gives every field',
      expected: {
        level: 'may',
        line: LINE,
        reason: 'a legacy module',
        rule: 'a',
        until: '2026-07-01',
      },
      fields: {
        level: 'may',
        reason: 'a legacy module',
        rule: 'a',
        until: '2026-07-01',
      },
    },
  ])('should hold only the fields it gives when $condition', ({ expected, fields }) => {
    // Act
    const override = overrideOf(fields);

    // Assert
    expect(override).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'none is missing',
      fields: {
        level: 'should',
        reason: 'a legacy module',
        rule: 'a',
      },
      missing: [],
    },
    {
      condition: 'only the rule is missing',
      fields: {
        level: 'should',
        reason: 'a legacy module',
      },
      missing: [
        'rule',
      ],
    },
    {
      condition: 'only the level is missing',
      fields: {
        reason: 'a legacy module',
        rule: 'a',
      },
      missing: [
        'level',
      ],
    },
    {
      condition: 'only the reason is missing',
      fields: {
        level: 'should',
        rule: 'a',
      },
      missing: [
        'reason',
      ],
    },
    {
      condition: 'all three are missing',
      fields: {},
      missing: [
        'rule',
        'level',
        'reason',
      ],
    },
  ])('should list $missing when $condition', ({ fields, missing }) => {
    // Arrange
    const override = overrideOf(fields);

    // Act
    const missingFields = ConfigOverride.missingFieldsOf(override);

    // Assert
    expect(missingFields).toStrictEqual(missing);
  });
});

describe('ProjectConfig.create', () => {
  it("should lead with the repository's own configuration, then each member's", () => {
    // Arrange
    const config = {
      empties: [],
      items: [],
      keys: [],
      overrides: [],
    };
    const member = {
      config: {
        ...config,
        name: '@acme/web',
      },
      path: UnitPath.create('apps/web'),
    };
    const unread = {
      path: UnitPath.create('apps/api'),
      problem: MemberProblem.Missing,
    } as const;

    // Act
    const created = ProjectConfig.create({
      members: [
        member,
      ],
      root: config,
      unread: [
        unread,
      ],
    });

    // Assert
    expect(created).toStrictEqual({
      units: [
        {
          config,
          path: repositoryUnit,
        },
        member,
      ],
      unread: [
        unread,
      ],
    });
  });
});
