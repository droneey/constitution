import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { splitFrontMatter } from '#/kernel/utils';
import { BlockId, Glob } from '#/kernel/value-objects';

import type { FrontMatterFields, FrontMatterParser } from '../../../../../../../contracts';
import type { FieldIssue } from '../../../../../../../entities';
import { FrontMatter, FrontMatterField, ReadStatus } from '../../../../../../../entities';

enum FrontMatterReadCode {
  Missing = 'front-matter-missing',
  NotYaml = 'front-matter-not-yaml',
  NotMapping = 'front-matter-not-a-mapping',
  FieldMissing = 'front-matter-field-missing',
  FieldUnknown = 'front-matter-field-unknown',
  OutOfOrder = 'front-matter-out-of-order',
  OffSchema = 'front-matter-off-schema',
  SummaryTooLong = 'summary-too-long',
  SummaryNotSentence = 'summary-not-one-sentence',
  NotBlockId = 'entry-not-block-id',
  EntryEmpty = 'entry-empty',
  EntryRepeated = 'entry-repeated',
}

type ListField = FrontMatterField.Requires | FrontMatterField.Languages | FrontMatterField.Governs;

/** a field that names blocks by their ids */
type IdField = FrontMatterField.Requires | FrontMatterField.Languages | FrontMatterField.Extends;

interface FrontMatterReadDetails {
  readonly [FrontMatterReadCode.Missing]: object;
  readonly [FrontMatterReadCode.NotYaml]: {
    /** where the parser stopped, when it says so */
    readonly at?: {
      /** the top-level field the line belongs to */
      readonly key?: string;
      /** the line of the file, counted from 1 */
      readonly line: number;
    };
    readonly reason: string;
  };
  readonly [FrontMatterReadCode.NotMapping]: object;
  readonly [FrontMatterReadCode.FieldMissing]: {
    readonly field: FrontMatterField;
  };
  readonly [FrontMatterReadCode.FieldUnknown]: {
    readonly key: string;
  };
  readonly [FrontMatterReadCode.OutOfOrder]: {
    readonly order: readonly FrontMatterField[];
  };
  readonly [FrontMatterReadCode.OffSchema]: {
    /** the path of the field the schema refuses, empty for the whole front matter */
    readonly field: string;
    readonly reason: string;
  };
  readonly [FrontMatterReadCode.SummaryTooLong]: {
    readonly characters: number;
    readonly limit: number;
  };
  readonly [FrontMatterReadCode.SummaryNotSentence]: object;
  readonly [FrontMatterReadCode.NotBlockId]: {
    readonly entry: string;
    readonly field: IdField;
  };
  readonly [FrontMatterReadCode.EntryEmpty]: object;
  readonly [FrontMatterReadCode.EntryRepeated]: {
    readonly entry: string;
    readonly field: ListField;
  };
}

type FrontMatterReadProblem = ProblemOf<
  FrontMatterReadDetails & Pick<ValueFindingDetails, ValueFailure.BlockId | ValueFailure.Glob>
>;

type FrontMatterReadFinding = FindingOf<
  FrontMatterReadDetails & Pick<ValueFindingDetails, ValueFailure.BlockId | ValueFailure.Glob>
>;

interface FrontMatterLoaded {
  readonly body: string;
  readonly findings: readonly FrontMatterReadFinding[];
  readonly frontMatter?: FrontMatter;
}

const fieldOrder: readonly FrontMatterField[] = Object.values(FrontMatterField);
const LIST_FIELDS: readonly ListField[] = [
  FrontMatterField.Requires,
  FrontMatterField.Languages,
  FrontMatterField.Governs,
] as const;
const ONE_SENTENCE = /^[^\n\r\t]+\.$/;
const TOP_LEVEL_KEY = /^([A-Za-z_][\w-]*)\s*:/;
const WHITESPACE = /\s/;
const SUMMARY_LENGTH = 70;
const OPENING_LINES = 1;

const keyAt = (input: { line: number; lines: readonly string[] }): string | undefined =>
  input.lines
    .slice(0, input.line)
    .toReversed()
    .map((text) => TOP_LEVEL_KEY.exec(text)?.[1])
    .find((key) => key !== undefined);

const yamlProblem = (input: {
  line?: number;
  lines: readonly string[];
  reason: string;
}): FrontMatterReadProblem => {
  if (input.line === undefined) {
    return {
      code: FrontMatterReadCode.NotYaml,
      details: {
        reason: input.reason,
      },
    };
  }

  const key = keyAt({
    line: input.line,
    lines: input.lines,
  });
  const line = input.line + OPENING_LINES;

  return {
    code: FrontMatterReadCode.NotYaml,
    details: {
      at:
        key === undefined
          ? {
              line,
            }
          : {
              key,
              line,
            },
      reason: input.reason,
    },
  };
};

const keyProblems = (keys: readonly string[]): readonly FrontMatterReadProblem[] => {
  const missing = fieldOrder
    .filter((field) => !keys.includes(field))
    .map(
      (field): FrontMatterReadProblem => ({
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field,
        },
      }),
    );
  const unknown = keys
    .filter((key) => !fieldOrder.some((field) => field === key))
    .map(
      (key): FrontMatterReadProblem => ({
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key,
        },
      }),
    );

  if (missing.length > 0 || unknown.length > 0) {
    return [
      ...missing,
      ...unknown,
    ];
  }

  return keys.every((key, index) => key === fieldOrder[index])
    ? []
    : [
        {
          code: FrontMatterReadCode.OutOfOrder,
          details: {
            order: fieldOrder,
          },
        },
      ];
};

const issueProblem = (issue: FieldIssue): FrontMatterReadProblem => ({
  code: FrontMatterReadCode.OffSchema,
  details: {
    field: issue.field,
    reason: issue.message,
  },
});

const summaryProblems = (summary: string): readonly FrontMatterReadProblem[] => [
  ...(summary.length > SUMMARY_LENGTH
    ? [
        {
          code: FrontMatterReadCode.SummaryTooLong,
          details: {
            characters: summary.length,
            limit: SUMMARY_LENGTH,
          },
        } satisfies FrontMatterReadProblem,
      ]
    : []),
  ...(ONE_SENTENCE.test(summary)
    ? []
    : [
        {
          code: FrontMatterReadCode.SummaryNotSentence,
          details: {},
        } satisfies FrontMatterReadProblem,
      ]),
];

const scalarProblems = (fields: FrontMatterFields): readonly FrontMatterReadProblem[] => [
  ...(BlockId.is(fields.id)
    ? []
    : [
        {
          code: ValueFailure.BlockId,
          details: {
            site: ValueSite.FrontMatterId,
            written: fields.id,
          },
        } satisfies FrontMatterReadProblem,
      ]),
  ...summaryProblems(fields.summary),
  // Stryker disable next-line ConditionalExpression: "undefined" passes as a block id too
  ...(fields.extends === undefined || BlockId.is(fields.extends)
    ? []
    : [
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: fields.extends,
            field: FrontMatterField.Extends,
          },
        } satisfies FrontMatterReadProblem,
      ]),
];

const repeatsOf = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((entry, index) => values.indexOf(entry) !== index)),
];

const notBlockIds = (input: {
  field: IdField;
  values: readonly string[];
}): readonly FrontMatterReadProblem[] =>
  input.values
    .filter((entry) => !BlockId.is(entry))
    .map(
      (entry): FrontMatterReadProblem => ({
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry,
          field: input.field,
        },
      }),
    );

const entryProblems = (fields: FrontMatterFields): readonly FrontMatterReadProblem[] => [
  ...notBlockIds({
    field: FrontMatterField.Requires,
    values: fields.requires,
  }),
  ...notBlockIds({
    field: FrontMatterField.Languages,
    values: fields.languages,
  }),
  ...fields.governs
    .filter((glob) => glob.trim() === '')
    .map(
      (): FrontMatterReadProblem => ({
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
      }),
    ),
  ...fields.governs
    .filter((glob) => WHITESPACE.test(glob))
    .map(
      (written): FrontMatterReadProblem => ({
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written,
        },
      }),
    ),
  ...LIST_FIELDS.flatMap((field) =>
    repeatsOf(fields[field]).map(
      (entry): FrontMatterReadProblem => ({
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry,
          field,
        },
      }),
    ),
  ),
];

const fieldProblems = (fields: FrontMatterFields): readonly FrontMatterReadProblem[] => [
  ...scalarProblems(fields),
  ...entryProblems(fields),
];

// The fields once their problems are none, so each id they name is a block id.
const frontMatterOf = (fields: FrontMatterFields): FrontMatter => {
  const base = fields.extends;

  return FrontMatter.create({
    abstract: fields.abstract,
    ...(base === undefined
      ? {}
      : {
          extends: BlockId.create(base),
        }),
    governs: fields.governs.map(Glob.create),
    id: BlockId.create(fields.id),
    languages: fields.languages.map(BlockId.create),
    requires: fields.requires.map(BlockId.create),
    summary: fields.summary,
  });
};

interface ReadFrontMatterInput {
  readonly parser: FrontMatterParser;
  readonly path: string;
  readonly text: string;
}

const readFrontMatter = (input: ReadFrontMatterInput): FrontMatterLoaded => {
  const parts = splitFrontMatter(input.text);

  // A problem met at several entries, such as two empty ones, is reported once.
  const failed = (found: readonly FrontMatterReadProblem[]): FrontMatterLoaded => ({
    body: parts.body,
    findings: [
      ...new Map(
        found.map((problem) => [
          JSON.stringify(problem),
          problem,
        ]),
      ).values(),
    ].map((problem) => ({
      ...problem,
      path: input.path,
    })),
  });

  if (parts.frontMatter === undefined) {
    return failed([
      {
        code: FrontMatterReadCode.Missing,
        details: {},
      },
    ]);
  }

  const read = input.parser.parse(parts.frontMatter);

  if (read.status === ReadStatus.NotYaml) {
    return failed([
      yamlProblem({
        ...read,
        lines: parts.frontMatter.split('\n'),
      }),
    ]);
  }

  if (read.status === ReadStatus.NotMapping) {
    return failed([
      {
        code: FrontMatterReadCode.NotMapping,
        details: {},
      },
    ]);
  }

  const keys = keyProblems(read.keys);

  if (keys.length > 0) {
    return failed(keys);
  }

  if (read.status === ReadStatus.Mismatched) {
    return failed(read.issues.map(issueProblem));
  }

  const problems = fieldProblems(read.fields);

  return problems.length > 0
    ? failed(problems)
    : {
        body: parts.body,
        findings: [],
        frontMatter: frontMatterOf(read.fields),
      };
};

export type { FrontMatterReadDetails, FrontMatterReadFinding };
export { FrontMatterReadCode, readFrontMatter };
