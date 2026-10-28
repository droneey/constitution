import { describe, expect, it } from 'bun:test';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { AbsolutePath, UnitPath } from '#/kernel/value-objects';

import { createFakeConfigurationFormat } from '../../../../../__tests__/configuration-format.fake';
import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import { createFakeLockRepository } from '../../../../../__tests__/lock-repository.fake';
import type { Files } from '../../../../../__tests__/presets.fixtures';
import {
  answerOf,
  lockOf,
  PROJECT,
  presetFileParser,
  projectFiles,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { LockRead } from '../../../../entities';
import {
  Leaf,
  LockReadStatus,
  PresetsCode,
  ProjectReadStatus,
  RecordKind,
} from '../../../../entities';
import { checkConfigurations } from '../check-configurations.use-case';

const unknownBlock: ProjectWarning = {
  details: {
    name: 'acme',
  },
  kind: WarningKind.NameUnknown,
};

const loopOfWeb: ProjectWarning = {
  details: {
    unit: UnitPath.create('apps/web'),
  },
  kind: WarningKind.ReleaseLinkLoops,
};

const biomePresetFile = [
  'biome:',
  "  '*':",
  "    '*':",
  '      biome.json:',
  '        width: 100',
  '        style: space',
  '        test: !default',
  '          randomize: true',
].join('\n');

const repository = unitOf({
  blocks: [
    'core',
    'json',
    'biome',
  ],
});

const checkedOf = (input: {
  files: Files;
  presetFile?: string;
  links?: Readonly<Record<string, string>>;
  locks?: Readonly<Record<string, LockRead>>;
  units?: Parameters<typeof projectOf>[0]['units'];
  warnings?: readonly ProjectWarning[];
}) => {
  const project = projectOf({
    files: {
      ...releasePresets({
        'biome/foundation.yaml': input.presetFile ?? biomePresetFile,
      }),
      ...projectFiles(input.files),
    },
    ...(input.links === undefined
      ? {}
      : {
          links: input.links,
        }),
    units: input.units ?? [
      repository,
    ],
    ...(input.warnings === undefined
      ? {}
      : {
          warnings: input.warnings,
        }),
  });

  return answerOf(
    checkConfigurations({
      distribution: createFakeDistributionSources(),
      files: project.files,
      formats: createFakeConfigurationFormat(),
      locks: createFakeLockRepository(input.locks),
      parser: presetFileParser,
      reader: project.reader,
      startFolderPath: AbsolutePath.create(PROJECT),
    }),
  );
};

describe('checkConfigurations', () => {
  it('should tell that no project is there when none lies around the start folder', () => {
    // Arrange
    const project = projectOf({
      units: [],
    });

    // Act
    const checked = checkConfigurations({
      distribution: createFakeDistributionSources(),
      files: project.files,
      formats: createFakeConfigurationFormat(),
      locks: createFakeLockRepository(),
      parser: presetFileParser,
      reader: project.reader,
      startFolderPath: AbsolutePath.create('/work/elsewhere'),
    });

    // Assert
    expect(checked).toStrictEqual({
      status: ProjectReadStatus.NoProject,
    });
  });

  it('should give nothing beyond the declaration when the files hold what the presets give, a default left out', () => {
    // Act
    const checked = checkedOf({
      files: {
        'biome.json': JSON.stringify({
          style: 'space',
          width: 100,
        }),
      },
      warnings: [
        unknownBlock,
      ],
    });

    // Assert
    expect(checked).toStrictEqual({
      findings: [],
      warnings: [
        unknownBlock,
      ],
    });
  });

  it('should find the settings a file lacks, those it holds as an earlier release gave them, and those it holds otherwise', () => {
    // Act
    const checked = checkedOf({
      files: {
        'biome.json': JSON.stringify({
          gone: true,
          style: 'tab',
          width: 80,
        }),
      },
      locks: {
        [PROJECT]: {
          lock: lockOf({
            'biome.json': {
              addresses: [],
              defaults: [],
              isCreated: false,
              kind: RecordKind.Settings,
              leaves: [
                Leaf.keyOf({
                  isItem: false,
                  keyPath: [
                    'gone',
                  ],
                  value: true,
                }),
                Leaf.keyOf({
                  isItem: false,
                  keyPath: [
                    'width',
                  ],
                  value: 80,
                }),
              ],
            },
          }),
          status: LockReadStatus.Read,
        },
      },
    });

    // Assert
    expect(checked.findings).toStrictEqual([
      {
        code: PresetsCode.Loosened,
        details: {
          setting: 'style',
          wanted: '"space"',
        },
        path: 'biome.json',
      },
      {
        code: PresetsCode.Missing,
        details: {
          settings: [
            'width',
          ],
        },
        path: 'biome.json',
      },
      {
        code: PresetsCode.Stale,
        details: {
          settings: [
            'gone',
          ],
        },
        path: 'biome.json',
      },
    ]);
  });

  it.each([
    {
      condition: 'orders them otherwise',
      findings: [
        {
          code: PresetsCode.Unsorted,
          details: {
            settings: [
              'tool.scripts',
            ],
          },
          path: 'biome.json',
        },
      ],
      text: '{"tool": {"scripts": {"b": 2, "a": 1, "own": 3}}}',
    },
    {
      condition: 'orders them as texts',
      findings: [],
      text: '{"tool": {"scripts": {"a": 1, "b": 2, "own": 3}}}',
    },
    {
      condition: 'holds no such map',
      findings: [
        {
          code: PresetsCode.Loosened,
          details: {
            setting: 'tool.scripts',
            wanted: '{"a":1,"b":2}',
          },
          path: 'biome.json',
        },
      ],
      text: '{"tool": {"scripts": 1}}',
    },
  ])('should find a map the presets keep sorted when the file $condition', ({ findings, text }) => {
    // Act
    const checked = checkedOf({
      files: {
        'biome.json': text,
      },
      presetFile: [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        '        tool:',
        '          scripts: !sorted',
        '            b: 2',
        '            a: 1',
      ].join('\n'),
    });

    // Assert
    expect(checked.findings).toStrictEqual(findings);
  });

  it('should find missing only the settings below no setting the file loosens', () => {
    // Arrange
    const project = projectOf({
      files: {
        ...releasePresets({
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        formatter:',
            '          style: space',
            '          width: 100',
            '        lint: on',
          ].join('\n'),
        }),
        ...projectFiles({
          'biome.json': JSON.stringify({
            formatter: {
              style: 'tab',
            },
            lint: 'off',
          }),
        }),
      },
      units: [
        repository,
      ],
    });

    // Act
    const checked = answerOf(
      checkConfigurations({
        distribution: createFakeDistributionSources(),
        files: project.files,
        formats: createFakeConfigurationFormat(),
        locks: createFakeLockRepository(),
        parser: presetFileParser,
        reader: project.reader,
        startFolderPath: AbsolutePath.create(PROJECT),
      }),
    );

    // Assert
    expect(
      checked.findings.map(({ code, details }) => [
        code,
        details,
      ]),
    ).toStrictEqual([
      [
        PresetsCode.Loosened,
        {
          setting: 'formatter.style',
          wanted: '"space"',
        },
      ],
      [
        PresetsCode.Loosened,
        {
          setting: 'lint',
          wanted: '"on"',
        },
      ],
      [
        PresetsCode.Missing,
        {
          settings: [
            'formatter.width',
          ],
        },
      ],
    ]);
  });

  it('should find nothing of a file an earlier apply wrote that is gone and no entry gives any longer', () => {
    // Act
    const checked = checkedOf({
      files: {
        'biome.json': JSON.stringify({
          style: 'space',
          width: 100,
        }),
      },
      locks: {
        [PROJECT]: {
          lock: lockOf({
            'old.json': {
              addresses: [],
              defaults: [],
              isCreated: false,
              kind: RecordKind.Settings,
              leaves: [
                Leaf.keyOf({
                  isItem: false,
                  keyPath: [
                    'gone',
                  ],
                  value: true,
                }),
              ],
            },
          }),
          status: LockReadStatus.Read,
        },
      },
    });

    // Assert
    expect(checked.findings).toStrictEqual([]);
  });

  it.each([
    {
      condition: "a member's link names the member's own folder",
      links: {
        [`${PROJECT}/apps/web/.droneey/constitution`]: `${PROJECT}/apps/web`,
      },
      warned: [
        loopOfWeb,
      ],
    },
    {
      condition: "a member's link names the repository that holds it",
      links: {
        [`${PROJECT}/apps/web/.droneey/constitution`]: PROJECT,
      },
      warned: [
        loopOfWeb,
      ],
    },
    {
      condition: "a member's link names a folder beside it",
      links: {
        [`${PROJECT}/apps/web/.droneey/constitution`]: `${PROJECT}/packages/kit`,
      },
      warned: [],
    },
  ])("should refuse a unit's link to the release only when $condition", ({ links, warned }) => {
    // Act
    const checked = checkedOf({
      files: {
        'apps/web/README.md': '# Web\n',
        'biome.json': JSON.stringify({
          style: 'space',
          width: 100,
        }),
        'packages/kit/README.md': '# Kit\n',
      },
      links,
      units: [
        repository,
        unitOf({
          path: 'apps/web',
        }),
      ],
    });

    // Assert
    expect(checked.warnings).toStrictEqual(warned);
  });
});
