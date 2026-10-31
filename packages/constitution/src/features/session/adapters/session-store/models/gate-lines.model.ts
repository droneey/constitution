import { z } from 'zod';

import type { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type {
  GateEntry,
  ReviewDebt,
  RuleDebt,
  RuleRead,
  RulesRead,
} from '../../../domain/entities';
import { DebtKind, GateEntryKind } from '../../../domain/entities';
import { AgentId, RefusalKey, RuleHash } from '../../../domain/value-objects';
import { absolutePathModel, ruleSlugModel } from './session-state.model';

enum LineMark {
  Reset = 'reset',
  Cleared = 'cleared',
}

interface MarkLine {
  readonly mark: LineMark;
}

interface SettledLine<TOwed> {
  readonly settled: TOwed;
}

const markLineModel: z.ZodType<MarkLine> = z.strictObject({
  mark: z.enum(LineMark),
});

const ruleReadModel: z.ZodType<RuleRead> = z.strictObject({
  hash: z.string().refine(RuleHash.is).transform(RuleHash.create),
  slug: ruleSlugModel,
});

const debtModel: z.ZodType<RuleDebt> = z.strictObject({
  kind: z.enum(DebtKind),
  path: absolutePathModel,
});

const reviewDebtModel: z.ZodType<ReviewDebt> = z.strictObject({
  agent: z.string().refine(AgentId.is).transform(AgentId.create),
  path: absolutePathModel,
});

const refusalKeyModel = z.string().refine(RefusalKey.is).transform(RefusalKey.create);

const gateEntryModel: z.ZodType<GateEntry> = z.union([
  z.strictObject({
    key: refusalKeyModel,
    kind: z.literal(GateEntryKind.Passed),
  }),
  z.strictObject({
    key: refusalKeyModel,
    kind: z.literal(GateEntryKind.Refused),
  }),
  z.strictObject({
    kind: z.literal(GateEntryKind.Reset),
  }),
  z.strictObject({
    kind: z.literal(GateEntryKind.Told),
  }),
]);

const settledModelOf = <TOwed>(owed: z.ZodType<TOwed>): z.ZodType<SettledLine<TOwed>> =>
  z.strictObject({
    settled: owed,
  });

const parsedOf = <TLine>(model: z.ZodType<TLine>, lines: readonly unknown[]): readonly TLine[] =>
  lines.flatMap((line) => {
    const parsed = model.safeParse(line);

    return parsed.success
      ? [
          parsed.data,
        ]
      : [];
  });

const isMark = (line: unknown, mark: LineMark): boolean => {
  const parsed = markLineModel.safeParse(line);

  return parsed.success && parsed.data.mark === mark;
};

const afterLastMark = (lines: readonly unknown[], mark: LineMark): readonly unknown[] =>
  lines.slice(lines.findLastIndex((line) => isMark(line, mark)) + 1);

const owedOf = <TOwed>(input: {
  keyOf: (owed: TOwed) => string;
  model: z.ZodType<TOwed>;
  lines: readonly unknown[];
}): readonly TOwed[] => {
  const settledModel = settledModelOf(input.model);
  const owed = new Map<string, TOwed>();

  for (const line of input.lines) {
    const settled = settledModel.safeParse(line);

    if (settled.success) {
      owed.delete(input.keyOf(settled.data.settled));
    }

    const added = input.model.safeParse(line);

    if (added.success && !owed.has(input.keyOf(added.data))) {
      owed.set(input.keyOf(added.data), added.data);
    }
  }

  return [
    ...owed.values(),
  ];
};

const debtKeyOf = (debt: RuleDebt): string =>
  JSON.stringify([
    debt.kind,
    debt.path,
  ]);

const reviewDebtKeyOf = (debt: ReviewDebt): string =>
  JSON.stringify([
    debt.agent,
    debt.path,
  ]);

const debtsOfLines = (lines: readonly unknown[]): readonly RuleDebt[] =>
  owedOf({
    keyOf: debtKeyOf,
    model: debtModel,
    lines,
  });

const reviewDebtsOfLines = (lines: readonly unknown[]): readonly ReviewDebt[] =>
  owedOf({
    keyOf: reviewDebtKeyOf,
    model: reviewDebtModel,
    lines,
  });

const entriesOfLines = (lines: readonly unknown[]): readonly GateEntry[] =>
  parsedOf(gateEntryModel, lines);

const pathsOfLines = (lines: readonly unknown[]): readonly AbsolutePath[] => [
  ...new Set(parsedOf(absolutePathModel, lines)),
];

const pathsAfterMarkOf = (lines: readonly unknown[], mark: LineMark): readonly AbsolutePath[] =>
  pathsOfLines(afterLastMark(lines, mark));

const rulesReadOfLines = (lines: readonly unknown[]): RulesRead => {
  const read = new Map<RuleSlug, Set<RuleHash>>();

  for (const rule of parsedOf(ruleReadModel, afterLastMark(lines, LineMark.Reset))) {
    read.set(
      rule.slug,
      new Set([
        ...(read.get(rule.slug) ?? []),
        rule.hash,
      ]),
    );
  }

  return read;
};

const markLineOf = (mark: LineMark): MarkLine => ({
  mark,
});

const settledLineOf = <TOwed>(settled: TOwed): SettledLine<TOwed> => ({
  settled,
});

const ruleReadLineOf = (rule: RuleRead): RuleRead => ({
  hash: rule.hash,
  slug: rule.slug,
});

export {
  debtsOfLines,
  entriesOfLines,
  LineMark,
  markLineOf,
  pathsAfterMarkOf,
  pathsOfLines,
  reviewDebtsOfLines,
  ruleReadLineOf,
  rulesReadOfLines,
  settledLineOf,
};
