import { relative } from 'node:path';

import { LEVELS } from '#/kernel/constants';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { GatedDefinition, MarkedReading, OwedReading } from '../../domain/gate/entities';
import { GatedRule } from '../../domain/gate/entities';
import { isPastPartBudget, PART_LINE_WIDTH } from './part-budget.utils';
import {
  loweredMessage,
  loweredThroughMessage,
  partIntroMessage,
  partTitleMessage,
  rulesHeadingMessage,
  vocabularyHeadingMessage,
  whyMessage,
} from './rules-part.messages';

interface PartEntry {
  readonly heading: string;
  readonly lines: readonly string[];
  readonly list: MarkedReading;
}

interface PartBody {
  readonly lines: readonly string[];
  readonly list: MarkedReading;
}

interface EntryForm {
  readonly projectFolderPath?: AbsolutePath;
  readonly withHeldStatements: boolean;
  readonly withWhy: boolean;
}

interface WrittenPart {
  readonly list: MarkedReading;
  readonly text: string;
}

interface PartsInput {
  readonly projectFolderPath: AbsolutePath;
  readonly reading: OwedReading;
}

interface ReadingTextInput {
  readonly reading: OwedReading;
  readonly withWhy: boolean;
}

const OUTSIDE = '..';

const emptyList: MarkedReading = {
  definitions: [],
  rules: [],
};

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

// Why: a chapter is named from the project's folder, where the agent works, as a path it can open;
// a chapter outside it, as a worktree's release in its main checkout, keeps its whole path.
const shownPathOf = (input: { file: AbsolutePath; form: EntryForm }): string => {
  if (input.form.projectFolderPath === undefined) {
    return input.file;
  }

  const shown = relative(input.form.projectFolderPath, input.file);

  return shown.startsWith(OUTSIDE) ? input.file : shown;
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

const whyLines = (input: { form: EntryForm; rule: GatedRule }): readonly string[] =>
  input.form.withWhy
    ? [
        ...wrappedAtSpaces(whyMessage(input.rule.why)),
        '',
      ]
    : [];

const definitionEntryOf =
  (form: EntryForm) =>
  (definition: GatedDefinition): PartEntry => ({
    heading: `## ${vocabularyHeadingMessage(
      shownPathOf({
        file: definition.file,
        form,
      }),
    )}`,
    lines: [
      ...definitionLinesOf(definition.text),
      '',
    ],
    list: {
      definitions: [
        definition.hash,
      ],
      rules: [],
    },
  });

const statementLines = (input: { form: EntryForm; rule: GatedRule }): readonly string[] =>
  input.rule.isHeld === true && !input.form.withHeldStatements
    ? []
    : [
        ...loweredLines(input.rule),
        ...wrappedAtSpaces(input.rule.statement),
        '',
        ...whyLines(input),
      ];

const ruleEntryOf =
  (form: EntryForm) =>
  (rule: GatedRule): PartEntry => ({
    heading: `## ${rulesHeadingMessage({
      file: shownPathOf({
        file: rule.file,
        form,
      }),
      level: GatedRule.appliedLevelOf(rule),
    })}`,
    lines: [
      headingOf(rule),
      '',
      ...statementLines({
        form,
        rule,
      }),
    ],
    list: {
      definitions: [],
      rules: [
        {
          hash: rule.hash,
          slug: rule.slug,
        },
      ],
    },
  });

const byLevel = (rules: readonly GatedRule[]): readonly GatedRule[] =>
  rules.toSorted(
    (first, second) =>
      LEVELS.indexOf(GatedRule.appliedLevelOf(first)) -
      LEVELS.indexOf(GatedRule.appliedLevelOf(second)),
  );

const entriesOf = (input: { form: EntryForm; reading: OwedReading }): readonly PartEntry[] => [
  ...input.reading.definitions.map(definitionEntryOf(input.form)),
  ...byLevel(input.reading.rules).map(ruleEntryOf(input.form)),
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

const joinedLists = (held: MarkedReading, added: MarkedReading): MarkedReading => ({
  definitions: [
    ...held.definitions,
    ...added.definitions,
  ],
  rules: [
    ...held.rules,
    ...added.rules,
  ],
});

const bodiesOf = (input: {
  entries: readonly PartEntry[];
  isSplit: boolean;
}): readonly PartBody[] => {
  const bodies: PartBody[] = [];
  let body: PartBody = {
    lines: [],
    list: emptyList,
  };
  let heading: string | undefined;

  for (const entry of input.entries) {
    const opened = [
      entry.heading,
      '',
      ...entry.lines,
    ];
    const lines = entry.heading === heading ? entry.lines : opened;

    if (
      body.lines.length > 0 &&
      input.isSplit &&
      isPastPartBudget({
        added: lines,
        held: body.lines,
      })
    ) {
      bodies.push(body);
      body = {
        lines: opened,
        list: entry.list,
      };
    } else {
      body = {
        lines: [
          ...body.lines,
          ...lines,
        ],
        list: joinedLists(body.list, entry.list),
      };
    }

    heading = entry.heading;
  }

  return body.lines.length === 0
    ? bodies
    : [
        ...bodies,
        body,
      ];
};

const partsOf = (input: PartsInput): readonly WrittenPart[] => {
  const bodies = bodiesOf({
    entries: entriesOf({
      form: {
        projectFolderPath: input.projectFolderPath,
        withHeldStatements: false,
        withWhy: false,
      },
      reading: input.reading,
    }),
    isSplit: true,
  });

  return bodies.map((body, index) => ({
    list: body.list,
    text: [
      ...headLines({
        count: bodies.length,
        index,
      }),
      ...body.lines,
    ].join('\n'),
  }));
};

const readingTextOf = (input: ReadingTextInput): string =>
  bodiesOf({
    entries: entriesOf({
      form: {
        withHeldStatements: true,
        withWhy: input.withWhy,
      },
      reading: input.reading,
    }),
    isSplit: false,
  })
    .flatMap((body) => body.lines)
    .join('\n')
    .trimEnd();

export { partsOf, readingTextOf };
