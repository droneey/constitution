import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { BlockId, PackPath, RuleSlug, SourceKind, UnitPath } from '#/kernel/value-objects';

import { warningTextOf } from '../warning-text.utils';

describe('warningTextOf', () => {
  it.each<{
    text: string;
    warning: ProjectWarning;
  }>([
    {
      text: 'apps/web is a member of the workspace with no constitution.yaml — write one that lists the blocks it follows',
      warning: {
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberWithoutConfig,
      },
    },
    {
      text: 'apps/web/constitution.yaml does not parse at line 3 — fix it, as its blocks are left out',
      warning: {
        details: {
          line: 3,
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberConfigUnparsed,
      },
    },
    {
      text: 'apps/web/constitution.yaml does not parse — fix it, as its blocks are left out',
      warning: {
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberConfigUnparsed,
      },
    },
    {
      text: 'cannot read apps/web/constitution.yaml — make it readable, as its blocks are left out',
      warning: {
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberConfigUnreadable,
      },
    },
    {
      text: 'constitution.yaml has no axes key — add axes: [architecture, workflow]',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'axes',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: 'constitution.yaml has no overrides key — add overrides: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'overrides',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: 'constitution.yaml has no packs key — add packs: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'packs',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: 'constitution.yaml has no domains key — add domains: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'domains',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: "apps/web/constitution.yaml lists packages — write each package's blocks in a constitution.yaml of its own, and remove the key",
      warning: {
        details: {
          file: 'apps/web/constitution.yaml',
          key: 'packages',
        },
        kind: WarningKind.KeyUnknown,
      },
    },
    {
      text: 'constitution.yaml names a check, which the runner blocks give now — remove it, and run constitution run check',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'check',
        },
        kind: WarningKind.KeyUnknown,
      },
    },
    {
      text: 'constitution.yaml has the unknown key apps — remove it',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'apps',
        },
        kind: WarningKind.KeyUnknown,
      },
    },
    {
      text: 'constitution.yaml leaves axes empty — write axes: [architecture, workflow], or axes: [] for neither',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'axes',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml leaves overrides empty — write overrides: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'overrides',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml leaves packs empty — write packs: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'packs',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml leaves domains empty — write domains: []',
      warning: {
        details: {
          file: 'constitution.yaml',
          key: 'domains',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml lists foundation in axes — foundation is always followed, remove it',
      warning: {
        details: {
          file: 'constitution.yaml',
        },
        kind: WarningKind.FoundationListed,
      },
    },
    {
      text: 'axes names delivery — write architecture or workflow',
      warning: {
        details: {
          axis: 'delivery',
        },
        kind: WarningKind.AxisUnknown,
      },
    },
    {
      text: 'the override on line 12 has no level, reason — complete it or remove it',
      warning: {
        details: {
          line: 12,
          missing: [
            'level',
            'reason',
          ],
        },
        kind: WarningKind.OverrideIncomplete,
      },
    },
    {
      text: 'the override of four-data-states sets the level MUST — write SHOULD or MAY',
      warning: {
        details: {
          level: 'MUST',
          rule: 'four-data-states',
        },
        kind: WarningKind.OverrideLevelNotLowered,
      },
    },
    {
      text: 'the override of four-data-states has until soon — write a date as YYYY-MM-DD',
      warning: {
        details: {
          rule: 'four-data-states',
          until: 'soon',
        },
        kind: WarningKind.OverrideUntilMalformed,
      },
    },
    {
      text: 'rules/acme is a path — put the block in a pack listed under packs: and name it by its id',
      warning: {
        details: {
          name: 'rules/acme',
        },
        kind: WarningKind.NameIsPath,
      },
    },
    {
      text: 'eslint is not a block — check the name',
      warning: {
        details: {
          name: 'eslint',
        },
        kind: WarningKind.NameUnknown,
      },
    },
    {
      text: 'core is always active — remove it from domains',
      warning: {
        details: {
          key: 'domains',
        },
        kind: WarningKind.CoreListed,
      },
    },
    {
      text: 'biome is an implementation — move it from domains to implementations',
      warning: {
        details: {
          key: 'domains',
          layer: Layer.Implementation,
          name: 'biome',
          toKey: 'implementations',
        },
        kind: WarningKind.BlockUnderWrongKey,
      },
    },
    {
      text: 'typescript is a language — move it from implementations to languages',
      warning: {
        details: {
          key: 'implementations',
          layer: Layer.Language,
          name: 'typescript',
          toKey: 'languages',
        },
        kind: WarningKind.BlockUnderWrongKey,
      },
    },
    {
      text: '_store cannot be listed — list one of its heirs',
      warning: {
        details: {
          heirs: [],
          name: '_store',
        },
        kind: WarningKind.AbstractListed,
      },
    },
    {
      text: '_store cannot be listed — list redux',
      warning: {
        details: {
          heirs: [
            BlockId.create('redux'),
          ],
          name: '_store',
        },
        kind: WarningKind.AbstractListed,
      },
    },
    {
      text: '_store cannot be listed — list redux or zustand',
      warning: {
        details: {
          heirs: [
            BlockId.create('redux'),
            BlockId.create('zustand'),
          ],
          name: '_store',
        },
        kind: WarningKind.AbstractListed,
      },
    },
    {
      text: '_store cannot be listed — list jotai, redux or zustand',
      warning: {
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
    },
    {
      text: 'acme comes from packs/acme, which apps/web/constitution.yaml does not list — add it to packs',
      warning: {
        details: {
          file: 'apps/web/constitution.yaml',
          name: 'acme',
          pack: PackPath.create('packs/acme'),
        },
        kind: WarningKind.PackUnlisted,
      },
    },
    {
      text: 'packs/acme is not installed — run mise install, or check the path',
      warning: {
        details: {
          where: 'packs/acme',
        },
        kind: WarningKind.PackNotInstalled,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/acme.md cannot be read — its rules are left out',
      warning: {
        details: {
          file: 'packs/acme/blocks/domains/acme/acme.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FileUnreadable,
      },
    },
    {
      text: '.droneey/constitution/blocks/domains/ui/foundation/screens.md repeats the rule four-data-states — the first is used',
      warning: {
        details: {
          file: '.droneey/constitution/blocks/domains/ui/foundation/screens.md',
          rule: RuleSlug.create('four-data-states'),
          source: SourceKind.Release,
        },
        kind: WarningKind.RuleRepeated,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/acme.md has no front matter — the block is read without it',
      warning: {
        details: {
          file: 'packs/acme/blocks/domains/acme/acme.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FrontMatterMissing,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/notes.md is not a block file — move or remove it',
      warning: {
        details: {
          file: 'packs/acme/blocks/domains/acme/notes.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.NotBlockFile,
      },
    },
    {
      text: 'packs/acme/blocks/domains/ui/ui.md repeats the block ui — the one read first is used',
      warning: {
        details: {
          block: BlockId.create('ui'),
          file: 'packs/acme/blocks/domains/ui/ui.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.BlockRepeated,
      },
    },
    {
      text: 'packs/acme/blocks/core/core.md is not inside a block folder of a domain, a context or an implementation',
      warning: {
        details: {
          file: 'packs/acme/blocks/core/core.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.OutsideBlockFolder,
      },
    },
    {
      text: 'packs/acme/blocks/domains/Acme/acme.md is in a block folder whose name is not a kebab-case block id — rename the folder',
      warning: {
        details: {
          file: 'packs/acme/blocks/domains/Acme/acme.md',
          source: SourceKind.Pack,
        },
        kind: WarningKind.FolderMisnamed,
      },
    },
    {
      text: 'acme extends eslint, which is not a block — fix its front matter',
      warning: {
        details: {
          base: 'eslint',
          block: BlockId.create('acme'),
          source: SourceKind.Pack,
        },
        kind: WarningKind.BaseNoBlock,
      },
    },
    {
      text: 'acme extends ui, a concrete block; a block extends only an abstract base — require it instead',
      warning: {
        details: {
          base: 'ui',
          block: BlockId.create('acme'),
          source: SourceKind.Pack,
        },
        kind: WarningKind.BaseConcrete,
      },
    },
    {
      text: 'acme requires webgl, which is not a block — fix its front matter',
      warning: {
        details: {
          block: BlockId.create('acme'),
          required: 'webgl',
          source: SourceKind.Pack,
        },
        kind: WarningKind.RequiredNoBlock,
      },
    },
    {
      text: 'acme-rule → no-rule: no-rule is an unknown rule — check the slug',
      warning: {
        details: {
          rule: RuleSlug.create('acme-rule'),
          source: SourceKind.Pack,
          tightens: RuleSlug.create('no-rule'),
        },
        kind: WarningKind.TightensUnknownRule,
      },
    },
    {
      text: 'tanstack-query needs remote-data — add remote-data to domains',
      warning: {
        details: {
          block: BlockId.create('tanstack-query'),
          key: 'domains',
          required: BlockId.create('remote-data'),
          unit: UnitPath.create(''),
        },
        kind: WarningKind.BlockNeeded,
      },
    },
    {
      text: 'ui in apps/web needs _store — add redux or zustand to implementations',
      warning: {
        details: {
          block: BlockId.create('ui'),
          heirs: [
            BlockId.create('redux'),
            BlockId.create('zustand'),
          ],
          key: 'implementations',
          required: BlockId.create('_store'),
          unit: UnitPath.create('apps/web'),
        },
        kind: WarningKind.BlockNeeded,
      },
    },
    {
      text: 'tailwind does not meet tokens-only — see its Requirements table',
      warning: {
        details: {
          block: BlockId.create('tailwind'),
          requirement: RuleSlug.create('tokens-only'),
          unit: UnitPath.create(''),
        },
        kind: WarningKind.RequirementNotMet,
      },
    },
    {
      text: 'tailwind in apps/web does not meet tokens-only — see its Requirements table',
      warning: {
        details: {
          block: BlockId.create('tailwind'),
          requirement: RuleSlug.create('tokens-only'),
          unit: UnitPath.create('apps/web'),
        },
        kind: WarningKind.RequirementNotMet,
      },
    },
    {
      text: 'no-rule names no rule — check the slug',
      warning: {
        details: {
          rule: 'no-rule',
        },
        kind: WarningKind.OverrideNamesNoRule,
      },
    },
    {
      text: 'four-data-states expired on 2026-01-31 — renew or remove it',
      warning: {
        details: {
          rule: 'four-data-states',
          until: '2026-01-31',
        },
        kind: WarningKind.OverrideExpired,
      },
    },
    {
      text: 'biome.json: lacks formatter.lineWidth, as the presets give them [missing]',
      warning: {
        details: {
          code: 'missing',
          file: 'biome.json',
          says: 'lacks formatter.lineWidth, as the presets give them',
        },
        kind: WarningKind.ConfigurationFinding,
      },
    },
    {
      text: 'cannot check the configurations',
      warning: {
        details: {},
        kind: WarningKind.ConfigurationsUnchecked,
      },
    },
    {
      text: './.droneey/constitution leads back into a folder that holds it — link it to the release outside the unit',
      warning: {
        details: {
          unit: UnitPath.create(''),
        },
        kind: WarningKind.ReleaseLinkLoops,
      },
    },
    {
      text: 'apps/web/.droneey/constitution leads back into a folder that holds it — link it to the release outside the unit',
      warning: {
        details: {
          unit: UnitPath.create('apps/web'),
        },
        kind: WarningKind.ReleaseLinkLoops,
      },
    },
  ])('should say $warning.kind as every report of warnings words it', ({ text, warning }) => {
    // Act
    const said = warningTextOf(warning);

    // Assert
    expect(said).toBe(text);
  });
});
