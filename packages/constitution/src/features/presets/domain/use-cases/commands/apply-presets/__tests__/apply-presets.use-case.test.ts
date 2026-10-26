import { describe, expect, it } from 'bun:test';

import type { ProjectUnit } from '#/kernel/entities';

import { createFakeAppliedFilesRepository } from '../../../../../__tests__/applied-files-repository.fake';
import { createFakeConfigurationFormat } from '../../../../../__tests__/configuration-format.fake';
import { createFakeLockRepository } from '../../../../../__tests__/lock-repository.fake';
import type { Files } from '../../../../../__tests__/presets.fixtures';
import {
  catalogueParser,
  PROJECT,
  projectFiles,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { ApplyReport, Lock, LockRead, Setting } from '../../../../entities';
import { LockReadStatus, PresetsCode } from '../../../../entities';
import { applyPresets } from '../apply-presets.use-case';

interface Step {
  /** the project's own files, by their paths from it */
  readonly files: Files;
  readonly locks?: Readonly<Record<string, LockRead>>;
  readonly presets: Files;
  readonly units?: readonly ProjectUnit[];
}

interface Applied {
  /** the files written, by their paths from the project, each as its format reads it back */
  readonly files: Readonly<Record<string, Setting | undefined>>;
  readonly locks: Readonly<Record<string, Lock>>;
  readonly report: ApplyReport | undefined;
  /** the texts written, by their paths from the project */
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

// One apply on the project as the step gives it, and what it wrote.
const applyOnce = (step: Step): Applied => {
  const { files, source } = projectOf({
    files: {
      ...releasePresets(step.presets),
      ...projectFiles(step.files),
    },
    units: step.units ?? [
      repository,
    ],
  });
  const writes = createFakeAppliedFilesRepository();
  const report = applyPresets({
    files,
    formats: format,
    locks: createFakeLockRepository(step.locks),
    parser: catalogueParser,
    source,
    start: PROJECT,
    writes: writes.repository,
  });
  const [applied] = writes.written();
  const texts = Object.fromEntries(
    (applied?.files ?? []).map((file) => [
      file.path.slice(PROJECT.length + 1),
      file.text,
    ]),
  );

  return {
    files: Object.fromEntries(
      Object.entries(texts).map(([path, text]) => [
        path,
        format.read({
          path,
          text,
        }) ?? text,
      ]),
    ),
    locks: Object.fromEntries(
      (applied?.locks ?? []).map((lock) => [
        lock.folder,
        lock.lock,
      ]),
    ),
    report,
    texts,
  };
};

// A JSON file as the fake format writes it, so an apply that changes nothing writes nothing.
const jsonTextOf = (settings: Setting): string =>
  format.write({
    path: 'settings.json',
    settings,
    text: '',
  });

// The locks an apply wrote, as the next apply reads them.
const readOf = (locks: Readonly<Record<string, Lock>>): Readonly<Record<string, LockRead>> =>
  Object.fromEntries(
    Object.entries(locks).map(([folder, lock]) => [
      folder,
      {
        lock,
        status: LockReadStatus.Read,
      },
    ]),
  );

const biomeCatalogue = [
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
  "      '${role.source}/sandbox.ts': !default |",
  '        export {};',
].join('\n');

describe('applyPresets', () => {
  it('should write nothing and give nothing when no project lies around the start', () => {
    // Arrange
    const writes = createFakeAppliedFilesRepository();
    const { files, source } = projectOf({
      units: [],
    });

    // Act
    const report = applyPresets({
      files,
      formats: createFakeConfigurationFormat(),
      locks: createFakeLockRepository(),
      parser: catalogueParser,
      source,
      start: '/work/elsewhere',
      writes: writes.repository,
    });

    // Assert
    expect({
      report,
      written: writes.written(),
    }).toStrictEqual({
      report: undefined,
      written: [],
    });
  });

  it('should write what the catalogues compute beside the files’ own settings, then nothing again, then follow the release and keep a default the user deleted', () => {
    // Arrange
    const before: Files = {
      'biome.json': JSON.stringify({
        files: [
          'mine',
        ],
        formatter: {
          style: 'tab',
        },
        own: true,
      }),
    };

    // Act
    const first = applyOnce({
      files: before,
      presets: {
        'biome/foundation.yaml': biomeCatalogue,
      },
    });

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
            style: 'tab',
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
        'src/sandbox.ts': 'export {};\n',
      },
      report: {
        added: [
          {
            file: 'biome.json',
            setting: 'test.randomize',
          },
        ],
        findings: [
          {
            code: PresetsCode.Loosened,
            details: {
              setting: 'formatter.style',
              wanted: '"space"',
            },
            path: 'biome.json',
          },
        ],
        removed: [],
        written: [
          '.gitignore',
          'biome.json',
          'src/sandbox.ts',
          'constitution.lock',
        ],
      },
    });

    // Act
    const second = applyOnce({
      files: {
        ...before,
        ...first.texts,
      },
      locks: readOf(first.locks),
      presets: {
        'biome/foundation.yaml': biomeCatalogue,
      },
    });

    // Assert
    expect({
      files: second.files,
      locks: second.locks,
      written: second.report?.written,
    }).toStrictEqual({
      files: {},
      locks: {},
      written: [],
    });

    // Act
    const third = applyOnce({
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
            style: 'tab',
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
        'biome/foundation.yaml': biomeCatalogue
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
            style: 'tab',
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
        added: [],
        findings: [
          {
            code: PresetsCode.Loosened,
            details: {
              setting: 'formatter.style',
              wanted: '"space"',
            },
            path: 'biome.json',
          },
        ],
        removed: [
          {
            file: 'biome.json',
            setting: 'files "**"',
          },
          {
            file: 'biome.json',
            setting: 'formatter.width',
          },
        ],
        written: [
          'biome.json',
          'constitution.lock',
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
    const first = applyOnce({
      files: {},
      presets,
    });

    // Act
    const second = applyOnce({
      files: {},
      locks: readOf(first.locks),
      presets,
    });

    // Assert
    expect({
      first: first.files,
      second: second.files,
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
    });
  });

  it('should read and write a file of no format in the shape its settings take', () => {
    // Act
    const applied = applyOnce({
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
        ].join('\n'),
      },
    });

    // Assert
    expect(applied.texts).toStrictEqual({
      '.ignorelist': 'dist\na=b\n',
      '.npmrc': 'own=1\nregistry=x\n',
    });
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
    const first = applyOnce({
      files: {
        'biome.json': jsonTextOf({
          own: true,
        }),
      },
      presets: owned,
    });

    // Act
    const second = applyOnce({
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
      removed: second.report?.removed,
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
          file: 'biome.json',
          setting: 'width',
        },
        {
          file: 'biome.json',
          setting: 'rules[name=size].level',
        },
      ],
    });
  });

  it("should write a file's settings over a whole-file default of it", () => {
    // Act
    const applied = applyOnce({
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

  it('should write a lock that does not parse again, though nothing is due in it', () => {
    // Act
    const applied = applyOnce({
      files: {},
      locks: {
        [PROJECT]: {
          status: LockReadStatus.Unparsed,
        },
      },
      presets: {},
    });

    // Assert
    expect(applied.locks).toStrictEqual({
      [PROJECT]: {},
    });
  });

  it.each<{
    catalogue: string;
    condition: string;
    file: string;
    files: Files;
    unreadable?: readonly string[];
  }>([
    {
      catalogue: 'width: 100',
      condition: 'the file does not parse',
      file: 'biome.json',
      files: {
        'biome.json': '{',
      },
    },
    {
      catalogue: 'width: 100',
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
      catalogue: 'width: 100',
      condition: 'its format holds no settings',
      file: 'types.ts',
      files: {},
    },
  ])(
    'should find the file and leave it and its lock as they are when $condition',
    ({ catalogue, file, files, unreadable }) => {
      // Arrange
      const writes = createFakeAppliedFilesRepository();
      const project = projectOf({
        files: {
          ...releasePresets({
            'biome/foundation.yaml': [
              'biome:',
              "  '*':",
              "    '*':",
              `      ${file}:`,
              `        ${catalogue}`,
            ].join('\n'),
          }),
          ...projectFiles(files),
        },
        units: [
          repository,
        ],
        ...(unreadable === undefined
          ? {}
          : {
              unreadable,
            }),
      });

      // Act
      const report = applyPresets({
        ...project,
        formats: format,
        locks: createFakeLockRepository({
          [PROJECT]: {
            lock: {
              [file]: {
                addresses: [],
                defaults: [],
                isWhole: false,
                leaves: [
                  'kept',
                ],
              },
            },
            status: LockReadStatus.Read,
          },
        }),
        parser: catalogueParser,
        start: PROJECT,
        writes: writes.repository,
      });

      // Assert
      expect({
        findings: report?.findings,
        written: writes.written(),
      }).toStrictEqual({
        findings: [
          {
            code: PresetsCode.FileUnparsed,
            details: {},
            path: file,
          },
        ],
        written: [
          {
            files: [],
            locks: [],
          },
        ],
      });
    },
  );

  it('should take a lock that does not parse as empty, keep the values the files held first as theirs, and drop from the lock a file no entry gives once it is gone', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        '        width: 100',
        "      '${role.source}/sandbox.ts': !default |",
        '        export {};',
      ].join('\n'),
    };
    const files = {
      'biome.json': jsonTextOf({
        width: 100,
      }),
      'src/sandbox.ts': 'mine\n',
    };

    // Act
    const first = applyOnce({
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
      report: first.report,
    }).toStrictEqual({
      locks: {
        [PROJECT]: {
          'src/sandbox.ts': {
            addresses: [],
            defaults: [],
            isWhole: true,
            leaves: [],
          },
        },
      },
      report: {
        added: [],
        findings: [
          {
            code: PresetsCode.LockUnparsed,
            details: {},
            path: 'constitution.lock',
          },
        ],
        removed: [],
        written: [
          'constitution.lock',
        ],
      },
    });

    // Act
    const second = applyOnce({
      files: {
        'biome.json': files['biome.json'],
      },
      locks: readOf(first.locks),
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
    const third = applyOnce({
      files: {
        'biome.json': files['biome.json'],
      },
      locks: readOf(first.locks),
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
    const applied = applyOnce(step);

    // Assert
    expect({
      files: applied.files,
      folders: Object.keys(applied.locks),
      written: applied.report?.written,
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
        'packages/kit/biome.json',
        'packages/kit/constitution.lock',
      ],
    });
  });

  it('should fail as its writes fail', () => {
    // Arrange
    const failure = new Error('disk full');
    const writes = createFakeAppliedFilesRepository(failure);
    const project = projectOf({
      units: [
        repository,
      ],
    });

    // Act
    const apply = (): unknown =>
      applyPresets({
        ...project,
        formats: format,
        locks: createFakeLockRepository(),
        parser: catalogueParser,
        start: PROJECT,
        writes: writes.repository,
      });

    // Assert
    expect(apply).toThrow(failure);
  });

  it('should keep what a file holds in the place of a map or a list of ours, and add only the defaults a file lacks', () => {
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
          '        formatter:',
          '          width: 100',
          '        files:',
          "          - '**'",
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
    const applied = applyOnce(step);

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
        added: [
          {
            file: '.gitignore',
            setting: '"node_modules/"',
          },
          {
            file: 'biome.json',
            setting: 'test.randomize',
          },
          {
            file: 'package.json',
            setting: 'private',
          },
          {
            file: 'package.json',
            setting: 'scripts.test',
          },
        ],
        findings: [
          {
            code: PresetsCode.Loosened,
            details: {
              setting: 'formatter',
              wanted: '{"width":100}',
            },
            path: 'biome.json',
          },
          {
            code: PresetsCode.Loosened,
            details: {
              setting: 'files',
              wanted: '["**"]',
            },
            path: 'biome.json',
          },
        ],
        removed: [],
        written: [
          '.gitignore',
          'biome.json',
          'package.json',
          'constitution.lock',
        ],
      },
    });
  });
});
