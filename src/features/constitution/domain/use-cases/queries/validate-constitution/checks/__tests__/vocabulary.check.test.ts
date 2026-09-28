import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import {
  checkInputOf,
  mainFile,
  rule,
  without,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { CheckInput } from '../../check.types';
import { vocabularyCheck } from '../vocabulary.check';

interface Lists {
  concepts?: readonly string[];
  folders?: readonly string[];
  suffixes?: readonly string[];
}

const VOCABULARY = 'vocabulary.yaml';
const CARD = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';

const vocabularyOf = (lists: Lists): string =>
  [
    'architecture:',
    `  concepts: ${JSON.stringify(lists.concepts ?? [])}`,
    `  folders: ${JSON.stringify(lists.folders ?? [])}`,
    `  suffixes: ${JSON.stringify(lists.suffixes ?? [])}`,
    '',
  ].join('\n');

const used = (input: { path: string; word: string }): Finding => ({
  message: `uses "${input.word}", a word of the architecture; foundation holds whatever the architecture`,
  path: input.path,
});

const inputOf = (input: {
  lists: Lists | undefined;
  path: string;
  text: string;
}): CheckInput => {
  const files = validFiles();
  files[input.path] = input.text;

  if (input.lists !== undefined) {
    files[VOCABULARY] = vocabularyOf(input.lists);
  }

  return checkInputOf(files);
};

describe('vocabularyCheck', () => {
  it('should find nothing when the vocabulary is sound and no foundation uses it', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the vocabulary as missing when the root does not hold it', () => {
    // Arrange
    const input = checkInputOf(
      without({
        files: validFiles(),
        path: VOCABULARY,
      }),
    );

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is missing; the constitution keeps the words of its architecture here',
        path: VOCABULARY,
      },
    ]);
  });

  it('should report the reason when the vocabulary is not YAML', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] = 'architecture:\n  concepts: [port\n';
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is not valid YAML: Flow sequence in block collection must be sufficiently indented and end with a ]',
        path: VOCABULARY,
      },
    ]);
  });

  it('should report every issue at its field when the vocabulary holds an unknown key and lacks a list', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] =
      'architecture:\n  concepts: []\n  suffixes: []\nlayers: []\n';
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'does not match its schema: architecture.folders: Invalid input: expected array, received undefined',
        path: VOCABULARY,
      },
      {
        message:
          'does not match its schema: <root>: Unrecognized key: "layers"',
        path: VOCABULARY,
      },
    ]);
  });

  it('should report each misshapen and repeated word when the lists break their forms', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] = vocabularyOf({
      concepts: [
        'Port',
        'binding_unit',
        'use-case',
        'read side',
        'sink',
      ],
      folders: [
        'adapters',
        'root/',
      ],
      suffixes: [
        'port',
        '.port',
        '.port',
        '.port',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'lists the concept "Port", which is not lower-case words separated by spaces or "-"',
        path: VOCABULARY,
      },
      {
        message:
          'lists the concept "binding_unit", which is not lower-case words separated by spaces or "-"',
        path: VOCABULARY,
      },
      {
        message: 'lists the folder "adapters", which does not end in "/"',
        path: VOCABULARY,
      },
      {
        message: 'lists the suffix "port", which does not start with "."',
        path: VOCABULARY,
      },
      {
        message: 'lists ".port" twice',
        path: VOCABULARY,
      },
    ]);
  });

  it('should report a repeated word once where a foundation uses it when the vocabulary lists it twice', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] = vocabularyOf({
      concepts: [
        'port',
        'port',
      ],
    });
    files[PRINCIPLES] = '# Principles\n\nA port.\n';
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'lists "port" twice',
        path: VOCABULARY,
      },
      used({
        path: PRINCIPLES,
        word: 'port',
      }),
    ]);
  });

  it.each<{
    lists?: Lists;
    name: string;
    path: string;
    text: string;
    words: readonly string[];
  }>([
    {
      name: 'a chapter uses a concept in the plural and in capitals',
      path: PRINCIPLES,
      text: '# Principles\n\nTwo Ports meet.\n',
      words: [
        'port',
      ],
    },
    {
      lists: {
        concepts: [
          'class',
        ],
      },
      name: 'a chapter uses a concept in its plural with "es"',
      path: PRINCIPLES,
      text: '# Principles\n\nTwo classes meet.\n',
      words: [
        'class',
      ],
    },
    {
      name: 'a line break splits a concept of two words',
      path: PRINCIPLES,
      text: '# Principles\n\nEach binding\nunits ship.\n',
      words: [
        'binding unit',
      ],
    },
    {
      name: 'a path holds a folder',
      path: PRINCIPLES,
      text: '# Principles\n\nCode lives in `src/adapters/http`.\n',
      words: [
        'adapters/',
      ],
    },
    {
      lists: {
        suffixes: [
          '.port',
        ],
      },
      name: 'a file name holds a suffix',
      path: PRINCIPLES,
      text: '# Principles\n\nName it x.port.ts.\n',
      words: [
        '.port',
      ],
    },
    {
      name: 'a line that is no heading holds a hash',
      path: PRINCIPLES,
      text: '# Principles\n\nIssue # 4 names a port.\n',
      words: [
        'port',
      ],
    },
    {
      name: 'a card uses a word',
      path: CARD,
      text: mainFile({
        body: '# Core\n\nEvery port has adapters/.\n',
        id: 'core',
      }),
      words: [
        'port',
        'adapters/',
      ],
    },
  ])('should report each word when $name', ({ lists, path, text, words }) => {
    // Arrange
    const input = inputOf({
      lists,
      path,
      text,
    });

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual(
      words.map((word) =>
        used({
          path,
          word,
        }),
      ),
    );
  });

  it.each<{
    lists?: Lists;
    name: string;
    path: string;
    text: string;
  }>([
    {
      name: 'a longer word holds a concept',
      path: PRINCIPLES,
      text: '# Principles\n\nWrite the report at the portal.\n',
    },
    {
      lists: {
        suffixes: [
          '.cli',
        ],
      },
      name: 'a longer suffix begins with a suffix',
      path: PRINCIPLES,
      text: '# Principles\n\nLoad x.client.ts.\n',
    },
    {
      lists: {
        suffixes: [
          '.port',
        ],
      },
      name: 'a suffix runs on into a name',
      path: PRINCIPLES,
      text: '# Principles\n\nName it x.ports or x.port-x.\n',
    },
    {
      name: 'a longer folder ends with a folder',
      path: PRINCIPLES,
      text: '# Principles\n\nMove readapters/ and v2adapters/ and re-adapters/ away.\n',
    },
    {
      name: 'only headings use the words',
      path: PRINCIPLES,
      text: `# Ports\n\n${rule({
        slug: 'ports-behind-adapters',
        statement: 'It holds.',
      })}\n###### Binding units\n`,
    },
    {
      name: 'only a fenced sample uses the words',
      path: PRINCIPLES,
      text: '# Principles\n\n```ts\nconst port = import("adapters/x.port");\n```\n',
    },
    {
      name: "only the card's front matter uses the words",
      path: CARD,
      text: mainFile({
        body: '# Core\n',
        governs: [
          '**/adapters/**',
        ],
        id: 'core',
        summary: 'Ports and binding units.',
      }),
    },
    {
      name: 'an architecture chapter uses the words',
      path: 'blocks/core/architecture/ports.md',
      text: '# Ports\n\nEach port has adapters/ and x.port.ts.\n',
    },
    {
      name: 'a workflow chapter uses the words',
      path: 'blocks/core/workflow/ports.md',
      text: '# Ports\n\nEach port has adapters/ and x.port.ts.\n',
    },
  ])('should find nothing when $name', ({ lists, path, text }) => {
    // Arrange
    const input = inputOf({
      lists,
      path,
      text,
    });

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
