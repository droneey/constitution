import type { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

interface HotRule {
  readonly firstSentence: string;
  readonly slug: RuleSlug;
}

interface HotReminder {
  readonly path: AbsolutePath;
  readonly rules: readonly HotRule[];
}

const SENTENCE_END = /(?<=[.!?])\s/u;

const firstSentenceOf = (statement: string): string =>
  statement.split(SENTENCE_END)[0] ?? statement;

const HotReminder = {
  firstSentenceOf,
} as const;

export type { HotRule };
export { HotReminder };
