import type { Axis, Level } from '#/kernel/constants';
import { LEVELS } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import type { StatedRule } from '../../../entities';
import type { MarkdownSection } from '../../../utils';
import { sectionsOf } from '../../../utils';

enum RuleFormCode {
  HeadingMisshapen = 'rule-heading-misshapen',
  WithoutTable = 'rule-without-table',
  TablesMany = 'rule-with-many-tables',
  HeaderMisshapen = 'rule-table-header-misshapen',
  RowsNotOne = 'rule-table-rows-not-one',
  CellsMiscounted = 'rule-table-cells-miscounted',
  TagsNotList = 'rule-tags-not-a-list',
  HoldsLabel = 'rule-holds-label',
}

interface Source {
  axis: Axis;
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
  problems: readonly Problem[];
}

interface SectionRead {
  draft?: Omit<StatedRule, 'axis'>;
  findings: readonly Finding[];
}

interface RulesParsed {
  findings: readonly Finding[];
  rules: readonly StatedRule[];
}

const HEADING = /^### (\S+)(?: → (\S+))?(?: · (\S+))?$/;
const TITLE = /^# (.+)/;
const CHAPTER = /^## (.+)/;
const LOOKS_LIKE_RULE = /\b(?:MUST|SHOULD|MAY)\W*$| → /;
const TABLE_LINE = /^\|/;
const DASHES = /^:?-+:?$/;
const LABEL_LINE = /^\*\*([^*]+):\*\*/;
const EXAMPLE = 'Example';
const HEADER = '| Why | Tags |';
const CELLS = 2;

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

const tableOf = (input: { lines: readonly string[]; slug: string }): Table => {
  const { slug } = input;
  const tables = tablesOf(input.lines);

  if (tables.length !== 1) {
    return {
      cells: [],
      problems: [
        tables.length === 0
          ? {
              code: RuleFormCode.WithoutTable,
              message: `rule "${slug}" has no table "${HEADER}"`,
            }
          : {
              code: RuleFormCode.TablesMany,
              message: `rule "${slug}" has ${tables.length} tables; a rule has one`,
            },
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
            {
              code: RuleFormCode.HeaderMisshapen,
              message: `rule "${slug}" has a table whose header is not "${HEADER}"`,
            },
          ]),
      ...(rows.length === 1
        ? []
        : [
            {
              code: RuleFormCode.RowsNotOne,
              message: `rule "${slug}" has ${rows.length} rows in its table; a rule's table has one`,
            },
          ]),
      ...(rows.length === 0 || cells.length === CELLS
        ? []
        : [
            {
              code: RuleFormCode.CellsMiscounted,
              message: `rule "${slug}" has a row of ${cells.length} cells; a rule's table has ${CELLS}`,
            },
          ]),
    ],
  };
};

const labelProblems = (input: { lines: readonly string[]; slug: string }): readonly Problem[] =>
  input.lines.flatMap((line) => {
    const name = LABEL_LINE.exec(line)?.[1];

    return name === undefined || name === EXAMPLE
      ? []
      : [
          {
            code: RuleFormCode.HoldsLabel,
            message: `rule "${input.slug}" has the label "${name}"; a rule states Why and Tags in its table and holds no label but ${EXAMPLE}`,
          },
        ];
  });

const statementOf = (lines: readonly string[]): string => {
  const end = lines.findIndex((line) => TABLE_LINE.test(line) || LABEL_LINE.test(line));

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
  chapter: string | undefined;
  section: MarkdownSection;
  source: Source;
  title: string | undefined;
}): SectionRead => {
  const heading = headingOf(input.section.heading);

  if (heading === undefined) {
    return {
      findings: LOOKS_LIKE_RULE.test(input.section.heading)
        ? [
            {
              code: RuleFormCode.HeadingMisshapen,
              message: `heading "${input.section.heading}" looks like a rule but is not "### <slug> · <LEVEL>", "### <slug> → <parent>" or "### <slug> → <parent> · <LEVEL>"`,
              path: input.source.file,
            },
          ]
        : [],
    };
  }

  const { lines } = input.section;
  const { slug } = heading;
  const table = tableOf({
    lines,
    slug,
  });
  const [why = '', cell = '[]'] = table.cells;
  const tags = tagsOf(cell);

  return {
    findings: [
      ...table.problems,
      ...(tags === undefined
        ? [
            {
              code: RuleFormCode.TagsNotList,
              message: `rule "${slug}" has the Tags "${cell}"; Tags is a list, such as [security, ux] or []`,
            },
          ]
        : []),
      ...labelProblems({
        lines,
        slug,
      }),
    ].map((problem) => ({
      ...problem,
      path: input.source.file,
    })),
    draft: {
      block: input.source.block,
      chapter: input.chapter,
      file: input.source.file,
      ownTags: tags ?? [],
      parent: heading.parent,
      slug,
      statedLevel: heading.level,
      statement: statementOf(lines),
      title: input.title,
      why,
      with: input.source.with,
    },
  };
};

const parseRules = (source: Source): RulesParsed => {
  let title: string | undefined;
  let chapter: string | undefined;
  const read = sectionsOf(source.text).map((section) => {
    title = TITLE.exec(section.heading)?.[1] ?? title;
    chapter = CHAPTER.exec(section.heading)?.[1] ?? chapter;

    return readSection({
      chapter,
      section,
      source,
      title,
    });
  });
  const drafts = read.flatMap((section) =>
    section.draft === undefined
      ? []
      : [
          section.draft,
        ],
  );

  return {
    findings: read.flatMap((section) => section.findings),
    rules: drafts.map((draft) => ({
      ...draft,
      axis: source.axis,
    })),
  };
};

export { parseRules };
