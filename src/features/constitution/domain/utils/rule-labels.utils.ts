import type { Rule } from '../entities';

type RuleCheck =
  | {
      kind: 'test';
    }
  | {
      kind: 'review';
    }
  | {
      kind: 'tool';
      role: string;
    }
  | {
      kind: 'unknown';
    };

const CHECK = /^(?:(test|review)|tool — (\S+))$/;

// A check reads "test", "review" or "tool — <role>"; anything else is unknown
// and the rules check reports it.
const checkOf = (rule: Rule): RuleCheck => {
  const match = CHECK.exec(rule.labels.check ?? '');
  const plain = match?.[1];
  const role = match?.[2];

  if (role !== undefined) {
    return {
      kind: 'tool',
      role,
    };
  }

  if (plain === 'test' || plain === 'review') {
    return {
      kind: plain,
    };
  }

  return {
    kind: 'unknown',
  };
};

const tagsOf = (rule: Rule): readonly string[] =>
  (rule.labels.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');

export type { RuleCheck };
export { checkOf, tagsOf };
