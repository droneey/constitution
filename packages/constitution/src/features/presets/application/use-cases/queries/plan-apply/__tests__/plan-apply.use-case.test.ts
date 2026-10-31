import { describe, expect, it } from 'bun:test';

import type { ProjectUnit } from '#/kernel/entities';
import { AbsolutePath, BlockId, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

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
import type { ApplyPlan, ApplyReport } from '../../../../../domain/apply-plan/entities';
import { ApplyPlanKind } from '../../../../../domain/apply-plan/entities';
import type { ConfigurationWrite } from '../../../../../domain/configuration-file/entities';
import type { LockRead, LockRecord } from '../../../../../domain/lock/entities';
import { LockReadStatus, RecordKind } from '../../../../../domain/lock/entities';
import { ProjectReadStatus } from '../../../../../domain/presets-project/entities';
import type { Setting } from '../../../../../domain/setting/entities';
import { Leaf } from '../../../../../domain/setting/entities';
import type { PresetsFinding } from '../../../../../domain/shared/entities';
import { PresetsCode } from '../../../../../domain/shared/entities';
import { FileFormat } from '../../../../../domain/shared/value-objects';
import type { ConfigurationFormat } from '../../../../contracts';
import { planApply } from '../plan-apply.use-case';

interface Step {
  readonly files: Files;
  readonly formats?: ConfigurationFormat;
  readonly locks?: Readonly<Record<string, LockRead>>;
  readonly presets: Files;
  readonly units?: readonly ProjectUnit[];
  readonly unreadable?: readonly string[];
}

interface Planned {
  readonly deleted: readonly string[];
  readonly files: Readonly<Record<string, Setting | undefined>>;
  readonly findings: readonly PresetsFinding[];
  readonly lockedFiles: readonly string[];
  readonly locks: Readonly<Record<string, Readonly<Record<string, LockRecord>>>>;
  readonly notes: readonly PresetsFinding[];
  readonly report: ApplyReport | undefined;
  readonly texts: Files;
}

const format = createFakeConfigurationFormat();

const repository = unitOf({
  blocks: [
    'core',
    'json',
    'biome',
  ],
});

const reportOf = (plan: ApplyPlan): ApplyReport | undefined =>
  plan.kind === ApplyPlanKind.Ready ? plan.report : undefined;

const findingsOf = (plan: ApplyPlan): readonly PresetsFinding[] =>
  plan.kind === ApplyPlanKind.Held ? plan.findings : [];

const notesOf = (plan: ApplyPlan): readonly PresetsFinding[] =>
  plan.kind === ApplyPlanKind.Ready ? plan.notes : [];

const planOf = (step: Step): ApplyPlan => {
  const { files, reader } = projectOf({
    files: {
      ...releasePresets(step.presets),
      ...projectFiles(step.files),
    },
    units: step.units ?? [
      repository,
    ],
    ...(step.unreadable === undefined
      ? {}
      : {
          unreadable: step.unreadable,
        }),
  });

  return answerOf(
    planApply({
      distribution: createFakeDistributionSources(),
      files,
      formats: step.formats ?? format,
      locks: createFakeLockRepository(step.locks),
      parser: presetFileParser,
      reader,
      startFolderPath: AbsolutePath.create(PROJECT),
    }),
  );
};

const planOnce = (step: Step): Planned => {
  const planned = planOf(step);
  const applied = planned.kind === ApplyPlanKind.Ready ? planned.changes : undefined;
  const texts = Object.fromEntries(
    (applied?.files ?? []).map((file) => [
      file.filePath.slice(PROJECT.length + 1),
      file.text,
    ]),
  );

  return {
    deleted: (applied?.deletedFilePaths ?? []).map((filePath) =>
      filePath.slice(PROJECT.length + 1),
    ),
    files: Object.fromEntries(
      Object.entries(texts).map(([path, text]) => [
        path,
        format.read({
          filePath: RepositoryRelativePath.create(path),
          text,
        }) ?? text,
      ]),
    ),
    findings: findingsOf(planned),
    lockedFiles: (applied?.locks ?? []).flatMap((lock) => Object.keys(lock.lock)),
    locks: Object.fromEntries(
      (applied?.locks ?? []).map((lock) => [
        lock.unitFolderPath,
        lock.lock,
      ]),
    ),
    notes: notesOf(planned),
    report: reportOf(planned),
    texts,
  };
};

const jsonTextOf = (settings: Setting): string =>
  format.write({
    filePath: RepositoryRelativePath.create('settings.json'),
    marks: {
      blocks: [],
      marks: [],
    },
    settings,
    sorted: [],
    text: '',
  });

const readOf = (locks: Planned['locks']): Readonly<Record<string, LockRead>> =>
  Object.fromEntries(
    Object.entries(locks).map(([unitFolderPath, lock]) => [
      unitFolderPath,
      {
        lock: lockOf(lock),
        status: LockReadStatus.Read,
      },
    ]),
  );

const biomePresetFile = [
  'biome:',
  "  '*':",
  "    '*':",
  '      biome.json:',
  '        formatter:',
  '          width: 100',
  '          style: space',
  '        files:',
  "          - '**'",
  '          - dist',
  "        'rules[name=size]':",
  '          level: error',
  '        test:',
  '          randomize: !default true',
  '      .gitignore: !default',
  '        - node_modules/',
  '        - dist/',
  "      '${role.source}/sandbox.py': !default |",
  '        pass',
].join('\n');

const presetsWith = (files: readonly string[]): Files => ({
  'biome/foundation.yaml': [
    'biome:',
    "  '*':",
    "    '*':",
    ...files.flatMap((file) => [
      `      ${file}:`,
      '        width: 100',
    ]),
  ].join('\n'),
});

describe('planApply', () => {
  const biomeProject = (): ReturnType<typeof projectOf> =>
    projectOf({
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
        }),
      ],
    });

  it('should report what an apply would write when a project lies around the start', () => {
    // Arrange
    const { files, reader } = biomeProject();

    // Act
    const planned = answerOf(
      planApply({
        distribution: createFakeDistributionSources(),
        files,
        formats: createFakeConfigurationFormat(),
        locks: createFakeLockRepository(),
        parser: presetFileParser,
        reader,
        startFolderPath: AbsolutePath.create(PROJECT),
      }),
    );

    // Assert
    expect(reportOf(planned)).toStrictEqual({
      defaultsAddedToExistingFiles: [],
      deletedFilePaths: [],
      removedByApply: [],
      writtenUnitPaths: [
        UnitPath.create(''),
      ],
      writtenFilePaths: [
        RepositoryRelativePath.create('biome.json'),
        RepositoryRelativePath.create('constitution.lock'),
      ],
    });
  });

  it('should tell that no project is there when none lies around the start', () => {
    // Arrange
    const { files, reader } = biomeProject();

    // Act
    const planned = planApply({
      distribution: createFakeDistributionSources(),
      files,
      formats: createFakeConfigurationFormat(),
      locks: createFakeLockRepository(),
      parser: presetFileParser,
      reader,
      startFolderPath: AbsolutePath.create('/work/elsewhere'),
    });

    // Assert
    expect(planned).toStrictEqual({
      status: ProjectReadStatus.NoProject,
    });
  });

  const deletingSteps = (): {
    readonly first: Planned;
    readonly second: Planned;
  } => {
    const first = planOnce({
      files: {
        'mine.json': jsonTextOf({
          mine: true,
        }),
      },
      presets: presetsWith([
        'kept.json',
        'made.json',
        'mine.json',
      ]),
    });

    return {
      first,
      second: planOnce({
        files: {
          ...first.texts,
        },
        locks: readOf(first.locks),
        presets: presetsWith([
          'kept.json',
        ]),
      }),
    };
  };

  it('should delete a file it created once no entry writes it, and keep a file of the user', () => {
    // Act
    const { second } = deletingSteps();

    // Assert
    expect({
      deleted: second.deleted,
      files: second.files,
      reported: second.report?.deletedFilePaths,
      unlocked: second.lockedFiles,
    }).toStrictEqual({
      deleted: [
        'made.json',
      ],
      files: {
        'mine.json': {
          mine: true,
        },
      },
      reported: [
        RepositoryRelativePath.create('made.json'),
      ],
      unlocked: [
        'kept.json',
      ],
    });
  });

  it('should write nothing once the files hold what the apply that deleted a file left', () => {
    // Arrange
    const { second } = deletingSteps();

    // Act
    const third = planOnce({
      files: {
        'kept.json': jsonTextOf({
          width: 100,
        }),
        'mine.json': jsonTextOf({
          mine: true,
        }),
      },
      locks: readOf(second.locks),
      presets: presetsWith([
        'kept.json',
      ]),
    });

    // Assert
    expect(third.texts).toStrictEqual({});
  });

  it('should leave out of the lock a value a file held before the first apply, which stays the file’s own', () => {
    // Act
    const applied = planOnce({
      files: {
        'held.json': jsonTextOf({
          width: 100,
        }),
      },
      presets: presetsWith([
        'held.json',
        'made.json',
      ]),
    });

    // Assert
    expect(applied.lockedFiles).toStrictEqual([
      'made.json',
    ]);
  });

  it('should keep a file of the user that held nothing before an apply, once no entry writes it', () => {
    // Arrange
    const first = planOnce({
      files: {
        'mine.json': jsonTextOf({}),
      },
      presets: presetsWith([
        'mine.json',
      ]),
    });

    // Act
    const second = planOnce({
      files: first.texts,
      locks: readOf(first.locks),
      presets: {},
    });

    // Assert
    expect({
      deleted: second.deleted,
      files: second.files,
    }).toStrictEqual({
      deleted: [],
      files: {
        'mine.json': {},
      },
    });
  });

  it('should delete nothing and forget a file it created once the user deleted it and no entry writes it', () => {
    // Arrange
    const first = planOnce({
      files: {},
      presets: presetsWith([
        'kept.json',
        'made.json',
      ]),
    });
    const { 'made.json': deleted, ...kept } = first.texts;

    // Act
    const second = planOnce({
      files: kept,
      locks: readOf(first.locks),
      presets: presetsWith([
        'kept.json',
      ]),
    });

    // Assert
    expect({
      deleted: second.deleted,
      reported: second.report?.deletedFilePaths,
      unlocked: second.lockedFiles,
    }).toStrictEqual({
      deleted: [],
      reported: [],
      unlocked: [
        'kept.json',
      ],
    });
  });

  it('should name to the format the blocks whose entries write a file the unit takes from none of them, or none, and mark none', () => {
    // Arrange
    const writes: {
      marks: ConfigurationWrite['marks'];
      filePath: string;
      sorted: ConfigurationWrite['sorted'];
    }[] = [];
    const watched: ConfigurationFormat = {
      canSortKeys: format.canSortKeys,
      read: format.read,
      write: (file) => {
        writes.push({
          marks: file.marks,
          filePath: file.filePath,
          sorted: file.sorted,
        });

        return format.write(file);
      },
    };
    const first = planOnce({
      files: {},
      presets: presetsWith([
        'gone.json',
        'mine.json',
      ]),
    });
    const presets = {
      'knip/foundation.yaml': [
        'knip:',
        "  '*':",
        "    '*':",
        '      mine.json:',
        '        width: 100',
      ].join('\n'),
    };

    const { files, reader } = projectOf({
      files: {
        ...releasePresets(presets),
        ...projectFiles(first.texts),
      },
      units: [
        repository,
      ],
    });

    // Act
    planApply({
      distribution: createFakeDistributionSources(),
      files,
      formats: watched,
      locks: createFakeLockRepository(readOf(first.locks)),
      parser: presetFileParser,
      reader,
      startFolderPath: AbsolutePath.create(PROJECT),
    });

    // Assert
    expect(writes).toStrictEqual([
      {
        marks: {
          blocks: [],
          marks: [],
        },
        filePath: 'gone.json',
        sorted: [],
      },
      {
        marks: {
          blocks: [
            BlockId.create('knip'),
          ],
          marks: [],
        },
        filePath: 'mine.json',
        sorted: [],
      },
    ]);
  });

  const beside: Files = {
    'biome.json': JSON.stringify({
      files: [
        'mine',
      ],
      own: true,
    }),
  };

  const besideStep = (): Step => ({
    files: beside,
    presets: {
      'biome/foundation.yaml': biomePresetFile,
    },
  });

  it('should write what the presets compute beside the files’ own settings', () => {
    // Act
    const first = planOnce(besideStep());

    // Assert
    expect({
      files: first.files,
      report: first.report,
    }).toStrictEqual({
      files: {
        '.gitignore': [
          'node_modules/',
          'dist/',
        ],
        'biome.json': {
          files: [
            '**',
            'dist',
            'mine',
          ],
          formatter: {
            style: 'space',
            width: 100,
          },
          own: true,
          rules: [
            {
              level: 'error',
              name: 'size',
            },
          ],
          test: {
            randomize: true,
          },
        },
        'src/sandbox.py': 'pass\n',
      },
      report: {
        defaultsAddedToExistingFiles: [
          {
            filePath: RepositoryRelativePath.create('biome.json'),
            settingPath: 'test.randomize',
          },
        ],
        deletedFilePaths: [],
        removedByApply: [],
        writtenUnitPaths: [
          UnitPath.create(''),
        ],
        writtenFilePaths: [
          RepositoryRelativePath.create('.gitignore'),
          RepositoryRelativePath.create('biome.json'),
          RepositoryRelativePath.create('src/sandbox.py'),
          RepositoryRelativePath.create('constitution.lock'),
        ],
      },
    });
  });

  it('should write nothing again once the files hold what it wrote', () => {
    // Arrange
    const first = planOnce(besideStep());

    // Act
    const second = planOnce({
      files: {
        ...beside,
        ...first.texts,
      },
      locks: readOf(first.locks),
      presets: {
        'biome/foundation.yaml': biomePresetFile,
      },
    });

    // Assert
    expect({
      files: second.files,
      locks: second.locks,
      units: second.report?.writtenUnitPaths,
      written: second.report?.writtenFilePaths,
    }).toStrictEqual({
      files: {},
      locks: {},
      units: [],
      written: [],
    });
  });

  it('should follow the release and keep a default the user deleted', () => {
    // Arrange
    const first = planOnce(besideStep());

    // Act
    const third = planOnce({
      files: {
        ...first.texts,
        '.gitignore': 'node_modules/\n',
        'biome.json': JSON.stringify({
          files: [
            '**',
            'dist',
            'mine',
          ],
          formatter: {
            style: 'space',
            width: 100,
          },
          own: true,
          rules: [
            {
              level: 'error',
              name: 'size',
            },
          ],
        }),
      },
      locks: readOf(first.locks),
      presets: {
        'biome/foundation.yaml': biomePresetFile
          .replace('width: 100', 'width: 120')
          .replace("          - '**'\n", ''),
      },
    });

    // Assert
    expect({
      files: third.files,
      report: third.report,
    }).toStrictEqual({
      files: {
        'biome.json': {
          files: [
            'dist',
            'mine',
          ],
          formatter: {
            style: 'space',
            width: 120,
          },
          own: true,
          rules: [
            {
              level: 'error',
              name: 'size',
            },
          ],
        },
      },
      report: {
        defaultsAddedToExistingFiles: [],
        deletedFilePaths: [],
        removedByApply: [
          {
            filePath: RepositoryRelativePath.create('biome.json'),
            settingPath: 'files "**"',
          },
          {
            filePath: RepositoryRelativePath.create('biome.json'),
            settingPath: 'formatter.width',
          },
        ],
        writtenUnitPaths: [
          UnitPath.create(''),
        ],
        writtenFilePaths: [
          RepositoryRelativePath.create('biome.json'),
          RepositoryRelativePath.create('constitution.lock'),
        ],
      },
    });
  });

  it('should leave a file the user deleted absent while only the defaults it held are due', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      .gitignore: !default',
        '        - node_modules/',
        '      biome.json:',
        '        test: !default',
        '          randomize: true',
      ].join('\n'),
    };
    const first = planOnce({
      files: {},
      presets,
    });

    // Act
    const second = planOnce({
      files: {},
      locks: readOf(first.locks),
      presets,
    });

    // Assert
    expect({
      first: first.files,
      second: second.files,
      secondLocks: second.locks,
    }).toStrictEqual({
      first: {
        '.gitignore': [
          'node_modules/',
        ],
        'biome.json': {
          test: {
            randomize: true,
          },
        },
      },
      second: {},
      secondLocks: {},
    });
  });

  it('should read and write a file of no format in the shape its settings take', () => {
    // Act
    const applied = planOnce({
      files: {
        '.ignorelist': 'a=b\n',
        '.npmrc': 'own=1\n',
      },
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      .ignorelist:',
          '        - dist',
          '      .npmrc:',
          '        registry: x',
          '      .yarnrc:',
          '        registry: x',
        ].join('\n'),
      },
    });

    // Assert
    expect(applied.texts).toStrictEqual({
      '.ignorelist': 'dist\na=b\n',
      '.npmrc': 'own=1\nregistry=x\n',
      '.yarnrc': 'registry=x\n',
    });
  });

  it('should hand the format the format a file is marked with', () => {
    // Arrange
    const handed: (FileFormat | undefined)[] = [];
    const watched: ConfigurationFormat = {
      canSortKeys: format.canSortKeys,
      read: (file) => {
        handed.push(file.format);

        return format.read(file);
      },
      write: (file) => {
        handed.push(file.format);

        return format.write(file);
      },
    };

    // Act
    planOnce({
      files: {},
      formats: watched,
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json !jsonc:',
          '        width: 100',
        ].join('\n'),
      },
    });

    // Assert
    expect(handed).toStrictEqual([
      FileFormat.Jsonc,
      FileFormat.Jsonc,
    ]);
  });

  it('should take out of a file no entry gives any longer what an apply wrote there, its addressed elements with it', () => {
    // Arrange
    const owned = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        '        width: 100',
        "        'rules[name=size]':",
        '          level: error',
      ].join('\n'),
    };
    const first = planOnce({
      files: {
        'biome.json': jsonTextOf({
          own: true,
        }),
      },
      presets: owned,
    });

    // Act
    const second = planOnce({
      files: first.texts,
      locks: readOf(first.locks),
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      other.json:',
          '        width: 100',
        ].join('\n'),
      },
    });

    // Assert
    expect({
      files: second.files,
      removed: second.report?.removedByApply,
    }).toStrictEqual({
      files: {
        'biome.json': {
          own: true,
        },
        'other.json': {
          width: 100,
        },
      },
      removed: [
        {
          filePath: RepositoryRelativePath.create('biome.json'),
          settingPath: 'width',
        },
        {
          filePath: RepositoryRelativePath.create('biome.json'),
          settingPath: 'rules[name=size].level',
        },
      ],
    });
  });

  it("should write a file's settings over a whole-file default of it", () => {
    // Act
    const applied = planOnce({
      files: {},
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          "      notes.json: !default '{}'",
          'core:',
          "  '*':",
          "    '*':",
          '      notes.json:',
          '        width: 100',
        ].join('\n'),
      },
    });

    // Assert
    expect(applied.files).toStrictEqual({
      'notes.json': {
        width: 100,
      },
    });
  });

  it.each<{
    condition: string;
    locks: Step['locks'];
  }>([
    {
      condition: 'its lock parses',
      locks: undefined,
    },
    {
      condition: 'its lock does not parse',
      locks: {
        [PROJECT]: {
          status: LockReadStatus.Unparsed,
        },
      },
    },
  ])(
    'should hold the plan, writing nothing, on a value a file holds of its own in the place of one of ours, when $condition',
    ({ locks }) => {
      // Act
      const planned = planOf({
        files: {
          'biome.json': jsonTextOf({
            width: 80,
          }),
        },
        ...(locks === undefined
          ? {}
          : {
              locks,
            }),
        presets: presetsWith([
          'biome.json',
        ]),
      });

      // Assert
      expect({
        findings: findingsOf(planned).map(({ code }) => code),
        kind: planned.kind,
      }).toStrictEqual({
        findings: [
          PresetsCode.Loosened,
        ],
        kind: ApplyPlanKind.Held,
      });
    },
  );

  it.each<{
    presetFile: string;
    condition: string;
    file: string;
    files: Files;
    unreadable: readonly string[];
  }>([
    {
      presetFile: 'width: 100',
      condition: 'the file does not parse',
      file: 'biome.json',
      files: {
        'biome.json': '{',
      },
      unreadable: [],
    },
    {
      presetFile: 'width: 100',
      condition: 'the file cannot be read',
      file: 'biome.json',
      files: {
        'biome.json': '{}',
      },
      unreadable: [
        `${PROJECT}/biome.json`,
      ],
    },
    {
      presetFile: 'width: 100',
      condition: 'its format holds no settings',
      file: 'types.py',
      files: {},
      unreadable: [],
    },
  ])(
    'should find the file and leave it and its lock as they are when $condition',
    ({ file, files, presetFile, unreadable }) => {
      // Act
      const applied = planOnce({
        files,
        locks: {
          [PROJECT]: {
            lock: lockOf({
              [file]: {
                addresses: [],
                everMetDefaults: [],
                isCreatedByApply: false,
                kind: RecordKind.Settings,
                leaves: [
                  'kept',
                ],
              },
            }),
            status: LockReadStatus.Read,
          },
        },
        presets: {
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            `      ${file}:`,
            `        ${presetFile}`,
          ].join('\n'),
        },
        unreadable,
      });

      // Assert
      expect({
        findings: applied.findings,
        report: applied.report,
      }).toStrictEqual({
        findings: [
          {
            code: PresetsCode.FileUnparsed,
            details: {},
            path: file,
          },
        ],
        report: undefined,
      });
    },
  );

  it('should write a lock that does not parse again where the files call for an empty one', () => {
    // Act
    const applied = planOnce({
      files: {},
      locks: {
        [PROJECT]: {
          status: LockReadStatus.Unparsed,
        },
      },
      presets: {},
    });

    // Assert
    expect({
      locks: applied.locks,
      notes: applied.notes.map(({ code }) => code),
    }).toStrictEqual({
      locks: {
        [PROJECT]: {},
      },
      notes: [
        PresetsCode.LockUnparsed,
      ],
    });
  });

  it('should write a lock that does not parse again from the files and note it, then drop from the lock a file no entry gives once it is gone', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        '        width: 100',
        "      '${role.source}/sandbox.py': !default |",
        '        pass',
      ].join('\n'),
    };
    const files = {
      'biome.json': jsonTextOf({
        width: 100,
      }),
      'src/sandbox.py': 'mine\n',
    };
    const sandboxLocked: Planned['locks'] = {
      [PROJECT]: {
        'src/sandbox.py': {
          kind: RecordKind.Whole,
        },
      },
    };

    // Act
    const first = planOnce({
      files,
      locks: {
        [PROJECT]: {
          status: LockReadStatus.Unparsed,
        },
      },
      presets,
    });

    // Assert
    expect({
      locks: first.locks,
      notes: first.notes,
      written: first.report?.writtenFilePaths,
    }).toStrictEqual({
      locks: sandboxLocked,
      notes: [
        {
          code: PresetsCode.LockUnparsed,
          details: {},
          path: 'constitution.lock',
        },
      ],
      written: [
        RepositoryRelativePath.create('constitution.lock'),
      ],
    });

    // Act
    const second = planOnce({
      files: {
        'biome.json': files['biome.json'],
      },
      locks: readOf(sandboxLocked),
      presets: {
        'biome/foundation.yaml': presets['biome/foundation.yaml'].replace(
          '        width: 100\n',
          '        {}\n',
        ),
      },
    });

    // Assert
    expect({
      files: second.files,
      locks: second.locks,
    }).toStrictEqual({
      files: {},
      locks: {},
    });

    // Act
    const third = planOnce({
      files: {
        'biome.json': files['biome.json'],
      },
      locks: readOf(sandboxLocked),
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json: {}',
        ].join('\n'),
      },
    });

    // Assert
    expect({
      files: third.files,
      locks: third.locks,
    }).toStrictEqual({
      files: {},
      locks: {
        [PROJECT]: {},
      },
    });
  });

  it('should write the files of a tool no runner of the unit runs, and leave that finding to the check', () => {
    // Arrange
    const step = {
      files: {},
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
        'bun/foundation/with/biome.yaml': [
          'bun:',
          "  '*':",
          "    '*':",
          '      ${constitution.run}:',
          '        check:',
          '          - bun run check',
        ].join('\n'),
      },
    };

    // Act
    const applied = planOnce(step);

    // Assert
    expect({
      files: applied.files,
      findings: applied.findings.map(({ code }) => code),
    }).toStrictEqual({
      files: {
        'biome.json': {
          width: 100,
        },
      },
      findings: [],
    });
  });

  it('should report among its findings a fact a unit lacks', () => {
    // Act
    const planned = planOf({
      files: {},
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      package.json:',
          '        name: ${package.name}',
        ].join('\n'),
      },
    });

    // Assert
    expect(findingsOf(planned).map(({ code }) => code)).toStrictEqual([
      PresetsCode.MissingName,
    ]);
  });

  it("should write a member's files and lock in its own folder", () => {
    // Arrange
    const step = {
      files: {},
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      },
      units: [
        unitOf(),
        unitOf({
          blocks: [
            'core',
            'json',
            'biome',
          ],
          path: 'packages/kit',
        }),
      ],
    };

    // Act
    const applied = planOnce(step);

    // Assert
    expect({
      files: applied.files,
      folders: Object.keys(applied.locks),
      written: applied.report?.writtenFilePaths,
    }).toStrictEqual({
      files: {
        'packages/kit/biome.json': {
          width: 100,
        },
      },
      folders: [
        `${PROJECT}/packages/kit`,
      ],
      written: [
        RepositoryRelativePath.create('packages/kit/biome.json'),
        RepositoryRelativePath.create('packages/kit/constitution.lock'),
      ],
    });
  });

  it('should keep what a file holds in the place of a default map of ours, and add only the defaults a file lacks', () => {
    // Arrange
    const step = {
      files: {
        '.gitignore': 'dist/\nmine/\n',
        'biome.json': jsonTextOf({
          files: 'all',
          formatter: 'off',
          test: {
            coverage: true,
            timeout: 5,
          },
          vcs: 'git',
        }),
        'package.json': jsonTextOf({
          name: 'kit',
          scripts: {
            build: 'tsc',
          },
        }),
      },
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      package.json: !default',
          '        private: true',
          '        scripts:',
          '          test: bun test',
          '      biome.json:',
          '        test: !default',
          '          coverage: false',
          '          randomize: true',
          '        vcs: !default',
          '          enabled: true',
          '      .gitignore: !default',
          '        - node_modules/',
          '        - dist/',
        ].join('\n'),
      },
    };

    // Act
    const applied = planOnce(step);

    // Assert
    expect({
      files: applied.files,
      report: applied.report,
    }).toStrictEqual({
      files: {
        '.gitignore': [
          'dist/',
          'mine/',
          'node_modules/',
        ],
        'biome.json': {
          files: 'all',
          formatter: 'off',
          test: {
            coverage: true,
            randomize: true,
            timeout: 5,
          },
          vcs: 'git',
        },
        'package.json': {
          name: 'kit',
          private: true,
          scripts: {
            build: 'tsc',
            test: 'bun test',
          },
        },
      },
      report: {
        defaultsAddedToExistingFiles: [
          {
            filePath: RepositoryRelativePath.create('.gitignore'),
            settingPath: '"node_modules/"',
          },
          {
            filePath: RepositoryRelativePath.create('biome.json'),
            settingPath: 'test.randomize',
          },
          {
            filePath: RepositoryRelativePath.create('package.json'),
            settingPath: 'private',
          },
          {
            filePath: RepositoryRelativePath.create('package.json'),
            settingPath: 'scripts.test',
          },
        ],
        deletedFilePaths: [],
        removedByApply: [],
        writtenUnitPaths: [
          UnitPath.create(''),
        ],
        writtenFilePaths: [
          RepositoryRelativePath.create('.gitignore'),
          RepositoryRelativePath.create('biome.json'),
          RepositoryRelativePath.create('package.json'),
          RepositoryRelativePath.create('constitution.lock'),
        ],
      },
    });
  });

  it('should hold the settings an entry gives in a file the apply once wrote whole', () => {
    // Act
    const applied = planOnce({
      files: {
        'notes.json': jsonTextOf({}),
      },
      locks: {
        [PROJECT]: {
          lock: lockOf({
            'notes.json': {
              kind: RecordKind.Whole,
            },
          }),
          status: LockReadStatus.Read,
        },
      },
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      notes.json:',
          '        width: 100',
        ].join('\n'),
      },
    });

    // Assert
    expect({
      files: applied.files,
      locks: applied.locks,
    }).toStrictEqual({
      files: {
        'notes.json': {
          width: 100,
        },
      },
      locks: {
        [PROJECT]: {
          'notes.json': {
            addresses: [],
            everMetDefaults: [],
            isCreatedByApply: false,
            kind: RecordKind.Settings,
            leaves: [
              Leaf.keyOf({
                isItem: false,
                keyPath: [
                  'width',
                ],
                value: 100,
              }),
            ],
          },
        },
      },
    });
  });
});
