import type { RequirementAnswer, Rule } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';

import type { TreePath } from '../value-objects';
import { Block } from './block.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from './manifest.entity';
import type { Agent, Skill } from './skill.entity';

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

const Constitution = {
  modelOf,
} as const;

enum DocumentPath {
  Decisions = 'DECISIONS.md',
  Hooks = 'hooks/hooks.json',
  Marketplace = '.claude-plugin/marketplace.json',
  Plugin = '.claude-plugin/plugin.json',
  Readme = 'README.md',
}

export type { Documents };
export { Constitution, DocumentPath };
