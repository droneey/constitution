import type { StatedRule } from '../entities';

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

const CHECK = /^(?:(test|review)|tool\/(\S+))$/;

const checkOf = (rule: StatedRule): RuleCheck => {
  const match = CHECK.exec(rule.check);
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

export type { RuleCheck };
export { checkOf };
