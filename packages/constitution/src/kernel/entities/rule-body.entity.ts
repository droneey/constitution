import {
  RULE_EXAMPLES_HEADING,
  RULE_TABLE_CELLS,
  RULE_TABLE_HEADER,
  RULE_WHY_HEADING,
} from '../constants';
import type { MarkdownSection } from '../utils';
import {
  cellsOf,
  fencedBlocksOf,
  fencedLinesOf,
  isDeepEqual,
  isHeading,
  isTableLine,
  tablesOf,
  withoutCodeFences,
} from '../utils';
import type { RuleSlug } from '../value-objects';
import type { RuleExample } from './rule.entity';
import type { RuleFormProblem } from './rule-form.entity';
import { RuleFormCode } from './rule-form.entity';

enum RuleForm {
  Tabled = 'tabled',
  Sectioned = 'sectioned',
}

enum Part {
  Why = 'why',
  Examples = 'examples',
  InExamples = 'in-examples',
  Unknown = 'unknown',
}

interface RuleChunk extends MarkdownSection {
  readonly subsections: readonly MarkdownSection[];
}

interface RuleBody {
  readonly examples: readonly RuleExample[];
  readonly problems: readonly RuleFormProblem[];
  readonly proseLines: readonly string[];
  readonly why: string;
}

interface BodyInput {
  readonly form: RuleForm;
  readonly lines: readonly string[];
  readonly slug: RuleSlug;
  readonly subsections: readonly MarkdownSection[];
}

interface PartRead {
  readonly heading: string;
  readonly isNamed: boolean;
  readonly lines: readonly string[];
  readonly part: Part;
}

const DASHES = /^:?-+:?$/;
const DEEPER_HEADING = '#####';
const TITLE_ATTRIBUTE = /(?:^|\s)title="([^"]+)"/;
const LANGUAGE = /^[^\s=]+(?=\s|$)/;

const partsByHeading: ReadonlyMap<string, Part> = new Map([
  [
    RULE_WHY_HEADING,
    Part.Why,
  ],
  [
    RULE_EXAMPLES_HEADING,
    Part.Examples,
  ],
]);

const proseOf = (lines: readonly string[]): readonly string[] =>
  withoutCodeFences(lines.join('\n')).split('\n');

const joinedOf = (lines: readonly string[]): string =>
  lines
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ');

const formsOf = (chunk: RuleChunk): readonly RuleForm[] => [
  ...(proseOf(chunk.lines).some(isTableLine)
    ? [
        RuleForm.Tabled,
      ]
    : []),
  ...(chunk.subsections.length > 0
    ? [
        RuleForm.Sectioned,
      ]
    : []),
];

const tabledOf = (input: BodyInput): RuleBody => {
  const { slug } = input;
  const tables = tablesOf(input.lines);
  const read = {
    examples: [],
    proseLines: input.lines,
  };

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
      ...read,
      problems: [
        problem,
      ],
      why: '',
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
    ...read,
    problems: problems.filter((problem) => problem !== undefined),
    why: cells[0] ?? '',
  };
};

const partOf = (input: { heading: string; isInExamples: boolean }): Part => {
  if (input.heading.startsWith(DEEPER_HEADING)) {
    return input.isInExamples ? Part.InExamples : Part.Unknown;
  }

  return partsByHeading.get(input.heading) ?? Part.Unknown;
};

const partsOf = (subsections: readonly MarkdownSection[]): readonly PartRead[] => {
  let isInExamples = false;

  return subsections.map((subsection) => {
    const heading = subsection.heading.trimEnd();
    const part = partOf({
      heading,
      isInExamples,
    });

    isInExamples = part === Part.Examples || part === Part.InExamples;

    return {
      heading,
      isNamed: !heading.startsWith(DEEPER_HEADING),
      lines: subsection.lines,
      part,
    };
  });
};

const linesOfParts = (input: {
  parts: readonly PartRead[];
  wanted: readonly Part[];
}): readonly string[] =>
  input.parts.filter(({ part }) => input.wanted.includes(part)).flatMap(({ lines }) => lines);

const orderProblems = (input: {
  parts: readonly PartRead[];
  slug: RuleSlug;
}): readonly RuleFormProblem[] => {
  const { slug } = input;
  const named = input.parts.filter(({ isNamed }) => isNamed).map(({ part }) => part);

  return [
    ...(named.includes(Part.Why)
      ? []
      : [
          {
            code: RuleFormCode.WithoutWhySection,
            details: {
              slug,
            },
          } satisfies RuleFormProblem,
        ]),
    ...(named.some((part, index) => part === Part.Why && index > 0)
      ? [
          {
            code: RuleFormCode.WhyMisplaced,
            details: {
              slug,
            },
          } satisfies RuleFormProblem,
        ]
      : []),
    ...(named.includes(Part.Examples)
      ? []
      : [
          {
            code: RuleFormCode.WithoutExamples,
            details: {
              slug,
            },
          } satisfies RuleFormProblem,
        ]),
    ...(named.some((part, index) => part === Part.Examples && index < named.length - 1)
      ? [
          {
            code: RuleFormCode.ExamplesNotLast,
            details: {
              slug,
            },
          } satisfies RuleFormProblem,
        ]
      : []),
  ];
};

const headingProblems = (input: {
  parts: readonly PartRead[];
  slug: RuleSlug;
}): readonly RuleFormProblem[] =>
  input.parts.flatMap(({ heading, part }): readonly RuleFormProblem[] => {
    const details = {
      heading,
      slug: input.slug,
    };

    if (part === Part.Unknown) {
      return [
        {
          code: RuleFormCode.SectionUnknown,
          details,
        },
      ];
    }

    return part === Part.InExamples
      ? [
          {
            code: RuleFormCode.ExamplesHoldHeading,
            details,
          },
        ]
      : [];
  });

const examplesOf = (input: {
  lines: readonly string[];
  slug: RuleSlug;
}): Pick<RuleBody, 'examples' | 'problems'> => {
  const { slug } = input;
  const blocks = fencedBlocksOf(input.lines).map((block) => ({
    code: block.lines.join('\n'),
    language: LANGUAGE.exec(block.info)?.[0] ?? '',
    title: TITLE_ATTRIBUTE.exec(block.info)?.[1],
  }));

  return {
    examples: blocks.flatMap(({ title, ...block }) =>
      title === undefined
        ? []
        : [
            {
              ...block,
              title,
            },
          ],
    ),
    problems: [
      ...(proseOf(input.lines).some((line) => line.trim() !== '')
        ? [
            {
              code: RuleFormCode.ExamplesHoldProse,
              details: {
                slug,
              },
            } satisfies RuleFormProblem,
          ]
        : []),
      ...blocks
        .filter(({ title }) => title === undefined)
        .map(
          ({ language }): RuleFormProblem => ({
            code: RuleFormCode.ExampleUntitled,
            details: {
              language,
              slug,
            },
          }),
        ),
    ],
  };
};

const sectionedOf = (input: BodyInput): RuleBody => {
  const { slug } = input;
  const parts = partsOf(input.subsections);
  const whyLines = proseOf(
    linesOfParts({
      parts,
      wanted: [
        Part.Why,
      ],
    }),
  );
  const examples = examplesOf({
    lines: linesOfParts({
      parts,
      wanted: [
        Part.Examples,
        Part.InExamples,
      ],
    }),
    slug,
  });

  return {
    examples: examples.examples,
    problems: [
      ...orderProblems({
        parts,
        slug,
      }),
      ...headingProblems({
        parts,
        slug,
      }),
      ...examples.problems,
    ],
    proseLines: [
      ...input.lines,
      ...whyLines,
    ],
    why: joinedOf(whyLines),
  };
};

const withoutExamples = (text: string): string => {
  const lines = text.split('\n');
  const fenced = fencedLinesOf(lines);
  let isInExamples = false;

  return lines
    .filter((line, index) => {
      if (fenced[index] !== true && isHeading(line)) {
        isInExamples =
          line.trimEnd() === RULE_EXAMPLES_HEADING ||
          (isInExamples && line.startsWith(DEEPER_HEADING));
      }

      return !isInExamples;
    })
    .join('\n');
};

const read = (input: BodyInput): RuleBody =>
  input.form === RuleForm.Sectioned ? sectionedOf(input) : tabledOf(input);

const RuleBody = {
  formsOf,
  joinedOf,
  proseOf,
  read,
  withoutExamples,
} as const;

export type { RuleChunk };
export { RuleBody, RuleForm };
