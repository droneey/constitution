import type { RequirementAnswer, Rule } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';

import type { Binding } from './binding.entity';
import { Block } from './block.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from './manifest.entity';
import type { PresetFile } from './preset-file.entity';
import type { Agent, Skill } from './skill.entity';

/** Each document is absent when its file is. */
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
  readonly bindings: readonly Binding[];
  readonly blocks: readonly Block[];
  readonly documents: Documents;
  readonly paths: ReadonlySet<string>;
  readonly presets: readonly PresetFile[];
  /** the files of the repository that holds the Constitution, which its README and decision log link to */
  readonly repositoryPaths: ReadonlySet<string>;
  readonly requirementAnswers: readonly RequirementAnswer[];
  readonly rules: readonly Rule[];
  readonly templates: readonly PresetFile[];
}

/** The model of its blocks, a pack's base among them, that a check of its presets reads. */
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
      languages: frontMatter.languages,
      layer,
      requires: frontMatter.requires,
    })),
    roles: BlockModel.rolesIn(
      constitution.blocks.flatMap((block) =>
        Block.filesOf(block).map((file) => ({
          axis: file.axis,
          block: block.id,
          body: file.body,
        })),
      ),
    ),
    rules: constitution.rules.map((rule) => ({
      axis: rule.axis,
      block: rule.block,
      level: rule.level,
      ...(rule.seam === undefined
        ? {}
        : {
            seam: rule.seam,
          }),
      slug: rule.slug,
    })),
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
