import type { Finding } from '#/kernel';
import { Axis } from '#/kernel';

import { DocumentPath } from '../../../../constants';
import type {
  BlockFile,
  Vocabulary,
  VocabularySection,
} from '../../../../entities';
import {
  isHeading,
  withoutCodeFences,
  withoutInlineCode,
} from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { collapseWhitespace, WordKind, wordMatcher } from '../tokens.utils';

interface Word {
  axis: Axis;
  kind: WordKind;
  word: string;
}

interface WordForm {
  holds: (word: string) => boolean;
  kind: WordKind;
  shape: string;
}

interface Section {
  axis: Axis;
  of: (vocabulary: Vocabulary) => VocabularySection;
}

const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';
const CARD = 'the card';

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
    shape: 'is not lower-case words separated by spaces or "-"',
  },
  {
    holds: (word: string): boolean => word.endsWith(FOLDER_END),
    kind: WordKind.Folder,
    shape: `does not end in "${FOLDER_END}"`,
  },
  {
    holds: (word: string): boolean => word.startsWith(SUFFIX_START),
    kind: WordKind.Suffix,
    shape: `does not start with "${SUFFIX_START}"`,
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
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

const listFindings = (words: readonly Word[]): readonly Finding[] =>
  [
    ...FORMS.flatMap((form) =>
      words
        .filter((entry) => entry.kind === form.kind && !form.holds(entry.word))
        .map(
          (entry) =>
            `lists the ${form.kind} "${entry.word}" of the ${entry.axis}, which ${form.shape}`,
        ),
    ),
    ...SECTIONS.flatMap(({ axis }) =>
      repeatsOf(
        words.filter((entry) => entry.axis === axis).map((entry) => entry.word),
      ).map((word) => `lists "${word}" twice in the ${axis}`),
    ),
    ...[
      ...new Set(words.map((entry) => entry.word)),
    ]
      .filter(
        (word) =>
          new Set(
            words
              .filter((entry) => entry.word === word)
              .map((entry) => entry.axis),
          ).size > 1,
      )
      .map(
        (word) =>
          `lists "${word}" in both the ${Axis.Architecture} and the ${Axis.Workflow}`,
      ),
  ].map((message) => ({
    message,
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
    kind: entry.kind,
    matches: wordMatcher(entry),
    word: entry.word,
  }));

  return input.files.flatMap((file) => {
    const text = proseOf(file);
    // A code span names a tool's key or instruction, such as `ports` or
    // `ENTRYPOINT`, never a concept; folders and suffixes are written in one.
    const words = withoutInlineCode(text);
    const place = file.axis ?? CARD;

    return [
      ...new Set(
        matchers
          .filter(
            (matcher) =>
              matcher.axis !== file.axis &&
              matcher.matches(matcher.kind === WordKind.Concept ? words : text),
          )
          .map(
            (matcher) =>
              `uses "${matcher.word}", a word of the ${matcher.axis}; ${place} holds whatever the ${matcher.axis}`,
          ),
      ),
    ].map((message) => ({
      message,
      path: file.path,
    }));
  });
};

const vocabularyCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] => {
  const read = constitution.documents.vocabulary;

  if (read === undefined) {
    return [
      {
        message:
          'is missing; the constitution keeps the words of its architecture and workflow here',
        path: DocumentPath.Vocabulary,
      },
    ];
  }

  if (read.status === 'not-yaml') {
    return [
      {
        message: `is not valid YAML: ${read.reason}`,
        path: DocumentPath.Vocabulary,
      },
    ];
  }

  if (read.status === 'mismatched') {
    return read.issues.map((issue) => ({
      message: `does not match its schema: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
      path: DocumentPath.Vocabulary,
    }));
  }

  const words = wordsOf(read.vocabulary);

  return [
    ...listFindings(words),
    ...usageFindings({
      files: constitution.blocks.flatMap((block) => block.files),
      words,
    }),
  ];
};

export { vocabularyCheck };
