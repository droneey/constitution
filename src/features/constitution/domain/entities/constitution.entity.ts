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
}

interface Constitution {
  blocks: readonly Block[];
  documents: Documents;
  paths: ReadonlySet<string>;
  requirementAnswers: readonly RequirementAnswer[];
  rules: readonly Rule[];
}

export type { Constitution, Documents };
