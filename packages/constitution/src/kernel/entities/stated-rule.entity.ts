import type { Axis } from '../constants';
import { Level, RULE_TABLE_CELLS, RULE_TABLE_HEADER } from '../constants';
import { ValueFailure } from '../errors';
import type { FindingOf, ProblemOf } from '../types';
import type { MarkdownSection } from '../utils';
import { cellsOf, isDeepEqual, isTableLine, sectionsOf, tablesOf } from '../utils';
import type { BlockId } from '../value-objects';
import { RuleSlug } from '../value-objects';
import type { RulePlace, RuleText } from './rule.entity';
import { Rule } from './rule.entity';
import { RuleHeading } from './rule-heading.entity';
import type { ValueFindingDetails } from './value-finding.entity';
import { ValueSite } from './value-finding.entity';

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
  HoldsLabel = 'rule-holds-label',
}

interface RuleFormDetails {
  readonly [RuleFormCode.HeadingMisshapen]: {
    readonly heading: string;
  };
  readonly [RuleFormCode.WithoutTable]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.TablesMany]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.HeaderMisshapen]: {
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.RowsNotOne]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.CellsMiscounted]: {
    readonly count: number;
    readonly slug: RuleSlug;
  };
  readonly [RuleFormCode.HoldsLabel]: {
    readonly label: string;
    readonly slug: RuleSlug;
  };
}

type RuleFormProblem = ProblemOf<RuleFormDetails>;

type SlugProblem = ProblemOf<Pick<ValueFindingDetails, ValueFailure.RuleSlug>>;

type RuleFormFinding = FindingOf<
  RuleFormDetails & Pick<ValueFindingDetails, ValueFailure.RuleSlug>
>;

interface RuleSource {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly file: string;
  readonly seam?: BlockId;
  readonly text: string;
}

interface Table {
  readonly cells: readonly string[];
  readonly problems: readonly RuleFormProblem[];
}

interface SectionRead {
  readonly findings: readonly RuleFormFinding[];
  readonly rule?: StatedRule;
}

interface RulesParsed {
  readonly findings: readonly RuleFormFinding[];
  readonly rules: readonly StatedRule[];
}

const RULE_MARK = '### ';
const TITLE = /^# (.+)/;
const SECTION = /^## (.+)/;
const LOOKS_LIKE_RULE = /\b(?:MUST|SHOULD|MAY)\W*$| → /;
const DASHES = /^:?-+:?$/;
const LABEL_LINE = /^\*\*([^*]+):\*\*/;
const EXAMPLE = 'Example';

const headingOf = (text: string): RuleHeading | undefined =>
  text.startsWith(RULE_MARK) ? RuleHeading.of(text.slice(RULE_MARK.length)) : undefined;

const tableOf = (input: { lines: readonly string[]; slug: RuleSlug }): Table => {
  const { slug } = input;
  const tables = tablesOf(input.lines);

  if (tables.length !== 1) {
    const problem: RuleFormProblem =
      tables.length === 0
        ? {
            code: RuleFormCode.WithoutTable,
            details: {
              slug,
            },
          }
        : {
            code: RuleFormCode.TablesMany,
            details: {
              count: tables.length,
              slug,
            },
          };

    return {
      cells: [],
      problems: [
        problem,
      ],
    };
  }

  // Stryker disable next-line StringLiteral,ArrayDeclaration: the one table has a line, and a missing delimiter fails either way
  const [header = '', delimiter = '', ...rows] = tables[0] ?? [];
  const cells = rows.slice(0, 1).flatMap(cellsOf);
  const isHeader =
    isDeepEqual(cellsOf(header), cellsOf(RULE_TABLE_HEADER)) &&
    cellsOf(delimiter).every((cell) => DASHES.test(cell));

  const problems: readonly (RuleFormProblem | undefined)[] = [
    isHeader
      ? undefined
      : {
          code: RuleFormCode.HeaderMisshapen,
          details: {
            slug,
          },
        },
    rows.length === 1
      ? undefined
      : {
          code: RuleFormCode.RowsNotOne,
          details: {
            count: rows.length,
            slug,
          },
        },
    rows.length === 0 || cells.length === RULE_TABLE_CELLS
      ? undefined
      : {
          code: RuleFormCode.CellsMiscounted,
          details: {
            count: cells.length,
            slug,
          },
        },
  ];

  return {
    cells,
    problems: problems.filter((problem) => problem !== undefined),
  };
};

const labelProblems = (input: {
  lines: readonly string[];
  slug: RuleSlug;
}): readonly RuleFormProblem[] =>
  input.lines.flatMap((line) => {
    const name = LABEL_LINE.exec(line)?.[1];

    return name === undefined || name === EXAMPLE
      ? []
      : [
          {
            code: RuleFormCode.HoldsLabel,
            details: {
              label: name,
              slug: input.slug,
            },
          },
        ];
  });

const statementOf = (lines: readonly string[]): string => {
  const end = lines.findIndex((line) => isTableLine(line) || LABEL_LINE.test(line));

  return (end === -1 ? lines : lines.slice(0, end))
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');
};

const slugProblemOf = (heading: RuleHeading): SlugProblem | undefined => {
  if (!RuleSlug.is(heading.slug)) {
    return {
      code: ValueFailure.RuleSlug,
      details: {
        site: ValueSite.RuleHeading,
        written: heading.slug,
      },
    };
  }

  return heading.tightens === undefined || RuleSlug.is(heading.tightens)
    ? undefined
    : {
        code: ValueFailure.RuleSlug,
        details: {
          rule: heading.slug,
          site: ValueSite.TightenedRule,
          written: heading.tightens,
        },
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

  const atFile = (problem: RuleFormProblem | SlugProblem): RuleFormFinding => ({
    ...problem,
    path: input.source.file,
  });

  if (heading === undefined) {
    return {
      findings: LOOKS_LIKE_RULE.test(input.markdown.heading)
        ? [
            atFile({
              code: RuleFormCode.HeadingMisshapen,
              details: {
                heading: input.markdown.heading,
              },
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
  const [why = ''] = table.cells;
  const problems: readonly RuleFormProblem[] = [
    ...table.problems,
    ...labelProblems({
      lines,
      slug,
    }),
  ];

  return {
    findings: problems.map(atFile),
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

export type { RuleFormDetails, RuleSource, RulesParsed };
export { RuleFormCode, StatedRule };
