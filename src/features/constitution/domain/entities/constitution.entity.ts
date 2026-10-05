import type { Binding, PresetFile } from './binding.entity';
import type { Block } from './block.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from './manifest.entity';
import type { RequirementAnswer } from './requirement-answer.entity';
import type { Rule } from './rule.entity';
import type { Agent, Skill } from './skill.entity';
import type { VocabularyRead } from './vocabulary.entity';

interface Documents {
  readonly agents: readonly Agent[];
  readonly decisions: string | undefined;
  readonly digests: {
    readonly core: string | undefined;
    readonly index: string | undefined;
  };
  readonly hooks: ManifestRead<HooksManifest> | undefined;
  readonly marketplace: ManifestRead<MarketplaceManifest> | undefined;
  readonly plugin: ManifestRead<PluginManifest> | undefined;
  readonly readme: string | undefined;
  readonly skills: readonly Skill[];
  readonly vocabulary: VocabularyRead | undefined;
}

interface Constitution {
  readonly bindings: readonly Binding[];
  readonly blocks: readonly Block[];
  readonly documents: Documents;
  readonly paths: ReadonlySet<string>;
  readonly presets: readonly PresetFile[];
  readonly requirementAnswers: readonly RequirementAnswer[];
  readonly rules: readonly Rule[];
  // the files a project copies from templates/project/<block>/
  readonly templates: readonly PresetFile[];
}

export type { Constitution, Documents };
