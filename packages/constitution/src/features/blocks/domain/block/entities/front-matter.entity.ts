import { BlockFormat } from '#/kernel/constants';
import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { ProblemOf } from '#/kernel/types';
import { BlockId, Glob } from '#/kernel/value-objects';

import type { FieldIssue } from '../../shared/entities';
import { ReadStatus } from '../../shared/entities';
import { repeatsOf } from '../../shared/utils';

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

interface FrontMatterFields {
  readonly abstract: boolean;
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly id: string;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
  readonly summary: string;
}

type FrontMatterRead =
  | {
      readonly at?: {
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
  FieldRetired = 'front-matter-field-retired',
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

type IdField = FrontMatterField.Requires | FrontMatterField.Languages | FrontMatterField.Extends;

interface FrontMatterReadDetails {
  readonly [FrontMatterReadCode.Missing]: object;
  readonly [FrontMatterReadCode.NotYaml]: {
    readonly at?: {
      readonly key?: string;
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
  readonly [FrontMatterReadCode.FieldRetired]: {
    readonly field: RetiredField;
  };
  readonly [FrontMatterReadCode.OutOfOrder]: {
    readonly order: readonly FrontMatterField[];
  };
  readonly [FrontMatterReadCode.OffSchema]: {
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
      readonly problems: readonly FrontMatterProblem[];
      readonly status: FrontMatterStatus.Invalid;
    };

type RetiredField = FrontMatterField.Extends | FrontMatterField.Abstract;

const retiredFields: readonly RetiredField[] = [
  FrontMatterField.Extends,
  FrontMatterField.Abstract,
];
const retiredNames: readonly string[] = retiredFields;

const FIELD_ORDER = {
  [BlockFormat.Legacy]: Object.values(FrontMatterField),
  [BlockFormat.Nested]: Object.values(FrontMatterField).filter(
    (field) => !retiredNames.includes(field),
  ),
} as const satisfies Readonly<Record<BlockFormat, readonly FrontMatterField[]>>;
const ONE_SENTENCE = /^[^\n\r\t]+\.$/;
const SUMMARY_LENGTH = 70;
const OPENING_LINES = 1;

// Why: the parser counts the lines of the YAML; the file holds the opening --- above them.
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

const retiredProblems = (input: {
  format: BlockFormat;
  keys: readonly string[];
}): readonly FrontMatterProblem[] =>
  input.format === BlockFormat.Nested
    ? retiredFields
        .filter((field) => input.keys.includes(field))
        .map(
          (field): FrontMatterProblem => ({
            code: FrontMatterReadCode.FieldRetired,
            details: {
              field,
            },
          }),
        )
    : [];

const keyProblems = (input: {
  format: BlockFormat;
  keys: readonly string[];
}): readonly FrontMatterProblem[] => {
  const { keys } = input;
  const fieldOrder = FIELD_ORDER[input.format];
  const retired = retiredProblems(input);
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
    .filter((key) => !(fieldOrder.some((field) => field === key) || retiredNames.includes(key)))
    .map(
      (key): FrontMatterProblem => ({
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key,
        },
      }),
    );

  if (missing.length > 0 || unknown.length > 0 || retired.length > 0) {
    return [
      ...missing,
      ...unknown,
      ...retired,
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
  format: BlockFormat,
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

  const keys = keyProblems({
    format,
    keys: read.keys,
  });

  return keys.length > 0 ? keys : read.issues.map(issueProblem);
};

const mappingProblems = (read: MappingRead, format: BlockFormat): readonly FrontMatterProblem[] => {
  const keys = keyProblems({
    format,
    keys: read.keys,
  });

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

const parse = (read: FrontMatterRead, format: BlockFormat): FrontMatterParsed => {
  if (read.status !== ReadStatus.Mapping) {
    return invalid(unreadProblems(read, format));
  }

  const problems = mappingProblems(read, format);

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
