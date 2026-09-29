import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';
import { Axis } from '#/kernel';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import {
  loadedOf,
  mainFile,
  rule,
  textOf,
} from '../../../../../__tests__/constitution.fixtures';
import { paraglideOnAxes } from '../../../../../__tests__/templates.fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { BlockFileRole } from '../../../../entities';

const OUTSIDE =
  'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations';
const STRAY =
  'is not a block file; a block holds its card <id>.md and, in foundation/, architecture/ or workflow/, its chapters and with/<block>.md';

const UI_CARD = mainFile({
  body: '# UI\n',
  id: 'ui',
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
        bindings: [],
        blocks: [],
        documents: {
          agents: [],
          decisions: undefined,
          digests: {
            core: undefined,
            index: undefined,
          },
          hooks: undefined,
          marketplace: undefined,
          plugin: undefined,
          readme: undefined,
          skills: [],
          vocabulary: undefined,
        },
        paths: new Set([
          'LICENSE.md',
        ]),
        presets: [],
        requirementAnswers: [],
        rules: [],
      },
      findings: [],
    });
  });

  it('should parse the plugin documents and the vocabulary and keep the README, the log and the digests as text when every document exists', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents).toStrictEqual({
      agents: [],
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
              ref: 'v1.0.0',
              repo: 'droneey/constitution',
            },
          ],
        },
      },
      plugin: {
        status: 'parsed',
        value: {
          name: 'constitution',
          repository: 'https://github.com/droneey/constitution',
          skills: [],
        },
      },
      readme: '# constitution\n\nStart with [core](blocks/core/core.md).\n',
      skills: [],
      vocabulary: {
        status: 'parsed',
        vocabulary: {
          architecture: {
            concepts: [
              'port',
              'binding unit',
            ],
            folders: [
              'adapters/',
            ],
            suffixes: [
              '.port',
            ],
          },
          workflow: {
            concepts: [
              'squash merge',
            ],
            folders: [
              'feature/',
            ],
            suffixes: [],
          },
        },
      },
    });
  });

  it("should read each skill's front matter when SKILL.md files sit in skill folders, hidden folders and loose files aside", () => {
    // Arrange
    const files = {
      '.claude/skills/local/SKILL.md': '---\nname: local\n---\n',
      'SKILL.md': '---\nname: root\n---\n',
      'skills/SKILL.md': '---\nname: loose\n---\n',
      'skills/amend/SKILL.md': '# Amend\n',
      'skills/ratify/SKILL.md':
        '---\nname: ratify\ndescription: Writes constitution.yaml.\n---\n\n# Ratify\n',
      'tools/skills/check/SKILL.md': '---\nname: [check\n---\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents.skills).toStrictEqual([
      {
        directory: 'skills/',
        frontMatter: undefined,
        path: 'skills/amend/SKILL.md',
      },
      {
        directory: 'skills/',
        frontMatter: {
          description: 'Writes constitution.yaml.',
          name: 'ratify',
          status: 'parsed',
        },
        path: 'skills/ratify/SKILL.md',
      },
      {
        directory: 'tools/skills/',
        frontMatter: {
          reason:
            'Flow sequence in block collection must be sufficiently indented and end with a ]',
          status: 'not-yaml',
        },
        path: 'tools/skills/check/SKILL.md',
      },
    ]);
  });

  it("should read each agent's front matter when files sit directly in agents/, nested, hidden and other files aside", () => {
    // Arrange
    const files = {
      '.claude/agents/local.md': '---\nname: local\n---\n',
      'agents/.draft.md': '---\nname: draft\n---\n',
      'agents/notes/reviewer.md': '---\nname: nested\n---\n',
      'agents/reviewer.md.orig': '---\nname: backup\n---\n',
      'agents/reviewer.md':
        '---\nname: reviewer\ndescription: Reviews files.\n---\n\nYou review.\n',
      'agents/scribe.md': '# Scribe\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents.agents).toStrictEqual([
      {
        file: 'reviewer',
        frontMatter: {
          description: 'Reviews files.',
          name: 'reviewer',
          status: 'parsed',
        },
        path: 'agents/reviewer.md',
      },
      {
        file: 'scribe',
        frontMatter: undefined,
        path: 'agents/scribe.md',
      },
    ]);
  });

  it('should load a block written from templates/block.md without a finding when its placeholders are filled and its rules sit in an axis chapter', () => {
    // Arrange
    const files = paraglideOnAxes();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers.map(
        (answer) => `${answer.requirement} ${answer.met}`,
      ),
      blocks: loaded.constitution.blocks.map(
        (block) => `${block.layer} ${block.id}`,
      ),
      findings: loaded.findings,
      rules: loaded.constitution.rules.map(
        (parsed) => `${parsed.slug} ${parsed.level}`,
      ),
    }).toStrictEqual({
      answers: [
        'i18n-plurals-by-cldr yes',
      ],
      blocks: [
        'implementation paraglide',
      ],
      findings: [],
      rules: [
        'paraglide-messages-by-function MUST',
      ],
    });
  });

  it('should load every block without a finding, ordered by layer and then by id, when a platform id sorts after a language id', () => {
    // Arrange
    const files = {
      ...validFiles(),
      'blocks/contexts/platforms/web/web.md': mainFile({
        body: '# Web\n',
        id: 'web',
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
    'blocks/domains/ui/parts.md',
    'blocks/domains/ui/with/remote-data.md',
    'blocks/domains/ui/design/parts.md',
    'blocks/domains/ui/design/with/remote-data.md',
    'blocks/domains/ui/foundation',
    'blocks/domains/ui/foundation/.draft.md',
    'blocks/domains/ui/foundation/parts.mdx',
    'blocks/domains/ui/foundation/parts/a.md',
    'blocks/domains/ui/foundation/old.md/a.md',
    'blocks/domains/ui/foundation/with/notes.txt',
    'blocks/domains/ui/foundation/with/old.md/a.md',
  ])(
    'should report %p as a stray file when it is hidden, nested, not markdown or outside an axis folder',
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

  it('should load the card, the chapters by axis with the one named after the block first, then the seams by axis, when the tree lists them otherwise', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/architecture/remote-data.md': '# Remote data\n\nText.',
      'blocks/domains/ui/architecture/with/remote-data.md':
        '# UI with remote data\n',
      'blocks/domains/ui/foundation/a.md': '# A\n',
      'blocks/domains/ui/foundation/ui.md': '# UI\n',
      'blocks/domains/ui/foundation/with/i18n.md': '# UI with i18n\n',
      'blocks/domains/ui/ui.md': UI_CARD,
      'blocks/domains/ui/workflow/reviews.md': '# Reviews\n',
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
            axis: undefined,
            body: '\n# UI\n',
            lines: 14,
            path: 'blocks/domains/ui/ui.md',
            role: BlockFileRole.Main,
            with: undefined,
          },
          {
            axis: Axis.Foundation,
            body: '# UI\n',
            lines: 1,
            path: 'blocks/domains/ui/foundation/ui.md',
            role: BlockFileRole.Chapter,
            with: undefined,
          },
          {
            axis: Axis.Foundation,
            body: '# A\n',
            lines: 1,
            path: 'blocks/domains/ui/foundation/a.md',
            role: BlockFileRole.Chapter,
            with: undefined,
          },
          {
            axis: Axis.Architecture,
            body: '# Remote data\n\nText.',
            lines: 3,
            path: 'blocks/domains/ui/architecture/remote-data.md',
            role: BlockFileRole.Chapter,
            with: undefined,
          },
          {
            axis: Axis.Workflow,
            body: '# Reviews\n',
            lines: 1,
            path: 'blocks/domains/ui/workflow/reviews.md',
            role: BlockFileRole.Chapter,
            with: undefined,
          },
          {
            axis: Axis.Foundation,
            body: '# UI with i18n\n',
            lines: 1,
            path: 'blocks/domains/ui/foundation/with/i18n.md',
            role: BlockFileRole.With,
            with: 'i18n',
          },
          {
            axis: Axis.Architecture,
            body: '# UI with remote data\n',
            lines: 1,
            path: 'blocks/domains/ui/architecture/with/remote-data.md',
            role: BlockFileRole.With,
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
        'blocks/domains/ui/foundation/with/i18n.md':
          '---\nid: i18n\n---\n# UI with i18n\n',
        'blocks/domains/ui/ui.md': UI_CARD,
      },
      finding: {
        message: 'has front matter; only the main file of a block carries it',
        path: 'blocks/domains/ui/foundation/with/i18n.md',
      },
    },
    {
      files: {
        'blocks/domains/ui/ui.md': UI_CARD,
        'blocks/domains/ui/workflow/reviews.md': '---\nid: reviews\n---\n',
      },
      finding: {
        message: 'has front matter; only the main file of a block carries it',
        path: 'blocks/domains/ui/workflow/reviews.md',
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
        'blocks/core/foundation/principles.md': '# Principles\n',
      },
      finding: {
        message: 'has no main file core.md',
        path: 'blocks/core',
      },
      name: 'the core folder has no main file',
    },
    {
      files: {
        'blocks/domains/ui/foundation/parts.md': '# Parts\n',
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
      }),
      'blocks/domains/ui/ui.md': UI_CARD,
      'blocks/implementations/ui/ui.md': mainFile({
        body: '# UI kit\n',
        id: 'ui',
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

  it('should gather the rules, the answers and their findings of every block when they spread over cards, chapters and seams', () => {
    // Arrange
    const files = {
      'blocks/domains/i18n/foundation/i18n.md': rule({
        slug: 'i18n-plurals-by-cldr',
      }),
      'blocks/domains/i18n/i18n.md': mainFile({
        body: '# i18n\n',
        id: 'i18n',
      }),
      'blocks/implementations/lingui/architecture/with/react-dom.md': [
        '# Lingui with React DOM',
        '',
        rule({
          slug: 'provider-at-the-root',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/workflow/catalogs.md': [
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
          '| `i18n-plurals-by-cldr` | ICU plural | yes |',
          '| i18n typed keys | catalogs | yes |',
          '',
        ].join('\n'),
        id: 'lingui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers,
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((parsed) => [
        parsed.block,
        parsed.axis,
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
          met: 'yes',
          requirement: 'i18n-plurals-by-cldr',
          with: undefined,
        },
      ],
      findings: [
        {
          message:
            'heading "### loose · MUST" looks like a rule but is not "## <slug> · <LEVEL>", "## <slug> → <parent>" or "## <slug> → <parent> · <LEVEL>"',
          path: 'blocks/implementations/lingui/workflow/catalogs.md',
        },
        {
          message:
            'has the row "| i18n typed keys | catalogs | yes |" in its Requirements, which is not "| `<requirement>` | <how> | <met> |"',
          path: 'blocks/implementations/lingui/lingui.md',
        },
      ],
      rules: [
        [
          'i18n',
          'foundation',
          'blocks/domains/i18n/foundation/i18n.md',
          undefined,
          'i18n-plurals-by-cldr',
        ],
        [
          'lingui',
          'workflow',
          'blocks/implementations/lingui/workflow/catalogs.md',
          undefined,
          'catalogs-are-compiled',
        ],
        [
          'lingui',
          'architecture',
          'blocks/implementations/lingui/architecture/with/react-dom.md',
          'react-dom',
          'provider-at-the-root',
        ],
      ],
    });
  });

  it('should flatten the bindings of a tool by axis, part and rule and keep every preset file with its text when bindings.yaml sits beside the parts', () => {
    // Arrange
    const files: Files = {
      ...validFiles(),
      'presets/typescript/biome/bindings.yaml': [
        'architecture:',
        '  core:',
        '    reads-are-cancellable: [surface.grit]',
        'foundation:',
        '  _react:',
        '    hooks-at-top-level: [useHookAtTopLevel, useExhaustiveDependencies]',
        '',
      ].join('\n'),
      'presets/typescript/biome/foundation/_react.jsonc': '{}\n',
      'presets/typescript/biome/notes/bindings.yaml': 'foundation: {}\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      bindings: loaded.constitution.bindings,
      findings: loaded.findings,
      presets: loaded.constitution.presets.map((preset) => preset.path),
    }).toStrictEqual({
      bindings: [
        {
          axis: Axis.Foundation,
          file: 'presets/typescript/biome/bindings.yaml',
          part: '_react',
          rule: 'hooks-at-top-level',
          scope: 'typescript',
          setting: 'useHookAtTopLevel',
          tool: 'biome',
        },
        {
          axis: Axis.Foundation,
          file: 'presets/typescript/biome/bindings.yaml',
          part: '_react',
          rule: 'hooks-at-top-level',
          scope: 'typescript',
          setting: 'useExhaustiveDependencies',
          tool: 'biome',
        },
        {
          axis: Axis.Architecture,
          file: 'presets/typescript/biome/bindings.yaml',
          part: 'core',
          rule: 'reads-are-cancellable',
          scope: 'typescript',
          setting: 'surface.grit',
          tool: 'biome',
        },
      ],
      findings: [],
      presets: [
        'presets/typescript/biome/bindings.yaml',
        'presets/typescript/biome/foundation/_react.jsonc',
        'presets/typescript/biome/notes/bindings.yaml',
      ],
    });
  });

  it.each([
    {
      message:
        'is not valid YAML: Unexpected flow-seq-end token in YAML stream: "]"',
      name: 'the file is not YAML',
      text: 'foundation: ]\n',
    },
    {
      message:
        'does not match its schema: <root>: Invalid input: expected record, received array',
      name: 'the file is a list',
      text: '- foundation\n',
    },
    {
      message:
        'does not match its schema: foundation.core.no-any: Too small: expected array to have >=1 items',
      name: 'a rule lists no setting',
      text: 'foundation:\n  core:\n    no-any: []\n',
    },
  ])(
    'should report the bindings and load none when $name',
    ({ message, text }) => {
      // Arrange
      const files: Files = {
        ...validFiles(),
        'presets/typescript/biome/bindings.yaml': text,
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect({
        bindings: loaded.constitution.bindings,
        findings: loaded.findings,
      }).toStrictEqual({
        bindings: [],
        findings: [
          {
            message,
            path: 'presets/typescript/biome/bindings.yaml',
          },
        ],
      });
    },
  );

  it('should report the rule and load none when it sits in the card', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/ui.md': mainFile({
        body: `# UI\n\n${rule({
          slug: 'four-data-states',
        })}`,
        id: 'ui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      findings: loaded.findings,
      rules: loaded.constitution.rules,
    }).toStrictEqual({
      findings: [
        {
          message:
            'rule "four-data-states" sits in the card; a block\'s rules live in foundation/, architecture/ or workflow/',
          path: 'blocks/domains/ui/ui.md',
        },
      ],
      rules: [],
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
          '| `sample-rule` | sample | yes |',
          '```',
          '',
        ].join('\n'),
        id: 'lingui',
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
