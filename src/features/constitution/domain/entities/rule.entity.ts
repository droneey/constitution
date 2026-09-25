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
  level: string;
  slug: string;
  statement: string;
  with: string | null;
}

interface StrayHeading {
  block: string;
  file: string;
  heading: string;
}

export type { Rule, RuleLabel, StrayHeading };
export { RULE_LABELS };
