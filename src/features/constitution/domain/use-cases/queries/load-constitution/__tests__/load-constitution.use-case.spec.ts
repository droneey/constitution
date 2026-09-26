import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import {
  loadedOf,
  mainFile,
  rule,
  textOf,
} from '../../../../../__tests__/constitution.fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';

const OUTSIDE =
  'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  'is not a block file; a block holds its main file, its chapters and with/<block>.md';

const uiMain = (chapters: readonly string[]): string =>
  mainFile({
    body: '# UI\n',
    chapters,
    id: 'ui',
    kind: 'domain',
  });

describe('loadConstitution', () => {
  it('should keep only the paths when the tree holds neither a block nor a document', () => {
    // Arrange
    const files = {
      'LICENSE.md': '# License\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded).toStrictEqual({
      constitution: {
        blocks: [],
        documents: {
          decisions: undefined,
          digests: {
            core: undefined,
            index: undefined,
          },
          hooks: undefined,
          marketplace: undefined,
          plugin: undefined,
          readme: undefined,
        },
        paths: new Set([
          'LICENSE.md',
        ]),
        requirementAnswers: [],
        rules: [],
      },
      findings: [],
    });
  });

  it('should parse the plugin documents and keep the README, the log and the digests as text when every document exists', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents).toStrictEqual({
      decisions: textOf({
        files,
        path: 'DECISIONS.md',
      }),
      digests: {
        core: GOLDEN_CORE,
        index: GOLDEN_INDEX,
      },
      hooks: {
        status: 'parsed',
        value: {
          commands: [],
        },
      },
      marketplace: {
        status: 'parsed',
        value: {
          plugins: [
            {
              name: 'constitution',
              source: './',
            },
          ],
        },
      },
      plugin: {
        status: 'parsed',
        value: {
          name: 'constitution',
          skills: [],
        },
      },
      readme: '# constitution\n\nStart with [core](blocks/core/core.md).\n',
    });
  });

  it('should load every block without a finding, ordered by layer and then by id, when a platform id sorts after a language id', () => {
    // Arrange
    const files = {
      ...validFiles(),
      'blocks/contexts/platforms/web/web.md': mainFile({
        body: '# Web\n',
        id: 'web',
        kind: 'context',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      blocks: loaded.constitution.blocks.map(
        (block) => `${block.layer} ${block.id}`,
      ),
      findings: loaded.findings,
    }).toStrictEqual({
      blocks: [
        'core core',
        'domain i18n',
        'domain remote-data',
        'domain ui',
        'domain untrusted-client',
        'platform browser',
        'platform web',
        'language typescript',
        'implementation _react',
        'implementation biome',
        'implementation lingui',
        'implementation react-dom',
      ],
      findings: [],
    });
  });

  it.each([
    'blocks/core',
    'blocks/domains/ui.md',
  ])(
    'should report %p as outside every block folder when it sits above the block folders',
    (path) => {
      // Arrange
      const files = {
        [path]: 'text\n',
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        {
          message: OUTSIDE,
          path,
        },
      ]);
    },
  );

  it.each([
    'blocks/domains/ui/.draft.md',
    'blocks/domains/ui/parts.mdx',
    'blocks/domains/ui/parts/a.md',
    'blocks/domains/ui/with/notes.txt',
  ])(
    'should report %p as a stray file when it is hidden, nested or not markdown',
    (path) => {
      // Arrange
      const files = {
        [path]: 'text\n',
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        {
          message: STRAY,
          path,
        },
      ]);
    },
  );

  it('should load the main file, the chapters in listed order, then the seams when a chapter and a seam share a name', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/a.md': '# A\n',
      'blocks/domains/ui/remote-data.md': '# Remote data\n\nText.',
      'blocks/domains/ui/ui.md': uiMain([
        'remote-data.md',
        'a.md',
      ]),
      'blocks/domains/ui/with/remote-data.md': '# UI with remote data\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      files: loaded.constitution.blocks.map((block) => block.files),
      findings: loaded.findings,
    }).toStrictEqual({
      files: [
        [
          {
            body: '\n# UI\n',
            lines: 15,
            path: 'blocks/domains/ui/ui.md',
            role: 'main',
            with: undefined,
          },
          {
            body: '# Remote data\n\nText.',
            lines: 3,
            path: 'blocks/domains/ui/remote-data.md',
            role: 'chapter',
            with: undefined,
          },
          {
            body: '# A\n',
            lines: 1,
            path: 'blocks/domains/ui/a.md',
            role: 'chapter',
            with: undefined,
          },
          {
            body: '# UI with remote data\n',
            lines: 1,
            path: 'blocks/domains/ui/with/remote-data.md',
            role: 'with',
            with: 'remote-data',
          },
        ],
      ],
      findings: [],
    });
  });

  it.each<{
    files: Files;
    finding: Finding;
  }>([
    {
      files: {
        'blocks/domains/ui/ui.md': uiMain([]),
        'blocks/domains/ui/with/i18n.md':
          '---\nid: i18n\n---\n# UI with i18n\n',
      },
      finding: {
        message: 'has front matter; only the main file of a block carries it',
        path: 'blocks/domains/ui/with/i18n.md',
      },
    },
    {
      files: {
        'blocks/domains/ui/parts.md': '# Parts\n',
        'blocks/domains/ui/ui.md': uiMain([]),
      },
      finding: {
        message: 'is not listed in the chapters of ui',
        path: 'blocks/domains/ui/parts.md',
      },
    },
    {
      files: {
        'blocks/domains/ui/parts.md': '# Parts\n',
        'blocks/domains/ui/ui.md': uiMain([
          'parts.md',
          'gone.md',
        ]),
      },
      finding: {
        message: 'lists the chapter gone.md, which does not exist',
        path: 'blocks/domains/ui/ui.md',
      },
    },
  ])(
    'should report "$finding.message" when a file breaks the layout of its block',
    ({ files, finding }) => {
      // Arrange
      const tree = files;

      // Act
      const loaded = loadedOf(tree);

      // Assert
      expect(loaded.findings).toStrictEqual([
        finding,
      ]);
    },
  );

  it.each<{
    files: Files;
    finding: Finding;
    name: string;
  }>([
    {
      files: {
        'blocks/core/principles.md': '# Principles\n',
      },
      finding: {
        message: 'has no main file core.md',
        path: 'blocks/core',
      },
      name: 'the core folder has no main file',
    },
    {
      files: {
        'blocks/domains/ui/parts.md': '# Parts\n',
      },
      finding: {
        message: 'has no main file ui.md',
        path: 'blocks/domains/ui',
      },
      name: 'a layer folder has no main file',
    },
    {
      files: {
        'blocks/domains/ui/ui.md': '# UI\n',
      },
      finding: {
        message: 'has no front matter; a main file opens with it',
        path: 'blocks/domains/ui/ui.md',
      },
      name: 'its main file has no front matter',
    },
  ])('should load no block and report why when $name', ({ files, finding }) => {
    // Arrange
    const tree = files;

    // Act
    const loaded = loadedOf(tree);

    // Assert
    expect({
      blocks: loaded.constitution.blocks,
      findings: loaded.findings,
    }).toStrictEqual({
      blocks: [],
      findings: [
        finding,
      ],
    });
  });

  it('should report every block that shares its id when three layers hold the same id', () => {
    // Arrange
    const files = {
      'blocks/contexts/platforms/ui/ui.md': mainFile({
        body: '# UI platform\n',
        id: 'ui',
        kind: 'context',
      }),
      'blocks/domains/ui/ui.md': uiMain([]),
      'blocks/implementations/ui/ui.md': mainFile({
        body: '# UI kit\n',
        id: 'ui',
        kind: 'implementation',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        message:
          'shares the id "ui" with blocks/contexts/platforms/ui/ui.md, blocks/implementations/ui/ui.md; an id names one block',
        path: 'blocks/domains/ui/ui.md',
      },
      {
        message:
          'shares the id "ui" with blocks/domains/ui/ui.md, blocks/implementations/ui/ui.md; an id names one block',
        path: 'blocks/contexts/platforms/ui/ui.md',
      },
      {
        message:
          'shares the id "ui" with blocks/domains/ui/ui.md, blocks/contexts/platforms/ui/ui.md; an id names one block',
        path: 'blocks/implementations/ui/ui.md',
      },
    ]);
  });

  it('should gather the rules, the answers and their findings of every block when they spread over main files, chapters and seams', () => {
    // Arrange
    const files = {
      'blocks/domains/i18n/i18n.md': mainFile({
        body: rule({
          slug: 'i18n-plurals-by-cldr',
        }),
        id: 'i18n',
        kind: 'domain',
      }),
      'blocks/implementations/lingui/catalogs.md': [
        '# Catalogs',
        '',
        '### loose · MUST',
        '',
        rule({
          slug: 'catalogs-are-compiled',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/lingui.md': mainFile({
        body: [
          '# Lingui',
          '',
          '## Requirements',
          '',
          '| `i18n-plurals-by-cldr` | ICU plural | met |',
          '| i18n typed keys | catalogs | met |',
          '',
        ].join('\n'),
        chapters: [
          'catalogs.md',
        ],
        id: 'lingui',
        kind: 'implementation',
      }),
      'blocks/implementations/lingui/with/react-dom.md': [
        '# Lingui with React DOM',
        '',
        rule({
          slug: 'provider-at-the-root',
        }),
      ].join('\n'),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers,
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((parsed) => [
        parsed.block,
        parsed.file,
        parsed.with,
        parsed.slug,
      ]),
    }).toStrictEqual({
      answers: [
        {
          block: 'lingui',
          file: 'blocks/implementations/lingui/lingui.md',
          how: 'ICU plural',
          requirement: 'i18n-plurals-by-cldr',
          status: 'met',
          with: undefined,
        },
      ],
      findings: [
        {
          message:
            'heading "### loose · MUST" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"',
          path: 'blocks/implementations/lingui/catalogs.md',
        },
        {
          message:
            'has the row "| i18n typed keys | catalogs | met |" in its Requirements, which is not "| `<requirement>` | <how> | <status> |"',
          path: 'blocks/implementations/lingui/lingui.md',
        },
      ],
      rules: [
        [
          'i18n',
          'blocks/domains/i18n/i18n.md',
          undefined,
          'i18n-plurals-by-cldr',
        ],
        [
          'lingui',
          'blocks/implementations/lingui/catalogs.md',
          undefined,
          'catalogs-are-compiled',
        ],
        [
          'lingui',
          'blocks/implementations/lingui/with/react-dom.md',
          'react-dom',
          'provider-at-the-root',
        ],
      ],
    });
  });

  it('should read neither rules nor answers when they sit in a code fence', () => {
    // Arrange
    const files = {
      'blocks/implementations/lingui/lingui.md': mainFile({
        body: [
          '# Lingui',
          '',
          '```markdown',
          rule({
            slug: 'sample-rule',
          }),
          '## Requirements',
          '| `sample-rule` | sample | met |',
          '```',
          '',
        ].join('\n'),
        id: 'lingui',
        kind: 'implementation',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers,
      rules: loaded.constitution.rules,
    }).toStrictEqual({
      answers: [],
      rules: [],
    });
  });
});
