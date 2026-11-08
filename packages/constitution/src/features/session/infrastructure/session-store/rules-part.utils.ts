import { LEVELS } from '#/kernel/constants';
import { RuleSlug } from '#/kernel/value-objects';

import type { RulesPart } from '../../application/contracts/repositories/commands';
import type { GatedDefinition, OwedReading } from '../../domain/gate/entities';
import { GatedRule } from '../../domain/gate/entities';
import { RuleHash } from '../../domain/gate/value-objects';
import { isPastPartBudget, PART_LINE_WIDTH } from './part-budget.utils';
import {
  loweredMessage,
  loweredThroughMessage,
  partIntroMessage,
  partTitleMessage,
  rulesHeadingMessage,
  vocabularyHeadingMessage,
} from './rules-part.messages';

interface PartEntry {
  readonly heading: string;
  readonly lines: readonly string[];
}

const RULE_MARK = /^<!-- rule ([a-z0-9-]+) ([0-9a-f]+) -->$/u;
const DEFINITION_MARK = /^<!-- definition ([0-9a-f]+) -->$/u;

const wrappedAtSpaces = (text: string): readonly string[] => {
  const lines: string[] = [];
  let line = '';

  for (const word of text.split(' ')) {
    if (line !== '' && line.length + 1 + word.length > PART_LINE_WIDTH) {
      lines.push(line);
      line = word;
    } else {
      line = line === '' ? word : `${line} ${word}`;
    }
  }

  return [
    ...lines,
    line,
  ];
};

// Why: a definition may hold a code sample, whose lines and indents stay as written unless a line
// is too long for one Read.
const definitionLinesOf = (text: string): readonly string[] =>
  text.split('\n').flatMap((line) =>
    line.length > PART_LINE_WIDTH
      ? wrappedAtSpaces(line)
      : [
          line,
        ],
  );

const headingOf = (rule: GatedRule): string =>
  `### ${rule.slug}${rule.tightens === undefined ? '' : ` → ${rule.tightens}`} · ${GatedRule.appliedLevelOf(rule)}`;

const loweredLines = ({ lowered }: GatedRule): readonly string[] =>
  lowered === undefined
    ? []
    : [
        lowered.via === undefined
          ? loweredMessage(lowered)
          : loweredThroughMessage({
              ...lowered,
              via: lowered.via,
            }),
        '',
      ];

const definitionEntryOf = (definition: GatedDefinition): PartEntry => ({
  heading: `## ${vocabularyHeadingMessage(definition.file)}`,
  lines: [
    `<!-- definition ${definition.hash} -->`,
    ...definitionLinesOf(definition.text),
    '',
  ],
});

const ruleEntryOf = (rule: GatedRule): PartEntry => ({
  heading: `## ${rulesHeadingMessage({
    file: rule.file,
    level: GatedRule.appliedLevelOf(rule),
  })}`,
  lines: [
    `<!-- rule ${rule.slug} ${rule.hash} -->`,
    headingOf(rule),
    '',
    ...loweredLines(rule),
    ...wrappedAtSpaces(rule.statement),
    '',
  ],
});

const byLevel = (rules: readonly GatedRule[]): readonly GatedRule[] =>
  rules.toSorted(
    (first, second) =>
      LEVELS.indexOf(GatedRule.appliedLevelOf(first)) -
      LEVELS.indexOf(GatedRule.appliedLevelOf(second)),
  );

const entriesOf = (reading: OwedReading): readonly PartEntry[] => [
  ...reading.definitions.map(definitionEntryOf),
  ...byLevel(reading.rules).map(ruleEntryOf),
];

const headLines = (input: { count: number; index: number }): readonly string[] => [
  `# ${partTitleMessage({
    count: input.count,
    number: input.index + 1,
  })}`,
  '',
  partIntroMessage(),
  '',
];

const bodiesOf = (entries: readonly PartEntry[]): readonly (readonly string[])[] => {
  const bodies: string[][] = [];
  let body: string[] = [];
  let heading: string | undefined;

  for (const entry of entries) {
    const opened = [
      entry.heading,
      '',
      ...entry.lines,
    ];
    const lines = entry.heading === heading ? entry.lines : opened;

    if (
      body.length > 0 &&
      isPastPartBudget({
        added: lines,
        held: body,
      })
    ) {
      bodies.push(body);
      body = opened;
    } else {
      body.push(...lines);
    }

    heading = entry.heading;
  }

  return body.length === 0
    ? bodies
    : [
        ...bodies,
        body,
      ];
};

const partTextsOf = (reading: OwedReading): readonly string[] => {
  const bodies = bodiesOf(entriesOf(reading));

  return bodies.map((body, index) =>
    [
      ...headLines({
        count: bodies.length,
        index,
      }),
      ...body,
    ].join('\n'),
  );
};

const partRulesOf = (text: string): RulesPart => {
  const lines = text.split('\n');

  return {
    definitions: lines.flatMap((line) => {
      const hash = DEFINITION_MARK.exec(line)?.[1];

      return RuleHash.is(hash)
        ? [
            hash,
          ]
        : [];
    }),
    lineCount: lines.length,
    rules: lines.flatMap((line) => {
      const mark = RULE_MARK.exec(line);
      const slug = mark?.[1];
      const hash = mark?.[2];

      return RuleSlug.is(slug) && RuleHash.is(hash)
        ? [
            {
              hash,
              slug,
            },
          ]
        : [];
    }),
  };
};

export { partRulesOf, partTextsOf };
