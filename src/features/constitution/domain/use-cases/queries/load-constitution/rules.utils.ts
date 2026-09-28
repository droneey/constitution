import type { Axis, Finding, Level } from '#/kernel';
import { LEVELS } from '#/kernel';

import type { StatedRule } from '../../../entities';
import type { MarkdownSection } from '../../../utils';
import { sectionsOf } from '../../../utils';

interface Source {
  axis: Axis | undefined;
  block: string;
  file: string;
  text: string;
  with: string | undefined;
}

interface Heading {
  level: Level | undefined;
  parent: string | undefined;
  slug: string;
}

interface Table {
  cells: readonly string[];
  problems: readonly string[];
}

interface SectionRead {
  draft?: Omit<StatedRule, 'axis'>;
  findings: readonly Finding[];
}

interface RulesParsed {
  findings: readonly Finding[];
  rules: readonly StatedRule[];
}

const HEADING = /^## (\S+)(?: → (\S+))?(?: · (\S+))?$/;
const LOOKS_LIKE_RULE = /\b(?:MUST|SHOULD|MAY)\W*$| → /;
const HEADING_FORMS =
  '"## <slug> · <LEVEL>", "## <slug> → <parent>" or "## <slug> → <parent> · <LEVEL>"';
const TABLE_LINE = /^\|/;
const DASHES = /^:?-+:?$/;
const LABEL_LINE = /^\*\*([^*]+):\*\*/;
const EXAMPLE = 'Example';
const HEADER = '| Why | Check | Tags |';
const CELLS = 3;

const headingOf = (text: string): Heading | undefined => {
  const match = HEADING.exec(text);
  const word = match?.[3];
  const level = LEVELS.find((candidate) => candidate === word);

  if (
    match === null ||
    (word !== undefined && level === undefined) ||
    (word === undefined && match[2] === undefined)
  ) {
    return undefined;
  }

  return {
    level,
    parent: match[2],
    // Stryker disable next-line StringLiteral: the pattern always captures the slug
    slug: match[1] ?? '',
  };
};

const cellsOf = (line: string): readonly string[] =>
  line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());

const tablesOf = (lines: readonly string[]): readonly (readonly string[])[] => {
  const tables: string[][] = [];
  let current: string[] | undefined;

  for (const line of lines) {
    if (!TABLE_LINE.test(line)) {
      current = undefined;
      continue;
    }

    if (current === undefined) {
      current = [];
      tables.push(current);
    }

    current.push(line);
  }

  return tables;
};

const tableOf = (lines: readonly string[]): Table => {
  const tables = tablesOf(lines);

  if (tables.length !== 1) {
    return {
      cells: [],
      problems: [
        tables.length === 0
          ? `has no table "${HEADER}"`
          : `has ${tables.length} tables; a rule has one`,
      ],
    };
  }

  // Stryker disable next-line StringLiteral,ArrayDeclaration: the one table has a line, and a missing delimiter fails either way
  const [header = '', delimiter = '', ...rows] = tables[0] ?? [];
  const cells = rows.slice(0, 1).flatMap(cellsOf);
  const isHeader =
    cellsOf(header).join(' | ') === cellsOf(HEADER).join(' | ') &&
    cellsOf(delimiter).every((cell) => DASHES.test(cell));

  return {
    cells,
    problems: [
      ...(isHeader
        ? []
        : [
            `has a table whose header is not "${HEADER}"`,
          ]),
      ...(rows.length === 1
        ? []
        : [
            `has ${rows.length} rows in its table; a rule's table has one`,
          ]),
      ...(rows.length === 0 || cells.length === CELLS
        ? []
        : [
            `has a row of ${cells.length} cells; a rule's table has ${CELLS}`,
          ]),
    ],
  };
};

const labelProblems = (lines: readonly string[]): readonly string[] =>
  lines.flatMap((line) => {
    const name = LABEL_LINE.exec(line)?.[1];

    return name === undefined || name === EXAMPLE
      ? []
      : [
          `has the label "${name}"; a rule states Why, Check and Tags in its table and holds no label but ${EXAMPLE}`,
        ];
  });

const statementOf = (lines: readonly string[]): string => {
  const end = lines.findIndex(
    (line) => TABLE_LINE.test(line) || LABEL_LINE.test(line),
  );

  return (end === -1 ? lines : lines.slice(0, end))
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');
};

const tagsOf = (cell: string): readonly string[] | undefined =>
  cell.startsWith('[') && cell.endsWith(']')
    ? cell
        .slice(1, -1)
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '')
    : undefined;

const readSection = (input: {
  section: MarkdownSection;
  source: Source;
}): SectionRead => {
  const heading = headingOf(input.section.heading);

  if (heading === undefined) {
    return {
      findings: LOOKS_LIKE_RULE.test(input.section.heading)
        ? [
            {
              message: `heading "${input.section.heading}" looks like a rule but is not ${HEADING_FORMS}`,
              path: input.source.file,
            },
          ]
        : [],
    };
  }

  const { lines } = input.section;
  const table = tableOf(lines);
  const [why = '', check = '', cell = '[]'] = table.cells;
  const tags = tagsOf(cell);

  return {
    findings: [
      ...table.problems,
      ...(tags === undefined
        ? [
            `has the Tags "${cell}"; Tags is a list, such as [security, ux] or []`,
          ]
        : []),
      ...labelProblems(lines),
    ].map((problem) => ({
      message: `rule "${heading.slug}" ${problem}`,
      path: input.source.file,
    })),
    draft: {
      block: input.source.block,
      check,
      file: input.source.file,
      ownTags: tags ?? [],
      parent: heading.parent,
      slug: heading.slug,
      statedLevel: heading.level,
      statement: statementOf(lines),
      why,
      with: input.source.with,
    },
  };
};

const parseRules = (source: Source): RulesParsed => {
  const read = sectionsOf(source.text).map((section) =>
    readSection({
      section,
      source,
    }),
  );
  const drafts = read.flatMap((section) =>
    section.draft === undefined
      ? []
      : [
          section.draft,
        ],
  );
  const { axis } = source;

  return {
    findings: [
      ...read.flatMap((section) => section.findings),
      ...(axis === undefined
        ? drafts.map((draft) => ({
            message: `rule "${draft.slug}" sits in the card; a block's rules live in foundation/, architecture/ or workflow/`,
            path: source.file,
          }))
        : []),
    ],
    rules:
      axis === undefined
        ? []
        : drafts.map((draft) => ({
            ...draft,
            axis,
          })),
  };
};

export { parseRules };
