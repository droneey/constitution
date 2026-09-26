import type { Finding } from '#/kernel';
import { KINDS, ROLES, STATUSES } from '#/kernel';
import { splitFrontMatter } from '#/libs/markdown';

import type { FrontMatterFields, FrontMatterParser } from '../../../contracts';
import type { FieldIssue, FrontMatter } from '../../../entities';

interface FrontMatterLoaded {
  body: string;
  findings: readonly Finding[];
  frontMatter?: FrontMatter;
}

type ListField = 'chapters' | 'requires' | 'checks' | 'owns' | 'governs';

const FIELDS: readonly string[] = [
  'id',
  'kind',
  'summary',
  'chapters',
  'requires',
  'extends',
  'abstract',
  'checks',
  'owns',
  'governs',
  'status',
];
const LIST_FIELDS: readonly ListField[] = [
  'chapters',
  'requires',
  'checks',
  'owns',
  'governs',
];
const FIELD_ORDER = FIELDS.join(', ');
const BLOCK_ID = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHAPTER = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const ONE_SENTENCE = /^[^\n\r\t]+\.$/;
const TOP_LEVEL_KEY = /^([A-Za-z_][\w-]*)\s*:/;
const WHITESPACE = /\s/;
const SUMMARY_LENGTH = 70;
const OPENING_LINES = 1;

const oneOf = <T extends string>(input: {
  value: string;
  values: readonly T[];
}): T | undefined =>
  input.values.find((candidate) => candidate === input.value);

const keyAt = (input: {
  line: number;
  lines: readonly string[];
}): string | undefined =>
  input.lines
    .slice(0, input.line)
    .toReversed()
    .map((text) => TOP_LEVEL_KEY.exec(text)?.[1])
    .find((key) => key !== undefined);

const yamlMessage = (input: {
  line: number | undefined;
  lines: readonly string[];
  reason: string;
}): string => {
  if (input.line === undefined) {
    return `front matter is not valid YAML: ${input.reason}`;
  }

  const key = keyAt({
    line: input.line,
    lines: input.lines,
  });
  const line = `line ${input.line + OPENING_LINES}`;

  return `front matter ${key === undefined ? line : `${line} (${key})`} is not valid YAML: ${input.reason}`;
};

const keyMessages = (keys: readonly string[]): readonly string[] => {
  const missing = FIELDS.filter((field) => !keys.includes(field)).map(
    (field) =>
      `front matter lacks "${field}"; every block declares every field`,
  );
  const unknown = keys
    .filter((key) => !FIELDS.includes(key))
    .map((key) => `front matter has "${key}", which is not a field`);

  if (missing.length > 0 || unknown.length > 0) {
    return [
      ...missing,
      ...unknown,
    ];
  }

  return keys.join(', ') === FIELD_ORDER
    ? []
    : [
        `front matter lists its fields out of order; the order is ${FIELD_ORDER}`,
      ];
};

const issueMessage = (issue: FieldIssue): string =>
  `front matter: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`;

const summaryMessages = (summary: string): readonly string[] => [
  ...(summary.length > SUMMARY_LENGTH
    ? [
        `front matter: summary has ${summary.length} characters; it holds at most ${SUMMARY_LENGTH}`,
      ]
    : []),
  ...(ONE_SENTENCE.test(summary)
    ? []
    : [
        'front matter: summary is one sentence on one line, ending with a full stop',
      ]),
];

const scalarMessages = (fields: FrontMatterFields): readonly string[] => [
  ...(BLOCK_ID.test(fields.id)
    ? []
    : [
        `front matter: id "${fields.id}" is not a kebab-case block id`,
      ]),
  ...(oneOf({
    value: fields.kind,
    values: KINDS,
  }) === undefined
    ? [
        `front matter: kind "${fields.kind}" is not one of ${KINDS.join(', ')}`,
      ]
    : []),
  ...summaryMessages(fields.summary),
  // Stryker disable next-line ConditionalExpression: "undefined" passes as a block id too
  ...(fields.extends === undefined || BLOCK_ID.test(fields.extends)
    ? []
    : [
        `front matter: extends "${fields.extends}", which is not a block id`,
      ]),
  ...(oneOf({
    value: fields.status,
    values: STATUSES,
  }) === undefined
    ? [
        `front matter: status "${fields.status}" is not one of ${STATUSES.join(', ')}`,
      ]
    : []),
];

const repeatsOf = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

const entryMessages = (fields: FrontMatterFields): readonly string[] => [
  ...fields.chapters
    .filter((name) => !CHAPTER.test(name))
    .map(
      (name) =>
        `front matter: chapters lists "${name}", which is not a kebab-case .md file name`,
    ),
  ...(fields.chapters.includes(`${fields.id}.md`)
    ? [
        `front matter: chapters lists the main file ${fields.id}.md; chapters are the files after it`,
      ]
    : []),
  ...fields.requires
    .filter((id) => !BLOCK_ID.test(id))
    .map((id) => `front matter: requires "${id}", which is not a block id`),
  ...fields.checks
    .filter(
      (role) =>
        oneOf({
          value: role,
          values: ROLES,
        }) === undefined,
    )
    .map((role) => `front matter: checks "${role}", which is not a role`),
  ...[
    ...fields.owns,
    ...fields.governs,
  ]
    .filter((entry) => entry.trim() === '')
    .map(() => 'front matter: owns and governs hold no empty entry'),
  ...fields.governs
    .filter((glob) => WHITESPACE.test(glob))
    .map(
      (glob) =>
        `front matter: governs lists ${JSON.stringify(glob)}, which holds whitespace; the index separates globs with spaces`,
    ),
  ...LIST_FIELDS.flatMap((field) =>
    repeatsOf(fields[field]).map(
      (value) => `front matter: ${field} lists "${value}" twice`,
    ),
  ),
];

const typedOf = (fields: FrontMatterFields): FrontMatter | undefined => {
  const kind = oneOf({
    value: fields.kind,
    values: KINDS,
  });
  const status = oneOf({
    value: fields.status,
    values: STATUSES,
  });

  // Stryker disable next-line ConditionalExpression,LogicalOperator: fieldMessages has rejected a bad kind or status
  return kind === undefined || status === undefined
    ? undefined
    : {
        ...fields,
        checks: fields.checks.flatMap((check) =>
          ROLES.filter((role) => role === check),
        ),
        kind,
        status,
      };
};

const fieldMessages = (fields: FrontMatterFields): readonly string[] => [
  ...scalarMessages(fields),
  ...entryMessages(fields),
];

const readFrontMatter = (input: {
  parser: FrontMatterParser;
  path: string;
  text: string;
}): FrontMatterLoaded => {
  const parts = splitFrontMatter(input.text);
  const failed = (messages: readonly string[]): FrontMatterLoaded => ({
    body: parts.body,
    findings: [
      ...new Set(messages),
    ].map((message) => ({
      message,
      path: input.path,
    })),
  });

  if (parts.frontMatter === undefined) {
    return failed([
      'has no front matter; a main file opens with it',
    ]);
  }

  const read = input.parser.parse(parts.frontMatter);

  if (read.status === 'not-yaml') {
    return failed([
      yamlMessage({
        line: read.line,
        lines: parts.frontMatter.split('\n'),
        reason: read.reason,
      }),
    ]);
  }

  if (read.status === 'not-a-mapping') {
    return failed([
      'front matter is not a mapping of fields',
    ]);
  }

  const keys = keyMessages(read.keys);

  if (keys.length > 0 || read.fields === undefined) {
    return failed(keys.length > 0 ? keys : read.issues.map(issueMessage));
  }

  const problems = fieldMessages(read.fields);
  const frontMatter = problems.length === 0 ? typedOf(read.fields) : undefined;

  return frontMatter === undefined
    ? failed(problems)
    : {
        body: parts.body,
        findings: [],
        frontMatter,
      };
};

export { readFrontMatter };
