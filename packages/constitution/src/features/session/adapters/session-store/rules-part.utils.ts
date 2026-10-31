import type { AbsolutePath } from '#/kernel/value-objects';
import { RuleSlug } from '#/kernel/value-objects';

import type { RulesPart } from '../../domain/contracts/repositories/commands';
import { GatedRule } from '../../domain/entities';
import { RuleHash } from '../../domain/value-objects';
import { isPastPartBudget, PART_LINE_WIDTH } from './part-budget.utils';
import {
  loweredMessage,
  loweredThroughMessage,
  partIntroMessage,
  partTitleMessage,
  whyMessage,
} from './rules-part.messages';

const MARK = /^<!-- rule ([a-z0-9-]+) ([0-9a-f]+) -->$/u;

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

const ruleLines = (rule: GatedRule): readonly string[] => [
  `<!-- rule ${rule.slug} ${rule.hash} -->`,
  headingOf(rule),
  '',
  ...loweredLines(rule),
  ...wrappedAtSpaces(rule.statement),
  '',
  ...wrappedAtSpaces(whyMessage(rule.why)),
  '',
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

const bodiesOf = (rules: readonly GatedRule[]): readonly (readonly string[])[] => {
  const bodies: string[][] = [];
  let body: string[] = [];
  let file: AbsolutePath | undefined;

  for (const rule of rules) {
    const lines = [
      ...(rule.file === file
        ? []
        : [
            `## ${rule.file}`,
            '',
          ]),
      ...ruleLines(rule),
    ];

    if (
      body.length > 0 &&
      isPastPartBudget({
        added: lines,
        held: body,
      })
    ) {
      bodies.push(body);
      body = [
        `## ${rule.file}`,
        '',
        ...ruleLines(rule),
      ];
    } else {
      body.push(...lines);
    }

    file = rule.file;
  }

  return body.length === 0
    ? bodies
    : [
        ...bodies,
        body,
      ];
};

const partTextsOf = (rules: readonly GatedRule[]): readonly string[] => {
  const bodies = bodiesOf(rules);

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
    lineCount: lines.length,
    rules: lines.flatMap((line) => {
      const mark = MARK.exec(line);
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
