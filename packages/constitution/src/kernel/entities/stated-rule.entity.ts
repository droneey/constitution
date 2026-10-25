import type { Axis } from '../constants';
import { LEVELS, Level } from '../constants';
import { ValueFailure } from '../errors';
import type { Finding, Problem } from '../types';
import type { MarkdownSection } from '../utils';
import { sectionsOf } from '../utils';
import type { BlockId } from '../value-objects';
import { RuleSlug } from '../value-objects';
import type { RulePlace, RuleText } from './rule.entity';
import { Rule } from './rule.entity';

/** A rule as its heading states it: one that tightens another may leave its level to the chain. */
interface StatedRule extends RulePlace, RuleText {
  readonly statedLevel?: Level;
}

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

interface RuleSource {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly file: string;
  readonly seam?: BlockId;
  readonly text: string;
}

interface Heading {
  readonly level?: Level;
  readonly slug: string;
  readonly tightens?: string;
}

interface Table {
  readonly cells: readonly string[];
  readonly problems: readonly Problem[];
}

interface SectionRead {
  readonly findings: readonly Finding[];
  readonly rule?: StatedRule;
}

interface RulesParsed {
  readonly findings: readonly Finding[];
  readonly rules: readonly StatedRule[];
}

const HEADING = /^### (\S+)(?: → (\S+))?(?: · (\S+))?$/;
const TITLE = /^# (.+)/;
const SECTION = /^## (.+)/;
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

  const tightens = match[2];

  return {
    // Stryker disable next-line ConditionalExpression: the rule a heading makes leaves an absent level out
    ...(level === undefined
      ? {}
      : {
          level,
        }),
    // Stryker disable next-line StringLiteral: the pattern always captures the slug
    slug: match[1] ?? '',
    // Stryker disable next-line ConditionalExpression: the rule a heading makes leaves an absent tightened slug out
    ...(tightens === undefined
      ? {}
      : {
          tightens,
        }),
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

const tableOf = (input: { lines: readonly string[]; slug: RuleSlug }): Table => {
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

const labelProblems = (input: { lines: readonly string[]; slug: RuleSlug }): readonly Problem[] =>
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

const lensesOf = (cell: string): readonly string[] | undefined =>
  cell.startsWith('[') && cell.endsWith(']')
    ? cell
        .slice(1, -1)
        .split(',')
        .map((lens) => lens.trim())
        .filter((lens) => lens !== '')
    : undefined;

// A slug a heading names is a kebab-case token; a heading that names another is no rule.
const slugProblemOf = (heading: Heading): Problem | undefined => {
  if (!RuleSlug.is(heading.slug)) {
    return {
      code: ValueFailure.RuleSlug,
      message: `rule "${heading.slug}" is not a kebab-case slug`,
    };
  }

  return heading.tightens === undefined || RuleSlug.is(heading.tightens)
    ? undefined
    : {
        code: ValueFailure.RuleSlug,
        message: `rule "${heading.slug}" tightens "${heading.tightens}", which is not a kebab-case slug`,
      };
};

const placeOf = (input: {
  chapterTitle: string | undefined;
  section: string | undefined;
  source: RuleSource;
}): RulePlace => ({
  axis: input.source.axis,
  block: input.source.block,
  ...(input.chapterTitle === undefined
    ? {}
    : {
        chapterTitle: input.chapterTitle,
      }),
  file: input.source.file,
  ...(input.source.seam === undefined
    ? {}
    : {
        seam: input.source.seam,
      }),
  ...(input.section === undefined
    ? {}
    : {
        section: input.section,
      }),
});

const readSection = (input: {
  chapterTitle: string | undefined;
  markdown: MarkdownSection;
  section: string | undefined;
  source: RuleSource;
}): SectionRead => {
  const heading = headingOf(input.markdown.heading);

  const atFile = (problem: Problem): Finding => ({
    ...problem,
    path: input.source.file,
  });

  if (heading === undefined) {
    return {
      findings: LOOKS_LIKE_RULE.test(input.markdown.heading)
        ? [
            atFile({
              code: RuleFormCode.HeadingMisshapen,
              message: `heading "${input.markdown.heading}" looks like a rule but is not "### <slug> · <LEVEL>", "### <slug> → <parent>" or "### <slug> → <parent> · <LEVEL>"`,
            }),
          ]
        : [],
    };
  }

  const slugProblem = slugProblemOf(heading);

  if (slugProblem !== undefined) {
    return {
      findings: [
        atFile(slugProblem),
      ],
    };
  }

  const { lines } = input.markdown;
  const slug = RuleSlug.create(heading.slug);
  const table = tableOf({
    lines,
    slug,
  });
  const [why = '', cell = '[]'] = table.cells;
  const lenses = lensesOf(cell);

  return {
    findings: [
      ...table.problems,
      ...(lenses === undefined
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
    ].map(atFile),
    rule: {
      ...placeOf(input),
      slug,
      ...(heading.level === undefined
        ? {}
        : {
            statedLevel: heading.level,
          }),
      statement: statementOf(lines),
      ...(heading.tightens === undefined
        ? {}
        : {
            tightens: RuleSlug.create(heading.tightens),
          }),
      why,
      writtenLenses: lenses ?? [],
    },
  };
};

const parse = (source: RuleSource): RulesParsed => {
  let chapterTitle: string | undefined;
  let section: string | undefined;
  const read = sectionsOf(source.text).map((markdown) => {
    chapterTitle = TITLE.exec(markdown.heading)?.[1] ?? chapterTitle;
    section = SECTION.exec(markdown.heading)?.[1] ?? section;

    return readSection({
      chapterTitle,
      markdown,
      section,
      source,
    });
  });

  return {
    findings: read.flatMap((sectionRead) => sectionRead.findings),
    rules: read.flatMap((sectionRead) =>
      sectionRead.rule === undefined
        ? []
        : [
            sectionRead.rule,
          ],
    ),
  };
};

const levelOf = (input: {
  rule: StatedRule;
  rules: ReadonlyMap<RuleSlug, StatedRule>;
  seen: ReadonlySet<RuleSlug>;
}): Level | undefined => {
  const tightened = Rule.tightenedIn(input.rule, input.rules);

  if (
    input.rule.statedLevel !== undefined ||
    tightened === undefined ||
    input.seen.has(tightened.slug)
  ) {
    return input.rule.statedLevel;
  }

  return levelOf({
    rule: tightened,
    rules: input.rules,
    seen: new Set([
      ...input.seen,
      tightened.slug,
    ]),
  });
};

/**
 * The rules at the level each states, or else at the level the chain it tightens gives; a chain
 * that never states one, through a cycle or a slug that names no rule, binds as MUST, and the
 * rules check reports the broken chain.
 */
const inheritLevels = (stated: readonly StatedRule[]): readonly Rule[] => {
  const rules = Rule.bySlug(stated);

  return stated.map((rule) => {
    const { statedLevel, ...written } = rule;

    return Rule.create({
      ...written,
      isLevelStated: statedLevel !== undefined,
      level:
        levelOf({
          rule,
          rules,
          seen: new Set(),
        }) ?? Level.Must,
    });
  });
};

const StatedRule = {
  inheritLevels,
  parse,
} as const;

export type { RuleSource, RulesParsed };
export { RuleFormCode, StatedRule };
