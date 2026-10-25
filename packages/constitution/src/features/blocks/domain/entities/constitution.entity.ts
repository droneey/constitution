import type { RequirementAnswer, Rule } from '#/kernel/entities';

import type { Binding, PresetFile } from './binding.entity';
import type { Block } from './block.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from './manifest.entity';
import type { Agent, Skill } from './skill.entity';

interface Documents {
  readonly agents: readonly Agent[];
  readonly decisions: string | undefined;
  readonly hooks: ManifestRead<HooksManifest> | undefined;
  readonly marketplace: ManifestRead<MarketplaceManifest> | undefined;
  readonly plugin: ManifestRead<PluginManifest> | undefined;
  readonly readme: string | undefined;
  readonly skills: readonly Skill[];
}

interface Constitution {
  readonly bindings: readonly Binding[];
  readonly blocks: readonly Block[];
  readonly documents: Documents;
  readonly paths: ReadonlySet<string>;
  readonly presets: readonly PresetFile[];
  // The files of the repository that holds the Constitution, which its README and decision log link to.
  readonly repositoryPaths: ReadonlySet<string>;
  readonly requirementAnswers: readonly RequirementAnswer[];
  readonly rules: readonly Rule[];
  readonly templates: readonly PresetFile[];
}

enum DocumentPath {
  Decisions = 'DECISIONS.md',
  Hooks = 'hooks/hooks.json',
  Marketplace = '.claude-plugin/marketplace.json',
  Plugin = '.claude-plugin/plugin.json',
  Readme = 'README.md',
}

export type { Constitution, Documents };
export { DocumentPath };
