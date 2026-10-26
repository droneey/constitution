import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { Axis } from '#/kernel/constants';

import type { Files } from '../../../../../__tests__/presets.fixtures';
import { presetFileParser, presetsModel } from '../../../../../__tests__/presets.fixtures';
import { createFakeReleaseBuilds } from '../../../../../__tests__/release-builds.fake';
import type { PresetsFinding } from '../../../../entities';
import { PresetsCode } from '../../../../entities';
import { checkPresets } from '../check-presets.use-case';

const FOLDER = '/work/constitution';
const FOUNDATION = 'presets/biome/foundation.yaml';

const findingsOf = (input: {
  builds?: Readonly<Record<string, string>>;
  isRelease?: boolean;
  presets: Files;
  unreadable?: readonly string[];
}): readonly PresetsFinding[] =>
  checkPresets({
    files: createFakeProjectFiles({
      files: Object.fromEntries(
        Object.entries(input.presets).map(([path, text]) => [
          `${FOLDER}/presets/${path}`,
          text,
        ]),
      ),
      unreadable: (input.unreadable ?? []).map((path) => `${FOLDER}/presets/${path}`),
    }),
    folder: FOLDER,
    builds: createFakeReleaseBuilds(input.builds),
    isRelease: input.isRelease ?? true,
    model: presetsModel,
    parser: presetFileParser,
  });

// A preset file of one entry, in biome's foundation.
const entryOf = (input: {
  block?: string;
  file?: string;
  language?: string;
  rule?: string;
  value?: string;
}): string =>
  [
    `${input.block ?? 'biome'}:`,
    `  '${input.rule ?? '*'}':`,
    `    '${input.language ?? '*'}':`,
    `      '${input.file ?? 'biome.json'}':`,
    `        ${input.value ?? 'width: 100'}`,
  ].join('\n');

describe('checkPresets', () => {
  it('should find nothing when every preset file is sound', () => {
    // Arrange
    const presets = {
      'biome/architecture.yaml': entryOf({
        block: 'core',
        rule: 'import-points-inward',
        value: "files: ['${role.gateway}/**', '${role.source}/**']",
      }),
      'biome/foundation.yaml': entryOf({
        language: 'typescript',
        value: "includes: ['!!${workspace.members}', '**/*.ts', '.gitignore', 'docs/**']",
      }),
      'biome/foundation/with/ui.yaml': entryOf({
        block: 'core',
      }),
      'biome/workflow.yaml': entryOf({
        block: 'core',
        rule: 'file-within-500-lines',
      }),
      'biome/foundation/with/css/with/browser.yaml': entryOf({
        block: 'css',
        rule: 'css-loaded-by-the-bundle',
      }),
      'biome/plugins/typescript/unchecked-type-never-used.grit': 'language js',
      'biome/typescript/self.jsonc': '{}',
      'bun/foundation.yaml': [
        'bun:',
        "  '*':",
        "    '*':",
        '      bunfig.toml ? !${workspace.isRoot}:',
        '        top: ${file.isTop}',
        '        flags:',
        '          - ${workspace.isRoot}',
        '        preload:',
        '          - ${constitution.path}/presets/biome/plugins/typescript/unchecked-type-never-used.grit',
        '          - ${constitution.path}/presets/biome/typescript/',
        "      '${role.source}/sandbox.ts': !default |",
        '        // the fixture of src/ and of *.adapter.ts',
      ].join('\n'),
    };

    // Act
    const findings = findingsOf({
      presets,
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    findings: readonly PresetsFinding[];
    presets: Files;
    unreadable?: readonly string[];
  }>([
    {
      condition: 'a YAML file lies where no preset file may',
      findings: [
        {
          code: PresetsCode.PresetFileMisplaced,
          details: {},
          path: 'presets/biome/foundations.yaml',
        },
      ],
      presets: {
        'biome/foundations.yaml': entryOf({}),
      },
    },
    {
      condition: 'a preset file does not parse',
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details: {
            line: 2,
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': 'biome:\n  - [',
      },
    },
    {
      condition: 'a preset file cannot be read',
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details: {},
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({}),
      },
      unreadable: [
        'biome/foundation.yaml',
      ],
    },
    {
      condition: 'a preset file holds no map, or a key holds a scalar where the next key is due',
      findings: [
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [],
          },
          path: 'presets/biome/architecture.yaml',
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'biome',
              '*',
            ],
          },
          path: FOUNDATION,
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'core',
              '*',
              '*',
            ],
          },
          path: 'presets/biome/foundation/with/ui.yaml',
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'biome',
            ],
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/architecture.yaml': '- biome',
        'biome/foundation.yaml': "biome:\n  '*': biome.json",
        'biome/foundation/with/ui.yaml': "core:\n  '*':\n    '*': biome.json",
        'biome/workflow.yaml': 'biome: biome.json',
      },
    },
  ])(
    'should find what is wrong with a preset file file when $condition',
    ({ findings, presets, unreadable }) => {
      // Act
      const found = findingsOf({
        presets,
        ...(unreadable === undefined
          ? {}
          : {
              unreadable,
            }),
      });

      // Assert
      expect(found).toStrictEqual(findings);
    },
  );

  it.each<{
    condition: string;
    findings: readonly PresetsFinding[];
    presets: Files;
  }>([
    {
      condition: 'its reader is no block',
      findings: [
        {
          code: PresetsCode.UnknownReader,
          details: {
            reader: 'gone',
          },
          path: 'presets/gone/foundation.yaml',
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'gone/foundation/with/core.yaml',
            block: 'core',
            rule: '*',
          },
          path: 'presets/gone/foundation.yaml',
        },
      ],
      presets: {
        'gone/foundation.yaml': entryOf({
          block: 'core',
        }),
      },
    },
    {
      condition: 'its path names a block that is none',
      findings: [
        {
          code: PresetsCode.UnknownBlock,
          details: {
            block: 'gone',
          },
          path: 'presets/biome/foundation/with/gone.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/gone.yaml': entryOf({}),
      },
    },
    {
      condition: 'its key names a block that is none',
      findings: [
        {
          code: PresetsCode.UnknownBlock,
          details: {
            block: 'gone',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'gone',
        }),
      },
    },
    {
      condition: 'its key names a rule that is none',
      findings: [
        {
          code: PresetsCode.UnknownRule,
          details: {
            block: 'biome',
            rule: 'gone',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          rule: 'gone',
        }),
      },
    },
    {
      condition: 'its key names a block of no language, or a language that is none',
      findings: [
        {
          code: PresetsCode.UnknownLanguage,
          details: {
            block: 'biome',
            language: 'biome',
            rule: '*',
          },
          path: FOUNDATION,
        },
        {
          code: PresetsCode.UnknownLanguage,
          details: {
            block: 'biome',
            language: 'cobol',
            rule: '*',
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          language: 'biome',
        }),
        'biome/workflow.yaml': entryOf({
          language: 'cobol',
        }),
      },
    },
    {
      condition: 'its key block is the partner of its own rule’s seam',
      findings: [
        {
          code: PresetsCode.RuleOfAnotherBlock,
          details: {
            block: 'browser',
            owner: 'css',
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/browser.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/browser.yaml': entryOf({
          block: 'browser',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition:
        'its path names a partner its rule has none of, or another partner than its rule’s',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'biome/foundation/with/css.yaml',
            block: 'css',
            rule: '*',
          },
          path: 'presets/biome/foundation/with/css/with/browser.yaml',
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'biome/foundation/with/css/with/browser.yaml',
            block: 'css',
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/css/with/ui.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/css/with/browser.yaml': entryOf({
          block: 'css',
        }),
        'biome/foundation/with/css/with/ui.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition: 'its rule is another block’s',
      findings: [
        {
          code: PresetsCode.RuleOfAnotherBlock,
          details: {
            block: 'biome',
            owner: 'core',
            rule: 'file-within-500-lines',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          rule: 'file-within-500-lines',
        }),
      },
    },
    {
      condition: 'its key block lies beyond the reader and its path does not name it',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'biome/foundation/with/ui.yaml',
            block: 'ui',
            rule: '*',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'ui',
        }),
      },
    },
    {
      condition:
        'its rule’s seam partner lies beyond the reader and its path names only the key block',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'biome/foundation/with/css/with/browser.yaml',
            block: 'css',
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/css.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/css.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition: 'its path names the blocks it needs in the other order',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: 'biome/foundation/with/css/with/browser.yaml',
            block: 'css',
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/browser/with/css.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/browser/with/css.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition: 'its rule is of an axis its preset file’s does not stand on',
      findings: [
        {
          code: PresetsCode.EntryOffItsAxis,
          details: {
            block: 'core',
            rule: 'import-points-inward',
            ruleAxis: Axis.Architecture,
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/workflow.yaml': entryOf({
          block: 'core',
          rule: 'import-points-inward',
        }),
      },
    },
  ])('should find what is wrong with an entry’s key when $condition', ({ findings, presets }) => {
    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual(findings);
  });

  it.each<{
    condition: string;
    entry: string;
    finding: PresetsFinding;
  }>([
    {
      condition: 'its file starts at the root of the file system',
      entry: entryOf({
        file: '/biome.json',
      }),
      finding: {
        code: PresetsCode.FileOutsideItsUnit,
        details: {
          block: 'biome',
          file: '/biome.json',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its file climbs out of its unit',
      entry: entryOf({
        file: '../biome.json',
      }),
      finding: {
        code: PresetsCode.FileOutsideItsUnit,
        details: {
          block: 'biome',
          file: '../biome.json',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard names a fact that is no truth',
      entry: entryOf({
        file: 'biome.json ? ${package.name}',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${package.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its whole file’s text names a fact no one computes',
      entry: entryOf({
        file: '.gitignore',
        value: "!default '${file.name}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a map in a list names a fact no one computes',
      entry: entryOf({
        value: "rules: [{name: '${file.name}'}]",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its whole value is a text that types a role by hand',
      entry: entryOf({
        value: 'src/x',
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: 'biome',
          role: 'source',
          rule: '*',
          term: 'src/',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it names a fact no one computes, twice',
      entry: entryOf({
        value: "name: '${file.name}-${file.name}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a truth stands inside a text',
      entry: entryOf({
        value: "top: 'is ${file.isTop}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${file.isTop}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a truth stands as a key',
      entry: entryOf({
        value: "'${workspace.isRoot}': 1",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${workspace.isRoot}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the path of its file names a fact but a role',
      entry: entryOf({
        file: '${package.name}.json',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: 'biome',
          fact: '${package.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it names a role no term carries',
      entry: entryOf({
        value: 'files: ${role.gone}',
      }),
      finding: {
        code: PresetsCode.UnknownRole,
        details: {
          block: 'biome',
          role: 'gone',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it types a folder by hand',
      entry: entryOf({
        value: 'files: src/**',
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: 'biome',
          role: 'source',
          term: 'src/',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it types a suffix by hand',
      entry: entryOf({
        value: "files: '**/*.adapter.ts'",
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: 'biome',
          role: 'gateway-file',
          term: '.adapter',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the members stand as a value',
      entry: entryOf({
        value: 'skip: ${workspace.members}',
      }),
      finding: {
        code: PresetsCode.MembersOutsideList,
        details: {
          block: 'biome',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the members stand as a key',
      entry: entryOf({
        value: "'${workspace.members}': 1",
      }),
      finding: {
        code: PresetsCode.MembersOutsideList,
        details: {
          block: 'biome',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
  ])('should find what an entry names wrongly when $condition', ({ entry, finding }) => {
    // Act
    const found = findingsOf({
      presets: {
        'biome/foundation.yaml': entry,
      },
    });

    // Assert
    expect(found).toStrictEqual([
      finding,
    ]);
  });

  it('should find the release’s files its entries name and lack, and its plugins no entry names or that name no rule', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value:
          "plugins: ['${constitution.path}/presets/biome/plugins/typescript/gone.grit', '${constitution.path}/${role.gone}/x']",
      }),
      'biome/plugins/typescript/file-within-500-lines.grit': 'language js',
      'biome/plugins/typescript/no-such-rule.grit': 'language js',
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.UnknownRole,
        details: {
          block: 'biome',
          role: 'gone',
          rule: '*',
        },
        path: FOUNDATION,
      },
      {
        code: PresetsCode.MissingReleaseFile,
        details: {
          file: 'presets/biome/plugins/typescript/gone.grit',
        },
        path: FOUNDATION,
      },
      {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/file-within-500-lines.grit',
      },
      {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'no-such-rule',
        },
        path: 'presets/biome/plugins/typescript/no-such-rule.grit',
      },
      {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/no-such-rule.grit',
      },
    ]);
  });

  it.each([
    {
      builds: {},
      condition: 'its build lists none',
      expected: [
        'tools/gone.js',
      ],
    },
    {
      builds: {
        'tools/gone.js': 'source/gone.ts',
      },
      condition: 'its build makes it from a source the release lacks',
      expected: [
        'tools/gone.js',
      ],
    },
    {
      builds: {
        'tools/gone.js': 'presets/biome/foundation.yaml',
      },
      condition: 'its build makes it from a source the release holds',
      expected: [],
    },
  ])('should find a file of the release it lacks only when $condition', ({ builds, expected }) => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value: "plugins: ['${constitution.path}/tools/gone.js']",
      }),
    };

    // Act
    const found = findingsOf({
      builds,
      presets,
    });

    // Assert
    expect(found.map(({ details }) => details)).toStrictEqual(
      expected.map((file) => ({
        file,
      })),
    );
  });

  it('should read a role in the path of a release file, a folder by its name, and no whole file a default writes', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        "        plugins: ['${constitution.path}/${role.source}/gone.js', '${constitution.path}/presets/biome/']",
        '      notes.txt: !default |',
        '        see ${constitution.path}/gone',
      ].join('\n'),
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.MissingReleaseFile,
        details: {
          file: 'src/gone.js',
        },
        path: FOUNDATION,
      },
    ]);
  });

  it('should hold a pack checked in its own folder to the terms’ ids', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value: 'files: src/**',
      }),
    };

    // Act
    const found = findingsOf({
      isRelease: false,
      presets,
    });

    // Assert
    expect(found.map(({ code }) => code)).toStrictEqual([
      PresetsCode.HandTypedRole,
    ]);
  });

  it('should hold a pack to its own preset files alone, and never to the release’s files', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value: "plugin: '${constitution.path}/presets/gone.grit'",
      }),
      'biome/plugins/typescript/no-such-rule.grit': 'language js',
    };

    // Act
    const found = findingsOf({
      isRelease: false,
      presets,
    });

    // Assert
    expect(found).toStrictEqual([]);
  });

  it('should find the clashes and missing slots of every entry of a file taken at once, but none in a file whose entries only insert', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        '    typescript:',
        '      biome.json:',
        '        width: 100',
        '      knip.json:',
        '        ignore:',
        '          - dist',
      ].join('\n'),
      'biome/foundation/with/css/with/browser.yaml': [
        'css:',
        '  css-loaded-by-the-bundle:',
        "    '*':",
        '      biome.json:',
        '        width: 80',
        '      lefthook.yaml:',
        '        jobs@checks:',
        '          - lint',
        '      knip.json:',
        '        ignore@own:',
        '          - coverage',
      ].join('\n'),
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.Clash,
        details: {
          setting: 'width',
          sources: [
            'presets/biome/foundation/with/css/with/browser.yaml: css → css-loaded-by-the-bundle',
            'presets/biome/foundation.yaml: biome → *',
          ],
        },
        path: 'biome.json',
      },
      {
        code: PresetsCode.MissingSlot,
        details: {
          setting: 'ignore',
          slot: 'own',
        },
        path: 'knip.json',
      },
    ]);
  });
});
