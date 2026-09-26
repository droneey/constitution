import type { Level } from '#/kernel';

const RULE_LABELS = [
  'why',
  'check',
  'tags',
  'example',
  'implements',
] as const;

type RuleLabel = (typeof RULE_LABELS)[number];

interface Rule {
  block: string;
  file: string;
  labels: Readonly<Partial<Record<RuleLabel, string>>>;
  level: Level;
  slug: string;
  statement: string;
  with: string | undefined;
}

export type { Rule, RuleLabel };
export { RULE_LABELS };
