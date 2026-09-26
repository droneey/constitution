import type { Block } from './block.entity';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from './manifest.entity';
import type { RequirementAnswer } from './requirement-answer.entity';
import type { Rule } from './rule.entity';

interface PluginDocuments {
  hooks: ManifestRead<HooksManifest> | undefined;
  marketplace: ManifestRead<MarketplaceManifest> | undefined;
  plugin: ManifestRead<PluginManifest> | undefined;
  readme: string | undefined;
}

interface Constitution {
  blocks: readonly Block[];
  documents: PluginDocuments;
  paths: ReadonlySet<string>;
  requirementAnswers: readonly RequirementAnswer[];
  rules: readonly Rule[];
}

export type { Constitution, PluginDocuments };
