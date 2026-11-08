import type { Axis } from '../constants';
import { Level } from '../constants';
import { ValueFailure } from '../errors';
import type { FindingOf, ProblemOf } from '../types';
import type { MarkdownSection } from '../utils';
import { sectionsOf } from '../utils';
import type { BlockId } from '../value-objects';
import { RuleSlug } from '../value-objects';
import type { RuleExample, RulePlace, RuleText } from './rule.entity';
import { Rule } from './rule.entity';
import type { RuleChunk } from './rule-body.entity';
import { RuleBody } from './rule-body.entity';
import type { RuleFormDetails, RuleFormProblem } from './rule-form.entity';
import { RuleFormCode } from './rule-form.entity';
import { RuleHeading } from './rule-heading.entity';
import type { ValueFindingDetails } from './value-finding.entity';
import { ValueSite } from './value-finding.entity';

interface RuleWording extends RuleText {
  readonly examples: readonly RuleExample[];
  readonly statedLevel?: Level;
}

interface StatedRule extends RulePlace, RuleWording {}

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

interface WordingRead {
  readonly problems: readonly (RuleFormProblem | SlugProblem)[];
  readonly wording?: RuleWording;
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
const SUBSECTION = /^#{4,6}(?:\s|$)/;
const LOOKS_LIKE_RULE = /\b(?:MUST|SHOULD|MAY)\W*$| → /;
const LABEL_LINE = /^\*\*([^*]+):\*\*/;

const headingOf = (text: string): RuleHeading | undefined =>
  text.startsWith(RULE_MARK) ? RuleHeading.of(text.slice(RULE_MARK.length)) : undefined;

const labelProblems = (input: {
  lines: readonly string[];
  slug: RuleSlug;
}): readonly RuleFormProblem[] =>
  input.lines.flatMap((line) => {
    const name = LABEL_LINE.exec(line)?.[1];

    return name === undefined
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
  const end = lines.findIndex((line) => LABEL_LINE.test(line));

  return RuleBody.joinedOf(end === -1 ? lines : lines.slice(0, end));
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

const wordingOfSection = (input: { chunk: RuleChunk }): WordingRead => {
  const { chunk } = input;
  const heading = headingOf(chunk.heading);

  if (heading === undefined) {
    return {
      problems: LOOKS_LIKE_RULE.test(chunk.heading)
        ? [
            {
              code: RuleFormCode.HeadingMisshapen,
              details: {
                heading: chunk.heading,
              },
            },
          ]
        : [],
    };
  }

  const slugProblem = slugProblemOf(heading);

  if (slugProblem !== undefined) {
    return {
      problems: [
        slugProblem,
      ],
    };
  }

  const lines = RuleBody.proseOf(chunk.lines);
  const slug = RuleSlug.create(heading.slug);
  const body = RuleBody.read({
    lines,
    slug,
    subsections: chunk.subsections,
  });

  return {
    problems: [
      ...body.problems,
      ...labelProblems({
        lines: body.proseLines,
        slug,
      }),
    ],
    wording: {
      examples: body.examples,
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
      why: body.why,
    },
  };
};

const chunksOf = (text: string): readonly RuleChunk[] => {
  const chunks: (MarkdownSection & {
    readonly subsections: MarkdownSection[];
  })[] = [];

  for (const section of sectionsOf(text)) {
    const open = chunks.at(-1);

    if (open?.heading.startsWith(RULE_MARK) === true && SUBSECTION.test(section.heading)) {
      open.subsections.push(section);
    } else {
      chunks.push({
        ...section,
        subsections: [],
      });
    }
  }

  return chunks;
};

const findingsOf = (input: {
  problems: readonly (RuleFormProblem | SlugProblem)[];
  source: RuleSource;
}): readonly RuleFormFinding[] =>
  input.problems.map(
    (problem): RuleFormFinding => ({
      ...problem,
      path: input.source.file,
    }),
  );

const readSection = (input: {
  chapterTitle: string | undefined;
  chunk: RuleChunk;
  section: string | undefined;
  source: RuleSource;
}): SectionRead => {
  const { problems, wording } = wordingOfSection(input);
  const findings = findingsOf({
    problems,
    source: input.source,
  });

  return wording === undefined
    ? {
        findings,
      }
    : {
        findings,
        rule: {
          ...placeOf(input),
          ...wording,
        },
      };
};

const parse = (source: RuleSource): RulesParsed => {
  let chapterTitle: string | undefined;
  let section: string | undefined;
  const read = chunksOf(source.text).map((chunk) => {
    chapterTitle = TITLE.exec(chunk.heading)?.[1] ?? chapterTitle;
    section = SECTION.exec(chunk.heading)?.[1] ?? section;

    return readSection({
      chapterTitle,
      chunk,
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

const wordingsOf = (text: string): readonly RuleWording[] =>
  chunksOf(text).flatMap(
    (chunk) =>
      wordingOfSection({
        chunk,
      }).wording ?? [],
  );

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

const retiredLevelsIn = (stated: readonly StatedRule[]): readonly RuleFormFinding[] =>
  stated.flatMap((rule) =>
    rule.statedLevel === Level.May
      ? [
          {
            code: RuleFormCode.LevelRetired,
            details: {
              slug: rule.slug,
            },
            path: rule.file,
          },
        ]
      : [],
  );

const StatedRule = {
  inheritLevels,
  parse,
  retiredLevelsIn,
  withoutExamples: RuleBody.withoutExamples,
  wordingsOf,
} as const;

export type { RuleSource, RulesParsed, RuleWording };
export { StatedRule };
