import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningCode, WarningKind, WiringProblemKind } from '#/kernel/entities';
import { BlockId, PackPath, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { warningTextOf } from '../warning-text.utils';

describe('warningTextOf', () => {
  it.each<{
    text: string;
    warning: ProjectWarning;
  }>([
    {
      text: 'apps/web is a member of the workspace with no constitution.yaml — write one that lists the blocks it follows',
      warning: {
        code: WarningCode.Config,
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberWithoutConfig,
      },
    },
    {
      text: 'apps/web/constitution.yaml does not parse at line 3 — fix it, as its blocks are left out',
      warning: {
        code: WarningCode.Config,
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
        code: WarningCode.Config,
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberConfigUnparsed,
      },
    },
    {
      text: 'cannot read apps/web/constitution.yaml — make it readable, as its blocks are left out',
      warning: {
        code: WarningCode.Config,
        details: {
          member: UnitPath.create('apps/web'),
        },
        kind: WarningKind.MemberConfigUnreadable,
      },
    },
    {
      text: 'constitution.yaml has no axes key — add axes: [architecture, workflow]',
      warning: {
        code: WarningCode.Config,
        details: {
          file: 'constitution.yaml',
          key: 'axes',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: 'constitution.yaml has no check key — add check: <the command that runs every check, or null>',
      warning: {
        code: WarningCode.Config,
        details: {
          file: 'constitution.yaml',
          key: 'check',
        },
        kind: WarningKind.KeyMissing,
      },
    },
    {
      text: 'constitution.yaml has no overrides key — add overrides: []',
      warning: {
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Config,
        details: {
          file: 'apps/web/constitution.yaml',
          key: 'packages',
        },
        kind: WarningKind.KeyUnknown,
      },
    },
    {
      text: "apps/web/constitution.yaml names a check, which only the repository's constitution.yaml names — remove it",
      warning: {
        code: WarningCode.Config,
        details: {
          file: 'apps/web/constitution.yaml',
          key: 'check',
        },
        kind: WarningKind.KeyUnknown,
      },
    },
    {
      text: 'constitution.yaml has the unknown key apps — remove it',
      warning: {
        code: WarningCode.Config,
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
        code: WarningCode.Config,
        details: {
          file: 'constitution.yaml',
          key: 'axes',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml leaves check empty — name the command that runs every check, or write check: null',
      warning: {
        code: WarningCode.Config,
        details: {
          file: 'constitution.yaml',
          key: 'check',
        },
        kind: WarningKind.KeyEmpty,
      },
    },
    {
      text: 'constitution.yaml leaves overrides empty — write overrides: []',
      warning: {
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Config,
        details: {
          file: 'constitution.yaml',
        },
        kind: WarningKind.FoundationListed,
      },
    },
    {
      text: 'axes names delivery — write architecture or workflow',
      warning: {
        code: WarningCode.Config,
        details: {
          axis: 'delivery',
        },
        kind: WarningKind.AxisUnknown,
      },
    },
    {
      text: 'the override on line 12 has no level, reason — complete it or remove it',
      warning: {
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Config,
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
        code: WarningCode.Unknown,
        details: {
          name: 'rules/acme',
        },
        kind: WarningKind.NameIsPath,
      },
    },
    {
      text: 'eslint is not a block — check the name',
      warning: {
        code: WarningCode.Unknown,
        details: {
          name: 'eslint',
        },
        kind: WarningKind.NameUnknown,
      },
    },
    {
      text: 'core is always active — remove it from domains',
      warning: {
        code: WarningCode.WrongKey,
        details: {
          key: 'domains',
        },
        kind: WarningKind.CoreListed,
      },
    },
    {
      text: 'biome is an implementation — move it from domains to implementations',
      warning: {
        code: WarningCode.WrongKey,
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
        code: WarningCode.WrongKey,
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
        code: WarningCode.Abstract,
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
        code: WarningCode.Abstract,
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
        code: WarningCode.Abstract,
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
        code: WarningCode.Abstract,
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
        code: WarningCode.Pack,
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
        code: WarningCode.Pack,
        details: {
          where: 'packs/acme',
        },
        kind: WarningKind.PackNotInstalled,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/acme.md cannot be read — its rules are left out',
      warning: {
        code: WarningCode.Pack,
        details: {
          file: 'packs/acme/blocks/domains/acme/acme.md',
        },
        kind: WarningKind.FileUnreadable,
      },
    },
    {
      text: '.droneey/constitution/blocks/domains/ui/foundation/screens.md repeats the rule four-data-states — the first is used',
      warning: {
        code: WarningCode.Constitution,
        details: {
          file: '.droneey/constitution/blocks/domains/ui/foundation/screens.md',
          rule: RuleSlug.create('four-data-states'),
        },
        kind: WarningKind.RuleRepeated,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/acme.md has no front matter — the block is read without it',
      warning: {
        code: WarningCode.Pack,
        details: {
          file: 'packs/acme/blocks/domains/acme/acme.md',
        },
        kind: WarningKind.FrontMatterMissing,
      },
    },
    {
      text: 'packs/acme/blocks/domains/acme/notes.md is not a block file — move or remove it',
      warning: {
        code: WarningCode.Pack,
        details: {
          file: 'packs/acme/blocks/domains/acme/notes.md',
        },
        kind: WarningKind.NotBlockFile,
      },
    },
    {
      text: 'packs/acme/blocks/domains/ui/ui.md repeats the block ui — the one read first is used',
      warning: {
        code: WarningCode.Pack,
        details: {
          block: BlockId.create('ui'),
          file: 'packs/acme/blocks/domains/ui/ui.md',
        },
        kind: WarningKind.BlockRepeated,
      },
    },
    {
      text: 'packs/acme/blocks/core/core.md is not inside a block folder of a domain, a context or an implementation',
      warning: {
        code: WarningCode.Pack,
        details: {
          file: 'packs/acme/blocks/core/core.md',
        },
        kind: WarningKind.OutsideBlockFolder,
      },
    },
    {
      text: 'packs/acme/blocks/domains/Acme/acme.md is in a block folder whose name is not a kebab-case block id — rename the folder',
      warning: {
        code: WarningCode.Pack,
        details: {
          file: 'packs/acme/blocks/domains/Acme/acme.md',
        },
        kind: WarningKind.FolderMisnamed,
      },
    },
    {
      text: 'acme extends eslint, which is not a block — fix its front matter',
      warning: {
        code: WarningCode.Pack,
        details: {
          base: 'eslint',
          block: BlockId.create('acme'),
        },
        kind: WarningKind.BaseNoBlock,
      },
    },
    {
      text: 'acme extends ui, a concrete block; a block extends only an abstract base — require it instead',
      warning: {
        code: WarningCode.Pack,
        details: {
          base: 'ui',
          block: BlockId.create('acme'),
        },
        kind: WarningKind.BaseConcrete,
      },
    },
    {
      text: 'acme requires webgl, which is not a block — fix its front matter',
      warning: {
        code: WarningCode.Pack,
        details: {
          block: BlockId.create('acme'),
          required: 'webgl',
        },
        kind: WarningKind.RequiredNoBlock,
      },
    },
    {
      text: 'acme-rule → no-rule: no-rule is an unknown rule — check the slug',
      warning: {
        code: WarningCode.Pack,
        details: {
          rule: RuleSlug.create('acme-rule'),
          tightens: RuleSlug.create('no-rule'),
        },
        kind: WarningKind.TightensUnknownRule,
      },
    },
    {
      text: 'tanstack-query needs remote-data — add remote-data to domains',
      warning: {
        code: WarningCode.Missing,
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
        code: WarningCode.Missing,
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
        code: WarningCode.NotMet,
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
        code: WarningCode.NotMet,
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
        code: WarningCode.Override,
        details: {
          rule: 'no-rule',
        },
        kind: WarningKind.OverrideNamesNoRule,
      },
    },
    {
      text: 'four-data-states expired on 2026-01-31 — renew or remove it',
      warning: {
        code: WarningCode.Override,
        details: {
          rule: 'four-data-states',
          until: '2026-01-31',
        },
        kind: WarningKind.OverrideExpired,
      },
    },
    {
      text: 'apps/web keeps its own biome.json — declare the folder a member, with a constitution.yaml of its own',
      warning: {
        code: WarningCode.Unlisted,
        details: {
          folder: 'apps/web',
          path: 'biome.json',
        },
        kind: WarningKind.FolderKeepsConfig,
      },
    },
    {
      text: 'biome is wired nowhere for . — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          tool: 'biome',
          unit: UnitPath.create(''),
        },
        kind: WarningKind.ToolWiredNowhere,
      },
    },
    {
      text: 'biome is wired nowhere for apps/web — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          tool: 'biome',
          unit: UnitPath.create('apps/web'),
        },
        kind: WarningKind.ToolWiredNowhere,
      },
    },
    {
      text: 'biome.json lacks typescript/foundation/core; names a/foundation/one, a/foundation/two, a/foundation/three and 2 more, which it does not take — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/core',
              ],
            },
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'a/foundation/one',
                'a/foundation/two',
                'a/foundation/three',
                'a/foundation/four',
                'a/foundation/five',
              ],
            },
          ],
        },
        kind: WarningKind.FileMiswired,
      },
    },
    {
      text: 'pyproject.toml lacks a/foundation/one, a/foundation/two, a/foundation/three — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'a/foundation/one',
                'a/foundation/two',
                'a/foundation/three',
              ],
            },
          ],
        },
        kind: WarningKind.FileMiswired,
      },
    },
    {
      text: "pyproject.toml a marker of ruff says more than its path; its marker of ruff lists the links out of order; it extends a link of ruff short of the chain's end — run /constitution:ratify",
      warning: {
        code: WarningCode.Wiring,
        details: {
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerSaysMore,
              tool: 'ruff',
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
            {
              kind: WiringProblemKind.ExtendsShortOfEnd,
              tool: 'ruff',
            },
          ],
        },
        kind: WarningKind.FileMiswired,
      },
    },
    {
      text: 'pyproject.toml holds a copy of python/foundation/core the release no longer has; copies python/foundation/core, which it does not take; the copy of python/foundation/core has no end line; the copy of python/foundation/core is edited inside — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyOfRemovedPart,
              part: 'python/foundation/core',
            },
            {
              kind: WiringProblemKind.CopyNotTaken,
              part: 'python/foundation/core',
            },
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        },
        kind: WarningKind.FileMiswired,
      },
    },
    {
      text: 'biome.json skips docs, which holds no member of the workspace — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          folder: 'docs',
          path: 'biome.json',
        },
        kind: WarningKind.SkipOfNoMember,
      },
    },
    {
      text: 'biome.json does not skip apps/web, a member of the workspace that biome would reach into from the root — run /constitution:ratify',
      warning: {
        code: WarningCode.Wiring,
        details: {
          member: 'apps/web',
          path: 'biome.json',
          tool: 'biome',
        },
        kind: WarningKind.MemberNotSkipped,
      },
    },
    {
      text: 'cannot check the wiring',
      warning: {
        code: WarningCode.Wiring,
        details: {},
        kind: WarningKind.WiringUnchecked,
      },
    },
    {
      text: './.droneey/constitution leads back into a folder that holds it — link it to the release outside the unit',
      warning: {
        code: WarningCode.Loop,
        details: {
          unit: UnitPath.create(''),
        },
        kind: WarningKind.ReleaseLinkLoops,
      },
    },
    {
      text: 'apps/web/.droneey/constitution leads back into a folder that holds it — link it to the release outside the unit',
      warning: {
        code: WarningCode.Loop,
        details: {
          unit: UnitPath.create('apps/web'),
        },
        kind: WarningKind.ReleaseLinkLoops,
      },
    },
  ])('should say $warning.kind as every report of warnings words it', ({ text, warning }) => {
    // Arrange
    const given = warning;

    // Act
    const said = warningTextOf(given);

    // Assert
    expect(said).toBe(text);
  });
});
