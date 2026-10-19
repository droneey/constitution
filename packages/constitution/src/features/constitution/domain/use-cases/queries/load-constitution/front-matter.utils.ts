import type { Finding, Problem } from '#/kernel/types';

import type { FrontMatterFields, FrontMatterParser } from '../../../contracts';
import type { FieldIssue, FrontMatter } from '../../../entities';
import { splitFrontMatter } from '../../../utils';

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
  IdNotKebabCase = 'id-not-kebab-case',
  NotBlockId = 'entry-not-block-id',
  EntryEmpty = 'entry-empty',
  GlobHoldsWhitespace = 'glob-holds-whitespace',
  EntryRepeated = 'entry-repeated',
}

interface FrontMatterLoaded {
  body: string;
  findings: readonly Finding[];
  frontMatter?: FrontMatter;
}

enum ListField {
  Requires = 'requires',
  Languages = 'languages',
  Dictionary = 'dictionary',
  Governs = 'governs',
}

const FIELDS: readonly string[] = [
  'id',
  'summary',
  'requires',
  'extends',
  'abstract',
  'languages',
  'dictionary',
  'governs',
];
const LIST_FIELDS: readonly ListField[] = [
  ListField.Requires,
  ListField.Languages,
  ListField.Dictionary,
  ListField.Governs,
];
const FIELD_ORDER = FIELDS.join(', ');
const BLOCK_ID = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
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
  line: number | undefined;
  lines: readonly string[];
  reason: string;
}): Problem => {
  if (input.line === undefined) {
    return {
      code: FrontMatterReadCode.NotYaml,
      message: `front matter is not valid YAML: ${input.reason}`,
    };
  }

  const key = keyAt({
    line: input.line,
    lines: input.lines,
  });
  const line = `line ${input.line + OPENING_LINES}`;

  return {
    code: FrontMatterReadCode.NotYaml,
    message: `front matter ${key === undefined ? line : `${line} (${key})`} is not valid YAML: ${input.reason}`,
  };
};

const keyProblems = (keys: readonly string[]): readonly Problem[] => {
  const missing = FIELDS.filter((field) => !keys.includes(field)).map((field) => ({
    code: FrontMatterReadCode.FieldMissing,
    message: `front matter lacks "${field}"; every block declares every field`,
  }));
  const unknown = keys
    .filter((key) => !FIELDS.includes(key))
    .map((key) => ({
      code: FrontMatterReadCode.FieldUnknown,
      message: `front matter has "${key}", which is not a field`,
    }));

  if (missing.length > 0 || unknown.length > 0) {
    return [
      ...missing,
      ...unknown,
    ];
  }

  return keys.join(', ') === FIELD_ORDER
    ? []
    : [
        {
          code: FrontMatterReadCode.OutOfOrder,
          message: `front matter lists its fields out of order; the order is ${FIELD_ORDER}`,
        },
      ];
};

const issueProblem = (issue: FieldIssue): Problem => ({
  code: FrontMatterReadCode.OffSchema,
  message: `front matter: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
});

const summaryProblems = (summary: string): readonly Problem[] => [
  ...(summary.length > SUMMARY_LENGTH
    ? [
        {
          code: FrontMatterReadCode.SummaryTooLong,
          message: `front matter: summary has ${summary.length} characters; it holds at most ${SUMMARY_LENGTH}`,
        },
      ]
    : []),
  ...(ONE_SENTENCE.test(summary)
    ? []
    : [
        {
          code: FrontMatterReadCode.SummaryNotSentence,
          message: 'front matter: summary is one sentence on one line, ending with a full stop',
        },
      ]),
];

const scalarProblems = (fields: FrontMatterFields): readonly Problem[] => [
  ...(BLOCK_ID.test(fields.id)
    ? []
    : [
        {
          code: FrontMatterReadCode.IdNotKebabCase,
          message: `front matter: id "${fields.id}" is not a kebab-case block id`,
        },
      ]),
  ...summaryProblems(fields.summary),
  // Stryker disable next-line ConditionalExpression: "undefined" passes as a block id too
  ...(fields.extends === undefined || BLOCK_ID.test(fields.extends)
    ? []
    : [
        {
          code: FrontMatterReadCode.NotBlockId,
          message: `front matter: extends "${fields.extends}", which is not a block id`,
        },
      ]),
];

const repeatsOf = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((entry, index) => values.indexOf(entry) !== index)),
];

const notBlockIds = (input: { field: ListField; values: readonly string[] }): readonly Problem[] =>
  input.values
    .filter((id) => !BLOCK_ID.test(id))
    .map((id) => ({
      code: FrontMatterReadCode.NotBlockId,
      message: `front matter: ${input.field} "${id}", which is not a block id`,
    }));

const entryProblems = (fields: FrontMatterFields): readonly Problem[] => [
  ...notBlockIds({
    field: ListField.Requires,
    values: fields.requires,
  }),
  ...notBlockIds({
    field: ListField.Languages,
    values: fields.languages,
  }),
  ...[
    ...fields.dictionary,
    ...fields.governs,
  ]
    .filter((entry) => entry.trim() === '')
    .map(() => ({
      code: FrontMatterReadCode.EntryEmpty,
      message: 'front matter: dictionary and governs hold no empty entry',
    })),
  ...fields.governs
    .filter((glob) => WHITESPACE.test(glob))
    .map((glob) => ({
      code: FrontMatterReadCode.GlobHoldsWhitespace,
      message: `front matter: governs lists ${JSON.stringify(glob)}, which holds whitespace; the index separates globs with spaces`,
    })),
  ...LIST_FIELDS.flatMap((field) =>
    repeatsOf(fields[field]).map((repeat) => ({
      code: FrontMatterReadCode.EntryRepeated,
      message: `front matter: ${field} lists "${repeat}" twice`,
    })),
  ),
];

const fieldProblems = (fields: FrontMatterFields): readonly Problem[] => [
  ...scalarProblems(fields),
  ...entryProblems(fields),
];

const readFrontMatter = (input: {
  parser: FrontMatterParser;
  path: string;
  text: string;
}): FrontMatterLoaded => {
  const parts = splitFrontMatter(input.text);
  // A problem met at several entries, such as two empty ones, is reported once.
  const failed = (found: readonly Problem[]): FrontMatterLoaded => ({
    body: parts.body,
    findings: [
      ...new Map(
        found.map((problem) => [
          problem.message,
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
        message: 'has no front matter; a passport opens with it',
      },
    ]);
  }

  const read = input.parser.parse(parts.frontMatter);

  if (read.status === 'not-yaml') {
    return failed([
      yamlProblem({
        line: read.line,
        lines: parts.frontMatter.split('\n'),
        reason: read.reason,
      }),
    ]);
  }

  if (read.status === 'not-a-mapping') {
    return failed([
      {
        code: FrontMatterReadCode.NotMapping,
        message: 'front matter is not a mapping of fields',
      },
    ]);
  }

  const keys = keyProblems(read.keys);

  if (keys.length > 0 || read.fields === undefined) {
    return failed(keys.length > 0 ? keys : read.issues.map(issueProblem));
  }

  const problems = fieldProblems(read.fields);

  return problems.length > 0
    ? failed(problems)
    : {
        body: parts.body,
        findings: [],
        frontMatter: read.fields,
      };
};

export { readFrontMatter };
