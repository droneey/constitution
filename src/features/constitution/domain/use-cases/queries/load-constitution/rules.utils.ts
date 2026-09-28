import type { Axis, Finding, Level } from '#/kernel';
import { LEVELS } from '#/kernel';

import type { Rule, RuleLabel } from '../../../entities';
import { RULE_LABELS } from '../../../entities';
import type { MarkdownSection } from '../../../utils';
import { sectionsOf } from '../../../utils';

interface Source {
  axis: Axis | undefined;
  block: string;
  file: string;
  text: string;
  with: string | undefined;
}

interface Draft {
  labels: Readonly<Partial<Record<RuleLabel, string>>>;
  level: Level;
  slug: string;
  statement: readonly string[];
}

interface DraftRead {
  draft: Draft;
  findings: readonly Finding[];
}

interface SectionRead {
  draft?: Draft;
  findings: readonly Finding[];
}

interface RulesParsed {
  findings: readonly Finding[];
  rules: readonly Rule[];
}

const LABEL_TEXT: Readonly<Record<RuleLabel, string>> = {
  check: 'Check',
  example: 'Example',
  implements: 'Implements',
  tags: 'Tags',
  why: 'Why',
};
const RULE_HEADING = /^## (\S+) · (\S+)$/;
const LOOKS_LIKE_RULE = /\b(?:MUST|SHOULD|MAY)\W*$/;
const LABEL_LINE = /^\*\*([A-Z][A-Za-z ]*):\*\*(.*)/;
const LABEL_NAMES = RULE_LABELS.map((label) => LABEL_TEXT[label]).join(', ');

const draftOf = (heading: string): Draft | undefined => {
  const match = RULE_HEADING.exec(heading);

  if (match === null) {
    return undefined;
  }

  // Stryker disable next-line StringLiteral: the pattern always captures the slug
  const [, slug = '', word] = match;
  const level = LEVELS.find((candidate) => candidate === word);

  return level === undefined
    ? undefined
    : {
        labels: {},
        level,
        slug,
        statement: [],
      };
};

const withText = (input: { draft: Draft; line: string }): Draft => {
  const text = input.line.trim();
  const isStatement =
    Object.keys(input.draft.labels).length === 0 && text !== '';

  return isStatement
    ? {
        ...input.draft,
        statement: [
          ...input.draft.statement,
          text,
        ],
      }
    : input.draft;
};

const withLine = (input: {
  draft: Draft;
  line: string;
  source: Source;
}): DraftRead => {
  const match = LABEL_LINE.exec(input.line);

  if (match === null) {
    return {
      draft: withText(input),
      findings: [],
    };
  }

  // Stryker disable next-line StringLiteral: the pattern always captures both
  const [, name = '', value = ''] = match;
  const label = RULE_LABELS.find((candidate) => LABEL_TEXT[candidate] === name);
  const problem =
    label === undefined
      ? `has the label "${name}", which is not one of ${LABEL_NAMES}`
      : `has the label "${name}" twice`;

  if (label === undefined || input.draft.labels[label] !== undefined) {
    return {
      draft: input.draft,
      findings: [
        {
          message: `rule "${input.draft.slug}" ${problem}`,
          path: input.source.file,
        },
      ],
    };
  }

  return {
    draft: {
      ...input.draft,
      labels: {
        ...input.draft.labels,
        [label]: value.trim(),
      },
    },
    findings: [],
  };
};

const ruleOf = (input: { axis: Axis; draft: Draft; source: Source }): Rule => ({
  axis: input.axis,
  block: input.source.block,
  file: input.source.file,
  labels: input.draft.labels,
  level: input.draft.level,
  slug: input.draft.slug,
  statement: input.draft.statement.join(' '),
  with: input.source.with,
});

const readSection = (input: {
  section: MarkdownSection;
  source: Source;
}): SectionRead => {
  const first = draftOf(input.section.heading);

  if (first === undefined) {
    return {
      findings: LOOKS_LIKE_RULE.test(input.section.heading)
        ? [
            {
              message: `heading "${input.section.heading}" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"`,
              path: input.source.file,
            },
          ]
        : [],
    };
  }

  const findings: Finding[] = [];
  let draft = first;

  for (const line of input.section.lines) {
    const read = withLine({
      draft,
      line,
      source: input.source,
    });

    draft = read.draft;
    findings.push(...read.findings);
  }

  return {
    draft,
    findings,
  };
};

// Every heading ends the rule before it, so a heading of another level can
// never merge into a rule or overwrite its labels.
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
        : drafts.map((draft) =>
            ruleOf({
              axis,
              draft,
              source,
            }),
          ),
  };
};

export { parseRules };
