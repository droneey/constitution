import { Axis } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import { DocumentPath } from '../../../../constants';
import type { BlockFile, Vocabulary, VocabularySection } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import { isHeading, withoutCodeFences } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { collapseWhitespace, WordKind, wordMatcher } from '../tokens.utils';

enum VocabularyCode {
  Missing = 'vocabulary-missing',
  NotYaml = 'vocabulary-not-yaml',
  OffSchema = 'vocabulary-off-schema',
  Misshapen = 'word-misshapen',
  ListedTwice = 'word-listed-twice',
  InBothAxes = 'word-in-both-axes',
  OffAxis = 'word-off-axis',
}

interface Word {
  axis: Axis;
  kind: WordKind;
  word: string;
}

interface WordForm {
  holds: (word: string) => boolean;
  kind: WordKind;
  // The message for a word of another shape.
  misshapen: (entry: Word) => string;
}

interface Section {
  axis: Axis;
  of: (vocabulary: Vocabulary) => VocabularySection;
}

const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';

const SECTIONS: readonly Section[] = [
  {
    axis: Axis.Architecture,
    of: (vocabulary: Vocabulary): VocabularySection => vocabulary.architecture,
  },
  {
    axis: Axis.Workflow,
    of: (vocabulary: Vocabulary): VocabularySection => vocabulary.workflow,
  },
];

const FORMS: readonly WordForm[] = [
  {
    holds: (word: string): boolean => CONCEPT.test(word),
    kind: WordKind.Concept,
    misshapen: (entry: Word): string =>
      `lists the ${entry.kind} "${entry.word}" of the ${entry.axis}, which is not lower-case words separated by spaces or "-"`,
  },
  {
    holds: (word: string): boolean => word.endsWith(FOLDER_END),
    kind: WordKind.Folder,
    misshapen: (entry: Word): string =>
      `lists the ${entry.kind} "${entry.word}" of the ${entry.axis}, which does not end in "${FOLDER_END}"`,
  },
  {
    holds: (word: string): boolean => word.startsWith(SUFFIX_START),
    kind: WordKind.Suffix,
    misshapen: (entry: Word): string =>
      `lists the ${entry.kind} "${entry.word}" of the ${entry.axis}, which does not start with "${SUFFIX_START}"`,
  },
];

const wordsOf = (vocabulary: Vocabulary): readonly Word[] =>
  SECTIONS.flatMap(({ axis, of }) => {
    const { concepts, folders, suffixes } = of(vocabulary);

    return [
      ...concepts.map((word) => ({
        axis,
        kind: WordKind.Concept,
        word,
      })),
      ...folders.map((word) => ({
        axis,
        kind: WordKind.Folder,
        word,
      })),
      ...suffixes.map((word) => ({
        axis,
        kind: WordKind.Suffix,
        word,
      })),
    ];
  });

const repeatsOf = (values: readonly string[]): readonly string[] => [
  ...new Set(values.filter((word, index) => values.indexOf(word) !== index)),
];

const listFindings = (words: readonly Word[]): readonly Finding[] =>
  [
    ...FORMS.flatMap((form) =>
      words
        .filter((entry) => entry.kind === form.kind && !form.holds(entry.word))
        .map((entry) => ({
          code: VocabularyCode.Misshapen,
          message: form.misshapen(entry),
        })),
    ),
    ...SECTIONS.flatMap(({ axis }) =>
      repeatsOf(words.filter((entry) => entry.axis === axis).map((entry) => entry.word)).map(
        (word) => ({
          code: VocabularyCode.ListedTwice,
          message: `lists "${word}" twice in the ${axis}`,
        }),
      ),
    ),
    ...[
      ...new Set(words.map((entry) => entry.word)),
    ]
      .filter(
        (word) =>
          new Set(words.filter((entry) => entry.word === word).map((entry) => entry.axis)).size > 1,
      )
      .map((word) => ({
        code: VocabularyCode.InBothAxes,
        message: `lists "${word}" in both the ${Axis.Architecture} and the ${Axis.Workflow}`,
      })),
  ].map((problem) => ({
    ...problem,
    path: DocumentPath.Vocabulary,
  }));

const proseOf = (file: BlockFile): string =>
  collapseWhitespace(
    withoutCodeFences(file.body)
      .split('\n')
      .filter((line) => !isHeading(line))
      .join('\n'),
  );

const usageFindings = (input: {
  files: readonly BlockFile[];
  words: readonly Word[];
}): readonly Finding[] => {
  const matchers = input.words.map((entry) => ({
    axis: entry.axis,
    matches: wordMatcher(entry),
    word: entry.word,
  }));

  return input.files.flatMap((file) => {
    const text = proseOf(file);

    return [
      ...new Set(
        matchers
          .filter((matcher) => matcher.axis !== file.axis && matcher.matches(text))
          .map(
            (matcher) =>
              `uses "${matcher.word}", a word of the ${matcher.axis}; ${file.axis} holds whatever the ${matcher.axis}`,
          ),
      ),
    ].map((message) => ({
      code: VocabularyCode.OffAxis,
      message,
      path: file.path,
    }));
  });
};

const vocabularyCheck: Check = ({ constitution }: CheckInput): readonly Finding[] => {
  const read = constitution.documents.vocabulary;

  if (read === undefined) {
    return [
      {
        code: VocabularyCode.Missing,
        message:
          'is missing; the Constitution keeps the words of its architecture and workflow here',
        path: DocumentPath.Vocabulary,
      },
    ];
  }

  if (read.status === 'not-yaml') {
    return [
      {
        code: VocabularyCode.NotYaml,
        message: `is not valid YAML: ${read.reason}`,
        path: DocumentPath.Vocabulary,
      },
    ];
  }

  if (read.status === 'mismatched') {
    return read.issues.map((issue) => ({
      code: VocabularyCode.OffSchema,
      message: `does not match its schema: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
      path: DocumentPath.Vocabulary,
    }));
  }

  const words = wordsOf(read.vocabulary);

  return [
    ...listFindings(words),
    ...usageFindings({
      // a passport speaks of its whole block, every axis at once, as its front matter does
      files: constitution.blocks
        .flatMap((block) => block.files)
        .filter((file) => file.role !== BlockFileRole.Passport),
      words,
    }),
  ];
};

export { vocabularyCheck };
