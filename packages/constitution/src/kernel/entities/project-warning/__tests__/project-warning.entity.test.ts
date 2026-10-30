import { describe, expect, it } from 'bun:test';

import { ConfigKey } from '../../../constants';
import { BlockId, RuleSlug, SourceKind, UnitPath } from '../../../value-objects';
import { ProjectWarning, WarningCode, WarningKind } from '../project-warning.entity';

describe('ProjectWarning.codeOf', () => {
  it.each<{
    code: WarningCode;
    subject: string;
    warning: ProjectWarning;
  }>([
    {
      code: WarningCode.Config,
      subject: 'a key of constitution.yaml',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: ConfigKey.Axes,
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      code: WarningCode.Blocks,
      subject: 'a block constitution.yaml lists',
      warning: {
        details: {
          name: 'nope',
        },
        kind: WarningKind.NameUnknown,
      },
    },
    {
      code: WarningCode.Requirements,
      subject: "a block's requirement",
      warning: {
        details: {
          block: BlockId.create('matomo'),
          requirement: RuleSlug.create('analytics-consent-first'),
          unit: UnitPath.create(''),
        },
        kind: WarningKind.RequirementNotMet,
      },
    },
    {
      code: WarningCode.Overrides,
      subject: 'an override',
      warning: {
        details: {
          rule: 'four-data-states',
          until: '2020-01-01',
        },
        kind: WarningKind.OverrideExpired,
      },
    },

    {
      code: WarningCode.Installation,
      subject: 'what mise installs',
      warning: {
        details: {
          where: 'packs/gone',
        },
        kind: WarningKind.PackNotInstalled,
      },
    },
    {
      code: WarningCode.Configurations,
      subject: "the tools' configurations",
      warning: {
        details: {
          reason: 'EACCES: permission denied',
        },
        kind: WarningKind.ConfigurationsUnchecked,
      },
    },
    {
      code: WarningCode.Packs,
      subject: "a file of one of the project's packs",
      warning: {
        details: {
          file: 'packs/acme/blocks/domains/ui/ui.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FileUnreadable,
      },
    },
    {
      code: WarningCode.Constitution,
      subject: "a file of the Constitution's release",
      warning: {
        details: {
          file: '.droneey/constitution/blocks/domains/ui/ui.md',
          source: SourceKind.Release,
        },
        kind: WarningKind.FileUnreadable,
      },
    },
  ])('should give $code when the warning is about $subject', ({ code, warning }) => {
    // Act
    const given = ProjectWarning.codeOf(warning);

    // Assert
    expect(given).toBe(code);
  });
});
