import type { RequirementAnswer, Rule } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import type { BlockId } from '#/kernel/value-objects';

import type { TreePath } from '../../value-objects';
import type { BlockLoadDetails } from '../block/block.entity';
import { Block } from '../block/block.entity';
import type { PlaceDetails } from '../block-file/block-file.entity';
import type { FrontMatterReadDetails } from '../front-matter/front-matter.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from '../manifest/manifest.entity';
import type { Agent, Skill } from '../skill/skill.entity';

interface Documents {
  readonly agents: readonly Agent[];
  readonly decisions?: string;
  readonly hooks?: ManifestRead<HooksManifest>;
  readonly marketplace?: ManifestRead<MarketplaceManifest>;
  readonly plugin?: ManifestRead<PluginManifest>;
  readonly readme?: string;
  readonly skills: readonly Skill[];
}

interface Constitution {
  readonly blocks: readonly Block[];
  readonly documents: Documents;
  readonly paths: ReadonlySet<TreePath>;
  readonly repositoryPaths: ReadonlySet<TreePath>;
  readonly requirementAnswers: readonly RequirementAnswer[];
  readonly rules: readonly Rule[];
}

const modelOf = (constitution: Constitution): BlockModel =>
  BlockModel.create({
    blocks: constitution.blocks.map(({ frontMatter, id, layer }) => ({
      ...(frontMatter.extends === undefined
        ? {}
        : {
            extends: frontMatter.extends,
          }),
      governs: frontMatter.governs,
      id,
      isAbstract: frontMatter.abstract,
      languages: frontMatter.languages,
      layer,
      requires: frontMatter.requires,
    })),
    roles: BlockModel.rolesIn(
      constitution.blocks.flatMap((block) =>
        Block.filesOf(block).map((file) => ({
          axis: file.axis,
          ...Block.placeOf(block, file),
          body: file.body,
        })),
      ),
    ),
    rules: constitution.rules,
  });

enum LoadCode {
  BaseDoesNotLoad = 'base-does-not-load',
  IdShared = 'block-id-shared',
}

interface LoadDetails {
  readonly [LoadCode.BaseDoesNotLoad]: object;
  readonly [LoadCode.IdShared]: {
    readonly id: BlockId;
    readonly others: readonly string[];
  };
}

type LoadFindingDetails = BlockLoadDetails & FrontMatterReadDetails & LoadDetails & PlaceDetails;

const sharedIdFindings = (blocks: readonly Block[]): readonly FindingOf<LoadDetails>[] =>
  blocks.flatMap((block) => {
    const others = blocks.filter(
      (other) => Block.sameAs(other, block) && other.passport.path !== block.passport.path,
    );

    return others.length === 0
      ? []
      : [
          {
            code: LoadCode.IdShared,
            details: {
              id: block.id,
              others: others.map((other) => other.passport.path),
            },
            path: block.passport.path,
          },
        ];
  });

interface BaseLoaded {
  readonly folder: string;
  readonly loaded: {
    readonly findings: readonly unknown[];
  };
}

const baseFindings = (base: BaseLoaded): readonly FindingOf<LoadDetails>[] =>
  base.loaded.findings.length > 0
    ? [
        {
          code: LoadCode.BaseDoesNotLoad,
          details: {},
          path: base.folder,
        },
      ]
    : [];

const Constitution = {
  baseFindings,
  modelOf,
  sharedIdFindings,
} as const;

enum DocumentPath {
  Decisions = 'DECISIONS.md',
  Hooks = 'hooks/hooks.json',
  Marketplace = '.claude-plugin/marketplace.json',
  Plugin = '.claude-plugin/plugin.json',
  Readme = 'README.md',
}

export type { Documents, LoadFindingDetails };
export { Constitution, DocumentPath, LoadCode };
