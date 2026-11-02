import { describe, expect, it } from 'bun:test';

import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { PresetFileParser } from '#/features/presets';
import {
  LockReadStatus,
  PresetFileReadStatus,
  PresetsCode,
  presetsFindingTextOf,
} from '#/features/presets';
import { ConfigurationsCheckStatus } from '#/features/session';
import { ConfigReadStatus, WarningKind } from '#/kernel/entities';
import { AbsolutePath, Version } from '#/kernel/value-objects';

import type { PresetsPorts } from '../rules-source.adapter';
import { createRulesSource } from '../rules-source.adapter';
import {
  CORE_TEXT,
  projectPortsOf,
  projectTreeOf,
  UNPARSED_CONFIG,
  UNPARSED_LINE,
} from './project-ports.fixtures';

const PRESET_FILE = '.droneey/constitution/presets/biome/foundation.yaml';

const unparsed: PresetFileParser = {
  parse: () => ({
    line: 1,
    status: PresetFileReadStatus.Unparsed,
  }),
};

const presetsOf = (input: Partial<PresetsPorts> = {}): PresetsPorts => ({
  distribution: {
    builtFilesOf: () => new Set<string>(),
  },
  formats: {
    canSortKeys: () => false,
    read: () => undefined,
    write: ({ text }: { text: string }) => text,
  },
  lockOf: () => ({
    lock: {},
    status: LockReadStatus.Read,
  }),
  parser: unparsed,
  ...input,
});

const DECLARED = {
  active: [],
  listing: {
    repository: [],
    units: [],
  },
  mustsBesideCore: [],
  status: ConfigReadStatus.Parsed,
  warnings: [],
} as const;

const sourceOf = (input: { config?: string; presets?: PresetsPorts } = {}) =>
  createRulesSource({
    presets: input.presets ?? presetsOf(),
    project: projectPortsOf(
      projectTreeOf({
        ...(input.config === undefined
          ? {}
          : {
              config: input.config,
            }),
        files: {
          [`${releaseFolderPath}/presets/biome/foundation.yaml`]: 'biome: [\n',
        },
      }),
    ),
  });

describe('createRulesSource', () => {
  it('should find the project around the folder through the project feature', () => {
    // Act
    const place = sourceOf().findProjectAround(AbsolutePath.create(PROJECT));

    // Assert
    expect(place).toStrictEqual(projectPlace);
  });

  it("should read the text of core's passport through the project feature", () => {
    // Act
    const core = sourceOf().readCorePassport(projectPlace);

    // Assert
    expect(core).toBe(CORE_TEXT);
  });

  it('should give the version of the release the project pins when it is installed', () => {
    // Act
    const version = sourceOf().pinnedVersionOf(projectPlace);

    // Assert
    expect(version).toBe(Version.create('1.0.0'));
  });

  it('should give no version when the release the project pins is not installed', () => {
    // Arrange
    const source = createRulesSource({
      presets: presetsOf(),
      project: projectPortsOf({
        files: {
          [`${PROJECT}/constitution.yaml`]: 'axes: []\n',
        },
      }),
    });

    // Act
    const version = source.pinnedVersionOf(projectPlace);

    // Assert
    expect(version).toBeUndefined();
  });

  it('should give the rules the project declares, with what the presets find as its warnings', () => {
    // Act
    const rules = sourceOf().readRules(projectPlace);

    // Assert
    expect(rules).toStrictEqual({
      ...DECLARED,
      configurations: {
        status: ConfigurationsCheckStatus.Checked,
        warnings: [
          {
            details: {
              code: PresetsCode.PresetFileUnparsed,
              file: PRESET_FILE,
              says: presetsFindingTextOf({
                code: PresetsCode.PresetFileUnparsed,
                details: {
                  line: 1,
                },
                path: PRESET_FILE,
              }),
            },
            kind: WarningKind.ConfigurationFinding,
          },
        ],
      },
    });
  });

  it('should give the lines constitution.yaml fails at when it does not parse', () => {
    // Act
    const rules = sourceOf({
      config: UNPARSED_CONFIG,
    }).readRules(projectPlace);

    // Assert
    expect(rules).toStrictEqual({
      lines: [
        UNPARSED_LINE,
      ],
      status: ConfigReadStatus.Unparsed,
    });
  });

  it.each([
    {
      condition: 'an error, naming its message',
      failure: new Error('the disk is gone'),
      named: {
        reason: 'the disk is gone',
      },
    },
    {
      condition: 'a value that is no error, naming nothing',
      failure: 'the disk is gone',
      named: {},
    },
  ])(
    'should give the presets as unchecked when their check throws $condition',
    ({ failure, named }) => {
      // Arrange
      const source = sourceOf({
        presets: presetsOf({
          distribution: {
            builtFilesOf: () => {
              throw failure;
            },
          },
        }),
      });

      // Act
      const rules = source.readRules(projectPlace);

      // Assert
      expect(rules).toStrictEqual({
        ...DECLARED,
        configurations: {
          ...named,
          status: ConfigurationsCheckStatus.Unchecked,
        },
      });
    },
  );
});
