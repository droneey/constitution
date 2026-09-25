import type { Block } from './block.entity';
import type { RequirementAnswer } from './requirement-answer.entity';
import type { Rule, StrayHeading } from './rule.entity';

interface PluginDocuments {
  hooks: string | undefined;
  marketplace: string | undefined;
  plugin: string | undefined;
  readme: string | undefined;
}

interface Constitution {
  blocks: readonly Block[];
  documents: PluginDocuments;
  paths: ReadonlySet<string>;
  requirementAnswers: readonly RequirementAnswer[];
  rules: readonly Rule[];
  strayHeadings: readonly StrayHeading[];
}

export type { Constitution, PluginDocuments };
