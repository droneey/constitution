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
import type { Skill } from './skill.entity';
import type { VocabularyRead } from './vocabulary.entity';

interface Documents {
  decisions: string | undefined;
  digests: {
    core: string | undefined;
    index: string | undefined;
  };
  hooks: ManifestRead<HooksManifest> | undefined;
  marketplace: ManifestRead<MarketplaceManifest> | undefined;
  plugin: ManifestRead<PluginManifest> | undefined;
  readme: string | undefined;
  skills: readonly Skill[];
  vocabulary: VocabularyRead | undefined;
}

interface Constitution {
  bindings: readonly Binding[];
  blocks: readonly Block[];
  documents: Documents;
  paths: ReadonlySet<string>;
  presets: readonly PresetFile[];
  requirementAnswers: readonly RequirementAnswer[];
  rules: readonly Rule[];
}

export type { Constitution, Documents };
