import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';
import { ConfigKey, Layer } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { BlockId, PackPath, RuleSlug, SourceKind, UnitPath } from '#/kernel/value-objects';

import { warningTextOf } from '../warning-text.utils';

const warnings: readonly ProjectWarning[] = [
  {
    details: {
      member: UnitPath.create('apps/web'),
    },
    kind: WarningKind.MemberWithoutConfig,
  },
  {
    details: {
      lines: [
        3,
      ],
      member: UnitPath.create('apps/web'),
    },
    kind: WarningKind.MemberConfigUnparsed,
  },
  {
    details: {
      lines: [
        3,
        7,
      ],
      member: UnitPath.create('apps/web'),
    },
    kind: WarningKind.MemberConfigUnparsed,
  },
  {
    details: {
      member: UnitPath.create('apps/web'),
    },
    kind: WarningKind.MemberConfigUnreadable,
  },
  {
    details: {
      file: 'constitution.yaml',
      key: ConfigKey.Axes,
    },
    kind: WarningKind.KeyMissing,
  },
  {
    details: {
      file: 'apps/web/constitution.yaml',
      key: 'packages',
    },
    kind: WarningKind.KeyUnknown,
  },
  {
    details: {
      file: 'constitution.yaml',
      key: 'check',
    },
    kind: WarningKind.KeyUnknown,
  },
  {
    details: {
      file: 'constitution.yaml',
      key: 'apps',
    },
    kind: WarningKind.KeyUnknown,
  },
  {
    details: {
      file: 'constitution.yaml',
      key: ConfigKey.Axes,
    },
    kind: WarningKind.KeyEmpty,
  },
  {
    details: {
      file: 'constitution.yaml',
    },
    kind: WarningKind.FoundationListed,
  },
  {
    details: {
      axis: 'delivery',
    },
    kind: WarningKind.AxisUnknown,
  },
  {
    details: {
      line: 12,
      missing: [
        'level',
        'reason',
      ],
    },
    kind: WarningKind.OverrideIncomplete,
  },
  {
    details: {
      level: 'MUST',
      rule: 'four-data-states',
    },
    kind: WarningKind.OverrideLevelNotLowered,
  },
  {
    details: {
      rule: 'four-data-states',
      until: 'soon',
    },
    kind: WarningKind.OverrideUntilMalformed,
  },
  {
    details: {
      name: 'rules/acme',
    },
    kind: WarningKind.NameIsPath,
  },
  {
    details: {
      name: 'eslint',
    },
    kind: WarningKind.NameUnknown,
  },
  {
    details: {
      key: ConfigKey.Domains,
    },
    kind: WarningKind.CoreListed,
  },
  {
    details: {
      key: ConfigKey.Domains,
      layer: Layer.Implementation,
      name: 'biome',
      toKey: ConfigKey.Implementations,
    },
    kind: WarningKind.BlockUnderWrongKey,
  },
  {
    details: {
      key: ConfigKey.Implementations,
      layer: Layer.Language,
      name: 'typescript',
      toKey: ConfigKey.Languages,
    },
    kind: WarningKind.BlockUnderWrongKey,
  },
  {
    details: {
      heirs: [],
      name: '_store',
    },
    kind: WarningKind.AbstractListed,
  },
  {
    details: {
      heirs: [
        BlockId.create('redux'),
      ],
      name: '_store',
    },
    kind: WarningKind.AbstractListed,
  },
  {
    details: {
      heirs: [
        BlockId.create('redux'),
        BlockId.create('zustand'),
      ],
      name: '_store',
    },
    kind: WarningKind.AbstractListed,
  },
  {
    details: {
      heirs: [
        BlockId.create('jotai'),
        BlockId.create('redux'),
        BlockId.create('zustand'),
      ],
      name: '_store',
    },
    kind: WarningKind.AbstractListed,
  },
  {
    details: {
      file: 'apps/web/constitution.yaml',
      name: 'acme',
      pack: PackPath.create('packs/acme'),
    },
    kind: WarningKind.PackUnlisted,
  },
  {
    details: {
      where: 'packs/acme',
    },
    kind: WarningKind.PackNotInstalled,
  },
  {
    details: {
      file: 'packs/acme/blocks/domains/acme/acme.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.FileUnreadable,
  },
  {
    details: {
      file: '.droneey/constitution/blocks/domains/ui/foundation/screens.md',
      rule: RuleSlug.create('four-data-states'),
      source: SourceKind.Release,
    },
    kind: WarningKind.RuleRepeated,
  },
  {
    details: {
      file: 'packs/acme/blocks/domains/acme/acme.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.FrontMatterMissing,
  },
  {
    details: {
      file: 'packs/acme/blocks/domains/acme/notes.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.NotBlockFile,
  },
  {
    details: {
      block: BlockId.create('ui'),
      file: 'packs/acme/blocks/domains/ui/ui.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.BlockRepeated,
  },
  {
    details: {
      file: 'packs/acme/blocks/core/core.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.OutsideBlockFolder,
  },
  {
    details: {
      file: 'packs/acme/blocks/domains/Acme/acme.md',
      source: SourceKind.Pack,
    },
    kind: WarningKind.FolderMisnamed,
  },
  {
    details: {
      base: 'eslint',
      block: BlockId.create('acme'),
      source: SourceKind.Pack,
    },
    kind: WarningKind.BaseNoBlock,
  },
  {
    details: {
      base: 'ui',
      block: BlockId.create('acme'),
      source: SourceKind.Pack,
    },
    kind: WarningKind.BaseConcrete,
  },
  {
    details: {
      block: BlockId.create('acme'),
      required: 'webgl',
      source: SourceKind.Pack,
    },
    kind: WarningKind.RequiredNoBlock,
  },
  {
    details: {
      rule: RuleSlug.create('acme-rule'),
      source: SourceKind.Pack,
      tightens: RuleSlug.create('no-rule'),
    },
    kind: WarningKind.TightensUnknownRule,
  },
  {
    details: {
      block: BlockId.create('tanstack-query'),
      key: ConfigKey.Domains,
      required: BlockId.create('remote-data'),
      unit: UnitPath.create(''),
    },
    kind: WarningKind.BlockNeeded,
  },
  {
    details: {
      block: BlockId.create('ui'),
      heirs: [
        BlockId.create('redux'),
        BlockId.create('zustand'),
      ],
      key: ConfigKey.Implementations,
      required: BlockId.create('_store'),
      unit: UnitPath.create('apps/web'),
    },
    kind: WarningKind.BlockNeeded,
  },
  {
    details: {
      block: BlockId.create('tailwind'),
      requirement: RuleSlug.create('tokens-only'),
      unit: UnitPath.create(''),
    },
    kind: WarningKind.RequirementNotMet,
  },
  {
    details: {
      block: BlockId.create('tailwind'),
      requirement: RuleSlug.create('tokens-only'),
      unit: UnitPath.create('apps/web'),
    },
    kind: WarningKind.RequirementNotMet,
  },
  {
    details: {
      rule: 'no-rule',
    },
    kind: WarningKind.OverrideNamesNoRule,
  },
  {
    details: {
      rule: 'four-data-states',
      until: '2026-01-31',
    },
    kind: WarningKind.OverrideExpired,
  },
  {
    details: {
      code: 'missing',
      file: 'biome.json',
      says: 'lacks formatter.lineWidth, as the presets give them',
    },
    kind: WarningKind.ConfigurationFinding,
  },
  {
    details: {
      reason: 'EACCES: permission denied',
    },
    kind: WarningKind.ConfigurationsUnchecked,
  },
  {
    details: {},
    kind: WarningKind.ConfigurationsUnchecked,
  },
  {
    details: {
      unit: UnitPath.create(''),
    },
    kind: WarningKind.ReleaseLinkLoops,
  },
  {
    details: {
      unit: UnitPath.create('apps/web'),
    },
    kind: WarningKind.ReleaseLinkLoops,
  },
  {
    details: {},
    kind: WarningKind.NoRepository,
  },
];

const goldenText = (): string => warnings.map((warning) => `${warningTextOf(warning)}\n`).join('');

describe('warningTextOf', () => {
  it('should word each warning as the golden file shows, one to a line', async () => {
    // Act
    const said = goldenText();

    // Assert
    expect(said).toBe(
      await goldenFileText(new URL('warning-text.golden.txt', import.meta.url), said),
    );
  });
});
