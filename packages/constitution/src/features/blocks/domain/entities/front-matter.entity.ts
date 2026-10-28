import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, Glob } from '#/kernel/value-objects';

import { repeatsOf } from '../utils';
import type { FieldIssue } from './document-read.entity';
import { ReadStatus } from './document-read.entity';

/** The fields of a passport's front matter, in the order it lists them. */
enum FrontMatterField {
  Id = 'id',
  Summary = 'summary',
  Requires = 'requires',
  Extends = 'extends',
  Abstract = 'abstract',
  Languages = 'languages',
  Governs = 'governs',
}

interface FrontMatter {
  readonly abstract: boolean;
  readonly extends?: BlockId;
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly languages: readonly BlockId[];
  readonly requires: readonly BlockId[];
  readonly summary: string;
}

/** The fields as the YAML writes them, before any is known to keep its rule. */
interface FrontMatterFields {
  readonly abstract: boolean;
  /** absent when the block extends none */
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly id: string;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
  readonly summary: string;
}

/** What the parser makes of a front matter's YAML. */
type FrontMatterRead =
  | {
      /** where the parser stopped, when it says so: the line of the YAML, counted from 1 */
      readonly at?: {
        /** the top-level field the line belongs to */
        readonly key?: string;
        readonly line: number;
      };
      readonly reason: string;
      readonly status: ReadStatus.NotYaml;
    }
  | {
      readonly status: ReadStatus.NotMapping;
    }
  | {
      readonly fields: FrontMatterFields;
      readonly keys: readonly string[];
      readonly status: ReadStatus.Mapping;
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly keys: readonly string[];
      readonly status: ReadStatus.Mismatched;
    };

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

const LIST_FIELDS = [
  FrontMatterField.Requires,
  FrontMatterField.Languages,
  FrontMatterField.Governs,
] as const;

type ListField = (typeof LIST_FIELDS)[number];

/** A field that names blocks by their ids. */
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

type FrontMatterProblem = ProblemOf<
  FrontMatterReadDetails & Pick<ValueFindingDetails, ValueFailure.BlockId | ValueFailure.Glob>
>;

enum FrontMatterStatus {
  Valid = 'valid',
  Invalid = 'invalid',
}

type FrontMatterParsed =
  | {
      readonly frontMatter: FrontMatter;
      readonly status: FrontMatterStatus.Valid;
    }
  | {
      /** each once, however many entries share it */
      readonly problems: readonly FrontMatterProblem[];
      readonly status: FrontMatterStatus.Invalid;
    };

const fieldOrder: readonly FrontMatterField[] = Object.values(FrontMatterField);
const ONE_SENTENCE = /^[^\n\r\t]+\.$/;
const SUMMARY_LENGTH = 70;
const OPENING_LINES = 1;

// The parser counts the lines of the YAML; the file holds the opening --- above them.
const yamlProblem = (
  read: Extract<
    FrontMatterRead,
    {
      status: ReadStatus.NotYaml;
    }
  >,
): FrontMatterProblem => ({
  code: FrontMatterReadCode.NotYaml,
  details: {
    ...(read.at === undefined
      ? {}
      : {
          at: {
            ...read.at,
            line: read.at.line + OPENING_LINES,
          },
        }),
    reason: read.reason,
  },
});

const keyProblems = (keys: readonly string[]): readonly FrontMatterProblem[] => {
  const missing = fieldOrder
    .filter((field) => !keys.includes(field))
    .map(
      (field): FrontMatterProblem => ({
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field,
        },
      }),
    );
  const unknown = keys
    .filter((key) => !fieldOrder.some((field) => field === key))
    .map(
      (key): FrontMatterProblem => ({
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

const issueProblem = (issue: FieldIssue): FrontMatterProblem => ({
  code: FrontMatterReadCode.OffSchema,
  details: {
    field: issue.field,
    reason: issue.message,
  },
});

const summaryProblems = (summary: string): readonly FrontMatterProblem[] => [
  ...(summary.length > SUMMARY_LENGTH
    ? [
        {
          code: FrontMatterReadCode.SummaryTooLong,
          details: {
            characters: summary.length,
            limit: SUMMARY_LENGTH,
          },
        } satisfies FrontMatterProblem,
      ]
    : []),
  ...(ONE_SENTENCE.test(summary)
    ? []
    : [
        {
          code: FrontMatterReadCode.SummaryNotSentence,
          details: {},
        } satisfies FrontMatterProblem,
      ]),
];

const scalarProblems = (fields: FrontMatterFields): readonly FrontMatterProblem[] => [
  ...(BlockId.is(fields.id)
    ? []
    : [
        {
          code: ValueFailure.BlockId,
          details: {
            site: ValueSite.FrontMatterId,
            written: fields.id,
          },
        } satisfies FrontMatterProblem,
      ]),
  ...summaryProblems(fields.summary),
  ...(fields.extends === undefined || BlockId.is(fields.extends)
    ? []
    : [
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: fields.extends,
            field: FrontMatterField.Extends,
          },
        } satisfies FrontMatterProblem,
      ]),
];

const notBlockIds = (input: {
  field: IdField;
  values: readonly string[];
}): readonly FrontMatterProblem[] =>
  input.values
    .filter((entry) => !BlockId.is(entry))
    .map(
      (entry): FrontMatterProblem => ({
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry,
          field: input.field,
        },
      }),
    );

const entryProblems = (fields: FrontMatterFields): readonly FrontMatterProblem[] => [
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
      (): FrontMatterProblem => ({
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
      }),
    ),
  ...fields.governs
    .filter((glob) => glob !== '' && !Glob.is(glob))
    .map(
      (written): FrontMatterProblem => ({
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written,
        },
      }),
    ),
  ...LIST_FIELDS.flatMap((field) =>
    repeatsOf(fields[field]).map(
      (entry): FrontMatterProblem => ({
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry,
          field,
        },
      }),
    ),
  ),
];

type MappingRead = Extract<
  FrontMatterRead,
  {
    readonly status: ReadStatus.Mapping;
  }
>;

const unreadProblems = (
  read: Exclude<FrontMatterRead, MappingRead>,
): readonly FrontMatterProblem[] => {
  if (read.status === ReadStatus.NotYaml) {
    return [
      yamlProblem(read),
    ];
  }

  if (read.status === ReadStatus.NotMapping) {
    return [
      {
        code: FrontMatterReadCode.NotMapping,
        details: {},
      },
    ];
  }

  const keys = keyProblems(read.keys);

  return keys.length > 0 ? keys : read.issues.map(issueProblem);
};

const mappingProblems = (read: MappingRead): readonly FrontMatterProblem[] => {
  const keys = keyProblems(read.keys);

  return keys.length > 0
    ? keys
    : [
        ...scalarProblems(read.fields),
        ...entryProblems(read.fields),
      ];
};

const invalid = (problems: readonly FrontMatterProblem[]): FrontMatterParsed => ({
  problems: [
    ...new Map(
      problems.map((problem) => [
        JSON.stringify(problem),
        problem,
      ]),
    ).values(),
  ],
  status: FrontMatterStatus.Invalid,
});

// The fields once they break no rule, so each id they name is a block id.
const frontMatterOf = (fields: FrontMatterFields): FrontMatter => ({
  abstract: fields.abstract,
  ...(fields.extends === undefined
    ? {}
    : {
        extends: BlockId.create(fields.extends),
      }),
  governs: fields.governs.map(Glob.create),
  id: BlockId.create(fields.id),
  languages: fields.languages.map(BlockId.create),
  requires: fields.requires.map(BlockId.create),
  summary: fields.summary,
});

/**
 * The front matter a passport's YAML holds, or every rule of its fields it breaks: it is valid only
 * when its keys are the fields in their order and each field keeps its rule.
 */
const parse = (read: FrontMatterRead): FrontMatterParsed => {
  if (read.status !== ReadStatus.Mapping) {
    return invalid(unreadProblems(read));
  }

  const problems = mappingProblems(read);

  return problems.length === 0
    ? {
        frontMatter: frontMatterOf(read.fields),
        status: FrontMatterStatus.Valid,
      }
    : invalid(problems);
};

const FrontMatter = {
  parse,
} as const;

export type { FrontMatterFields, FrontMatterProblem, FrontMatterRead, FrontMatterReadDetails };
export { FrontMatter, FrontMatterField, FrontMatterReadCode, FrontMatterStatus };
