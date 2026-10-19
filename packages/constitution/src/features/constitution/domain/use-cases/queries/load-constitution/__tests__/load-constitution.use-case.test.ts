import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import {
  blockFiles,
  findingOf,
  loadedOf,
  packSourceOf,
  passportFile,
  rule,
  textOf,
  without,
} from '../../../../../__tests__/constitution.fixtures';
import { packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { paraglideCard } from '../../../../../__tests__/templates.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { BlockFileRole } from '../../../../entities';
import { loadConstitution } from '../load-constitution.use-case';

const UI_PASSPORT = passportFile({
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
        repositoryPaths: new Set([
          'LICENSE.md',
        ]),
        requirementAnswers: [],
        rules: [],
      },
      findings: [],
    });
  });

  it('should parse the plugin documents and the vocabulary and keep the README and the log as text when every document exists', () => {
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
              path: '',
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

  it('should load a block written from templates/block/ without a finding when its placeholders are filled and its rules sit in foundation', () => {
    // Arrange
    const files = paraglideCard();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      answers: loaded.constitution.requirementAnswers.map(
        (answer) => `${answer.requirement} ${answer.met}`,
      ),
      blocks: loaded.constitution.blocks.map((block) => `${block.layer} ${block.id}`),
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((parsed) => `${parsed.slug} ${parsed.level}`),
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
      ...blockFiles({
        body: '# Web\n',
        dir: 'blocks/contexts/platforms/web',
        id: 'web',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      blocks: loaded.constitution.blocks.map((block) => `${block.layer} ${block.id}`),
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
        findingOf({
          code: 'outside-block-folder',
          path,
        }),
      ]);
    },
  );

  it.each([
    'blocks/domains/ui/parts.md',
    'blocks/domains/ui/with/i18n.md',
    'blocks/domains/ui/design/with/remote-data.md',
    'blocks/domains/ui/architecture',
    'blocks/domains/ui/.draft.md',
    'blocks/domains/ui/parts.mdx',
    'blocks/domains/ui/parts/a.md',
    'blocks/domains/ui/old.md/a.md',
    'blocks/domains/ui/with/notes.txt',
    'blocks/domains/ui/with/old.md/a.md',
    'blocks/domains/ui/architecture/.draft.md',
    'blocks/domains/ui/architecture/parts/a.md',
    'blocks/domains/ui/workflow/with/notes.txt',
  ])(
    "should report %p as a stray file when it sits at the block's root beside its passport, is hidden, nested, not markdown or in a folder that is neither an axis nor with/",
    (path) => {
      // Arrange
      const files = {
        [path]: 'text\n',
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        findingOf({
          code: 'stray-block-file',
          path,
        }),
      ]);
    },
  );

  it('should load the passport, the chapters by axis, then the seams by axis, when the tree lists them otherwise', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/architecture/remote-data.md': '# Remote data\n\nText.',
      'blocks/domains/ui/architecture/with/remote-data.md': '# UI with remote data\n',
      'blocks/domains/ui/foundation/b.md': '# B\n',
      'blocks/domains/ui/foundation/a.md': '# A\n',
      'blocks/domains/ui/foundation/with/i18n.md': '# UI with i18n\n',
      'blocks/domains/ui/ui.md': UI_PASSPORT,
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
            axis: Axis.Foundation,
            body: '\n# UI\n',
            lines: 12,
            path: 'blocks/domains/ui/ui.md',
            role: BlockFileRole.Passport,
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
            axis: Axis.Foundation,
            body: '# B\n',
            lines: 1,
            path: 'blocks/domains/ui/foundation/b.md',
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
        'blocks/domains/ui/foundation/with/i18n.md': '---\nid: i18n\n---\n# UI with i18n\n',
        'blocks/domains/ui/ui.md': UI_PASSPORT,
      },
      finding: findingOf({
        code: 'front-matter-outside-passport',
        path: 'blocks/domains/ui/foundation/with/i18n.md',
      }),
    },
    {
      files: {
        'blocks/domains/ui/architecture/ui.md': '# UI\n',
        'blocks/domains/ui/ui.md': UI_PASSPORT,
      },
      finding: findingOf({
        code: 'chapter-named-after-its-block',
        path: 'blocks/domains/ui/architecture/ui.md',
      }),
    },
  ])(
    'should report $finding.code when a file breaks the layout of its block',
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
        'blocks/domains/ui/foundation/screens.md': '# Screens\n',
      },
      finding: findingOf({
        code: 'block-without-passport',
        names: [
          'ui.md',
        ],
        path: 'blocks/domains/ui',
      }),
      name: 'a layer folder has no passport',
    },
    {
      files: {
        'blocks/domains/ui/ui.md': '# UI\n',
      },
      finding: findingOf({
        code: 'front-matter-missing',
        path: 'blocks/domains/ui/ui.md',
      }),
      name: 'its passport has no front matter',
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
      'blocks/contexts/platforms/ui/ui.md': passportFile({
        body: '# UI platform\n',
        id: 'ui',
      }),
      'blocks/domains/ui/ui.md': UI_PASSPORT,
      'blocks/implementations/ui/ui.md': passportFile({
        body: '# UI kit\n',
        id: 'ui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      findingOf({
        code: 'block-id-shared',
        names: [
          'ui',
          'blocks/contexts/platforms/ui/ui.md, blocks/implementations/ui/ui.md',
        ],
        path: 'blocks/domains/ui/ui.md',
      }),
      findingOf({
        code: 'block-id-shared',
        names: [
          'ui',
          'blocks/domains/ui/ui.md, blocks/implementations/ui/ui.md',
        ],
        path: 'blocks/contexts/platforms/ui/ui.md',
      }),
      findingOf({
        code: 'block-id-shared',
        names: [
          'ui',
          'blocks/domains/ui/ui.md, blocks/contexts/platforms/ui/ui.md',
        ],
        path: 'blocks/implementations/ui/ui.md',
      }),
    ]);
  });

  it('should gather the rules, the answers and their findings of every block when they spread over passports, chapters and seams', () => {
    // Arrange
    const files = {
      'blocks/domains/i18n/foundation/plurals.md': `# i18n\n\n${rule({
        slug: 'i18n-plurals-by-cldr',
      })}`,
      'blocks/domains/i18n/i18n.md': passportFile({
        body: '# i18n\n',
        id: 'i18n',
      }),
      'blocks/implementations/lingui/architecture/with/react-dom.md': [
        '# React DOM',
        '',
        rule({
          slug: 'provider-at-the-root',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/workflow/catalogs.md': [
        '# Catalogs',
        '',
        '## loose · MUST',
        '',
        rule({
          slug: 'catalogs-are-compiled',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/lingui.md': passportFile({
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
        findingOf({
          code: 'rule-heading-misshapen',
          names: [
            '## loose · MUST',
          ],
          path: 'blocks/implementations/lingui/workflow/catalogs.md',
        }),
        findingOf({
          code: 'requirements-row-misshapen',
          names: [
            '| i18n typed keys | catalogs | yes |',
          ],
          path: 'blocks/implementations/lingui/lingui.md',
        }),
      ],
      rules: [
        [
          'i18n',
          'foundation',
          'blocks/domains/i18n/foundation/plurals.md',
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

  it('should flatten the bindings of a tool by part and rule, on the axis of the folder that holds them, and keep every preset file with its text when bindings.yaml sits beside the parts', () => {
    // Arrange
    const files: Files = {
      ...validFiles(),
      'presets/typescript/biome/foundation/bindings.yaml': [
        '_react:',
        '  hooks-at-top-level: [useHookAtTopLevel, useExhaustiveDependencies]',
        '',
      ].join('\n'),
      'presets/typescript/biome/foundation/_react.jsonc': '{}\n',
      'presets/typescript/biome/architecture/bindings.yaml': [
        'core:',
        '  reads-are-cancellable: [surface.grit]',
        '',
      ].join('\n'),
      'presets/typescript/biome/notes/bindings.yaml': 'core: {}\n',
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
          axis: Axis.Architecture,
          file: 'presets/typescript/biome/architecture/bindings.yaml',
          part: 'core',
          rule: 'reads-are-cancellable',
          scope: 'typescript',
          setting: 'surface.grit',
          tool: 'biome',
        },
        {
          axis: Axis.Foundation,
          file: 'presets/typescript/biome/foundation/bindings.yaml',
          part: '_react',
          rule: 'hooks-at-top-level',
          scope: 'typescript',
          setting: 'useHookAtTopLevel',
          tool: 'biome',
        },
        {
          axis: Axis.Foundation,
          file: 'presets/typescript/biome/foundation/bindings.yaml',
          part: '_react',
          rule: 'hooks-at-top-level',
          scope: 'typescript',
          setting: 'useExhaustiveDependencies',
          tool: 'biome',
        },
      ],
      findings: [],
      presets: [
        'presets/typescript/biome/architecture/bindings.yaml',
        'presets/typescript/biome/foundation/_react.jsonc',
        'presets/typescript/biome/foundation/bindings.yaml',
        'presets/typescript/biome/notes/bindings.yaml',
      ],
    });
  });

  it.each([
    {
      code: 'bindings-not-yaml',
      name: 'the file is not YAML',
      names: [
        'Unexpected flow-seq-end token in YAML stream: "]"',
      ],
      text: 'core: ]\n',
    },
    {
      code: 'bindings-off-schema',
      name: 'the file is a list',
      names: [
        '<root>',
        'Invalid input: expected record, received array',
      ],
      text: '- core\n',
    },
    {
      code: 'bindings-off-schema',
      name: 'a rule lists no setting',
      names: [
        'core.any-never-typed',
        'Too small: expected array to have >=1 items',
      ],
      text: 'core:\n  any-never-typed: []\n',
    },
  ])('should report the bindings and load none when $name', ({ code, names, text }) => {
    // Arrange
    const files: Files = {
      ...validFiles(),
      'presets/typescript/biome/foundation/bindings.yaml': text,
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
        findingOf({
          code,
          names,
          path: 'presets/typescript/biome/foundation/bindings.yaml',
        }),
      ],
    });
  });

  it('should read neither rules nor answers when they sit in a code fence', () => {
    // Arrange
    const files = {
      'blocks/implementations/lingui/foundation/samples.md': [
        '# Samples',
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
      'blocks/implementations/lingui/lingui.md': passportFile({
        body: '# Lingui\n',
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

  it("should load the base's blocks beside the pack's, apart in their paths, and read the base's vocabulary when the pack holds none", () => {
    // Arrange
    const source = packSourceOf({
      base: validFiles(),
      pack: packFiles(),
    });

    // Act
    const { constitution } = loadConstitution(source);

    // Assert
    expect({
      paths: constitution.blocks
        .map((block) => block.path)
        .filter((path) => path.includes('acme') || path.includes('core/')),
      vocabulary: constitution.documents.vocabulary?.status,
    }).toStrictEqual({
      paths: [
        '(base)/blocks/core/core.md',
        'blocks/implementations/acme/acme.md',
      ],
      vocabulary: 'parsed',
    });
  });

  it('should read no vocabulary when neither the pack nor its base holds one', () => {
    // Arrange
    const source = packSourceOf({
      base: without({
        files: validFiles(),
        path: 'vocabulary.yaml',
      }),
      pack: packFiles(),
    });

    // Act
    const { constitution } = loadConstitution(source);

    // Assert
    expect(constitution.documents.vocabulary).toBeUndefined();
  });
});
