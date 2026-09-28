import type { Axis, Level } from '#/kernel';

enum RuleLabel {
  Why = 'why',
  Check = 'check',
  Tags = 'tags',
  Example = 'example',
  Implements = 'implements',
}

const RULE_LABELS: readonly RuleLabel[] = [
  RuleLabel.Why,
  RuleLabel.Check,
  RuleLabel.Tags,
  RuleLabel.Example,
  RuleLabel.Implements,
];

interface Rule {
  axis: Axis;
  block: string;
  file: string;
  labels: Readonly<Partial<Record<RuleLabel, string>>>;
  level: Level;
  slug: string;
  statement: string;
  with: string | undefined;
}

export type { Rule };
export { RULE_LABELS, RuleLabel };
