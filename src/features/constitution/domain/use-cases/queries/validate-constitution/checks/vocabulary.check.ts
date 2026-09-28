import type { Finding } from '#/kernel';
import { Axis } from '#/kernel';

import { DocumentPath } from '../../../../constants';
import type { BlockFile, Vocabulary } from '../../../../entities';
import { isHeading, withoutCodeFences } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { collapseWhitespace, WordKind, wordMatcher } from '../tokens.utils';

interface Word {
  kind: WordKind;
  word: string;
}

interface WordForm {
  holds: (word: string) => boolean;
  kind: WordKind;
  shape: string;
}

const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';

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

const wordsOf = (vocabulary: Vocabulary): readonly Word[] => {
  const { concepts, folders, suffixes } = vocabulary.architecture;

  return [
    ...concepts.map((word) => ({
      kind: WordKind.Concept,
      word,
    })),
    ...folders.map((word) => ({
      kind: WordKind.Folder,
      word,
    })),
    ...suffixes.map((word) => ({
      kind: WordKind.Suffix,
      word,
    })),
  ];
};

const listFindings = (words: readonly Word[]): readonly Finding[] => [
  ...FORMS.flatMap((form) =>
    words
      .filter((entry) => entry.kind === form.kind && !form.holds(entry.word))
      .map((entry) => ({
        message: `lists the ${form.kind} "${entry.word}", which ${form.shape}`,
        path: DocumentPath.Vocabulary,
      })),
  ),
  ...[
    ...new Set(
      words
        .map((entry) => entry.word)
        .filter((word, index, all) => all.indexOf(word) !== index),
    ),
  ].map((word) => ({
    message: `lists "${word}" twice`,
    path: DocumentPath.Vocabulary,
  })),
];

const holdsFoundation = (file: BlockFile): boolean =>
  file.axis === undefined || file.axis === Axis.Foundation;

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
    matches: wordMatcher(entry),
    word: entry.word,
  }));

  return input.files.filter(holdsFoundation).flatMap((file) => {
    const text = proseOf(file);

    return [
      ...new Set(
        matchers
          .filter((matcher) => matcher.matches(text))
          .map((matcher) => matcher.word),
      ),
    ].map((word) => ({
      message: `uses "${word}", a word of the architecture; foundation holds whatever the architecture`,
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
          'is missing; the constitution keeps the words of its architecture here',
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
