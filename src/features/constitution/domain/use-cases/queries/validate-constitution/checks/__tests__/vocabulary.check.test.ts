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

interface Sections {
  architecture?: Lists;
  workflow?: Lists;
}

const VOCABULARY = 'vocabulary.yaml';
const CARD = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';
const ARCHITECTURE_PORTS = 'blocks/core/architecture/ports.md';
const WORKFLOW_PORTS = 'blocks/core/workflow/ports.md';

const listsOf = (input: { lists: Lists; name: string }): readonly string[] => [
  `${input.name}:`,
  `  concepts: ${JSON.stringify(input.lists.concepts ?? [])}`,
  `  folders: ${JSON.stringify(input.lists.folders ?? [])}`,
  `  suffixes: ${JSON.stringify(input.lists.suffixes ?? [])}`,
];

const vocabularyOf = (sections: Sections): string =>
  [
    ...listsOf({
      lists: sections.architecture ?? {},
      name: 'architecture',
    }),
    ...listsOf({
      lists: sections.workflow ?? {},
      name: 'workflow',
    }),
    '',
  ].join('\n');

const used = (input: {
  path: string;
  place: string;
  section: string;
  word: string;
}): Finding => ({
  message: `uses "${input.word}", a word of the ${input.section}; ${input.place} holds whatever the ${input.section}`,
  path: input.path,
});

const inFoundation = (word: string): Finding =>
  used({
    path: PRINCIPLES,
    place: 'foundation',
    section: 'architecture',
    word,
  });

const listed = (message: string): Finding => ({
  message,
  path: VOCABULARY,
});

const inputOf = (input: {
  path: string;
  sections: Sections | undefined;
  text: string;
}): CheckInput => {
  const files = validFiles();
  files[input.path] = input.text;

  if (input.sections !== undefined) {
    files[VOCABULARY] = vocabularyOf(input.sections);
  }

  return checkInputOf(files);
};

describe('vocabularyCheck', () => {
  it('should find nothing when the vocabulary is sound and each section keeps to its axis', () => {
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
      listed(
        'is missing; the constitution keeps the words of its architecture and workflow here',
      ),
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
      listed(
        'is not valid YAML: Flow sequence in block collection must be sufficiently indented and end with a ]',
      ),
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
      listed(
        'does not match its schema: architecture.folders: Invalid input: expected array, received undefined',
      ),
      listed(
        'does not match its schema: workflow: Invalid input: expected object, received undefined',
      ),
      listed('does not match its schema: <root>: Unrecognized key: "layers"'),
    ]);
  });

  it('should report each misshapen, repeated and shared word when the lists break their forms', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] = vocabularyOf({
      architecture: {
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
      },
      workflow: {
        concepts: [
          'Squash',
          'merge',
          'merge',
          'sink',
        ],
        folders: [
          'feature',
        ],
        suffixes: [
          'patch',
        ],
      },
    });
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      listed(
        'lists the concept "Port" of the architecture, which is not lower-case words separated by spaces or "-"',
      ),
      listed(
        'lists the concept "binding_unit" of the architecture, which is not lower-case words separated by spaces or "-"',
      ),
      listed(
        'lists the concept "Squash" of the workflow, which is not lower-case words separated by spaces or "-"',
      ),
      listed(
        'lists the folder "adapters" of the architecture, which does not end in "/"',
      ),
      listed(
        'lists the folder "feature" of the workflow, which does not end in "/"',
      ),
      listed(
        'lists the suffix "port" of the architecture, which does not start with "."',
      ),
      listed(
        'lists the suffix "patch" of the workflow, which does not start with "."',
      ),
      listed('lists ".port" twice in the architecture'),
      listed('lists "merge" twice in the workflow'),
      listed('lists "sink" in both the architecture and the workflow'),
    ]);
  });

  it('should report a repeated word once where a foundation uses it when the vocabulary lists it twice', () => {
    // Arrange
    const files = validFiles();
    files[VOCABULARY] = vocabularyOf({
      architecture: {
        concepts: [
          'port',
          'port',
        ],
      },
    });
    files[PRINCIPLES] = '# Principles\n\nA port.\n';
    const input = checkInputOf(files);

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      listed('lists "port" twice in the architecture'),
      inFoundation('port'),
    ]);
  });

  it.each<{
    expected: readonly Finding[];
    name: string;
    path: string;
    sections?: Sections;
    text: string;
  }>([
    {
      expected: [
        inFoundation('port'),
      ],
      name: 'a chapter uses a concept in the plural and in capitals',
      path: PRINCIPLES,
      text: '# Principles\n\nTwo Ports meet.\n',
    },
    {
      expected: [
        inFoundation('class'),
      ],
      name: 'a chapter uses a concept in its plural with "es"',
      path: PRINCIPLES,
      sections: {
        architecture: {
          concepts: [
            'class',
          ],
        },
      },
      text: '# Principles\n\nTwo classes meet.\n',
    },
    {
      expected: [
        inFoundation('binding unit'),
      ],
      name: 'a line break splits a concept of two words',
      path: PRINCIPLES,
      text: '# Principles\n\nEach binding\nunits ship.\n',
    },
    {
      expected: [
        inFoundation('adapters/'),
      ],
      name: 'a path holds a folder',
      path: PRINCIPLES,
      text: '# Principles\n\nCode lives in `src/adapters/http`.\n',
    },
    {
      expected: [
        inFoundation('.port'),
      ],
      name: 'a file name holds a suffix',
      path: PRINCIPLES,
      sections: {
        architecture: {
          suffixes: [
            '.port',
          ],
        },
      },
      text: '# Principles\n\nName it x.port.ts.\n',
    },
    {
      expected: [
        inFoundation('port'),
      ],
      name: 'a line that is no heading holds a hash',
      path: PRINCIPLES,
      text: '# Principles\n\nIssue # 4 names a port.\n',
    },
    {
      expected: [
        used({
          path: CARD,
          place: 'the card',
          section: 'architecture',
          word: 'port',
        }),
        used({
          path: CARD,
          place: 'the card',
          section: 'architecture',
          word: 'adapters/',
        }),
        used({
          path: CARD,
          place: 'the card',
          section: 'workflow',
          word: 'squash merge',
        }),
      ],
      name: 'a card uses words of both sections',
      path: CARD,
      text: mainFile({
        body: '# Core\n\nEvery port has adapters/ and lands by squash merge.\n',
        id: 'core',
      }),
    },
    {
      expected: [
        used({
          path: PRINCIPLES,
          place: 'foundation',
          section: 'workflow',
          word: 'squash merge',
        }),
        used({
          path: PRINCIPLES,
          place: 'foundation',
          section: 'workflow',
          word: 'feature/',
        }),
      ],
      name: 'a foundation chapter uses words of the workflow',
      path: PRINCIPLES,
      text: '# Principles\n\nSquash merges land on feature/login.\n',
    },
    {
      expected: [
        used({
          path: ARCHITECTURE_PORTS,
          place: 'architecture',
          section: 'workflow',
          word: 'squash merge',
        }),
      ],
      name: 'an architecture chapter uses a word of the workflow',
      path: ARCHITECTURE_PORTS,
      text: '# Ports\n\nEach port lands by squash merge.\n',
    },
    {
      expected: [
        used({
          path: WORKFLOW_PORTS,
          place: 'workflow',
          section: 'architecture',
          word: 'port',
        }),
      ],
      name: 'a workflow chapter uses a word of the architecture',
      path: WORKFLOW_PORTS,
      text: '# Ports\n\nA squash merge touches one port.\n',
    },
  ])(
    'should report each word when $name',
    ({ expected, path, sections, text }) => {
      // Arrange
      const input = inputOf({
        path,
        sections,
        text,
      });

      // Act
      const findings = vocabularyCheck(input);

      // Assert
      expect(findings).toStrictEqual(expected);
    },
  );

  it.each<{
    name: string;
    path: string;
    sections?: Sections;
    text: string;
  }>([
    {
      name: 'a longer word holds a concept',
      path: PRINCIPLES,
      text: '# Principles\n\nWrite the report at the portal.\n',
    },
    {
      name: 'a longer suffix begins with a suffix',
      path: PRINCIPLES,
      sections: {
        architecture: {
          suffixes: [
            '.cli',
          ],
        },
      },
      text: '# Principles\n\nLoad x.client.ts.\n',
    },
    {
      name: 'a suffix runs on into a name',
      path: PRINCIPLES,
      sections: {
        architecture: {
          suffixes: [
            '.port',
          ],
        },
      },
      text: '# Principles\n\nName it x.ports or x.port-x.\n',
    },
    {
      name: 'a longer folder ends with a folder',
      path: PRINCIPLES,
      text: '# Principles\n\nMove readapters/ and v2adapters/ and re-adapters/ away.\n',
    },
    {
      name: 'only code spans hold the concepts',
      path: PRINCIPLES,
      sections: {
        architecture: {
          concepts: [
            'entrypoint',
            'port',
          ],
        },
      },
      text: '# Principles\n\nList `ports` before `volumes`, and write `ENTRYPOINT` as JSON.\n',
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
      name: 'an architecture chapter uses the words of the architecture',
      path: ARCHITECTURE_PORTS,
      text: '# Ports\n\nEach port has adapters/ and x.port.ts.\n',
    },
    {
      name: 'a workflow chapter uses the words of the workflow',
      path: WORKFLOW_PORTS,
      text: '# Merges\n\nEach squash merge closes feature/login.\n',
    },
  ])('should find nothing when $name', ({ path, sections, text }) => {
    // Arrange
    const input = inputOf({
      path,
      sections,
      text,
    });

    // Act
    const findings = vocabularyCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
