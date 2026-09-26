import type { Finding, Level } from '#/kernel';
import { LEVELS } from '#/kernel';
import type { MarkdownSection } from '#/libs/markdown';
import { sectionsOf } from '#/libs/markdown';

import type { Rule, RuleLabel } from '../../../entities';
import { RULE_LABELS } from '../../../entities';

interface Source {
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
  findings: readonly Finding[];
  rule?: Rule;
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
const RULE_HEADING = /^## (\S+) · (MUST|SHOULD|MAY)$/;
const LOOKS_LIKE_RULE = /^#{1,6}\s.*\b(?:MUST|SHOULD|MAY)\W*$/;
const LABEL_LINE = /^\*\*([A-Z][A-Za-z ]*):\*\*\s*(.*)$/;
const LABEL_NAMES = RULE_LABELS.map((label) => LABEL_TEXT[label]).join(', ');

const draftOf = (heading: string): Draft | undefined => {
  const match = RULE_HEADING.exec(heading);
  const level = LEVELS.find((candidate) => candidate === match?.[2]);

  return match === null || level === undefined
    ? undefined
    : {
        labels: {},
        level,
        slug: match[1] ?? '',
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

  const name = match[1] ?? '';
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
        [label]: (match[2] ?? '').trim(),
      },
    },
    findings: [],
  };
};

const ruleOf = (input: { draft: Draft; source: Source }): Rule => ({
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
    findings,
    rule: ruleOf({
      draft,
      source: input.source,
    }),
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

  return {
    findings: read.flatMap((section) => section.findings),
    rules: read.flatMap((section) =>
      section.rule === undefined
        ? []
        : [
            section.rule,
          ],
    ),
  };
};

export { parseRules };
