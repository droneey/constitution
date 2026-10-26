import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { PresetFileParser } from '#/features/presets';
import {
  LockReadStatus,
  PresetFileReadStatus,
  PresetsCode,
  presetsFindingTextOf,
} from '#/features/presets';
import { ConfigurationsCheckStatus } from '#/features/session';
import { Axis, Layer } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { OpenedProject } from '#/kernel/entities';
import { BlockListing, BlockModel, ProjectUnit, Resolution, WarningKind } from '#/kernel/entities';
import { BlockId, coreBlockId, repositoryUnit } from '#/kernel/value-objects';

import { createProjectConfigurationsCheck } from '../project-configurations-check.adapter';

// A project whose release holds a preset file its parser cannot read.
const files = createFakeProjectFiles({
  files: {
    [`${releaseFolderPath}/presets/biome/foundation.yaml`]: 'biome: [\n',
    [`${PROJECT}/biome.json`]: '{}\n',
  },
});

const unparsed: PresetFileParser = {
  parse: () => ({
    line: 1,
    status: PresetFileReadStatus.Unparsed,
  }),
};

const project: OpenedProject = {
  ...projectPlace,
  packs: [],
  resolution: Resolution.create({
    active: [],
    blocks: [
      {
        id: coreBlockId,
        layer: Layer.Core,
      },
      {
        id: BlockId.create('typescript'),
        layer: Layer.Language,
      },
      {
        id: BlockId.create('biome'),
        layer: Layer.Implementation,
      },
    ],
    listing: BlockListing.create({
      overrides: [],
      repository: [],
      units: [],
    }),
    model: BlockModel.create({
      blocks: [
        {
          governs: [],
          id: coreBlockId,
          languages: [],
          layer: Layer.Core,
          requires: [],
        },
        {
          governs: [],
          id: BlockId.create('biome'),
          languages: [],
          layer: Layer.Implementation,
          requires: [],
        },
      ],
      roles: [],
      rules: [],
    }),
    musts: [],
    units: [
      ProjectUnit.create({
        axes: [
          Axis.Foundation,
          Axis.Architecture,
          Axis.Workflow,
        ],
        blocks: new Set([
          coreBlockId,
          BlockId.create('typescript'),
          BlockId.create('biome'),
        ]),
        languages: new Set(),
        loweredRules: new Set(),
        packs: [],
        path: repositoryUnit,
      }),
    ],
    warnings: [],
  }),
};

const readFailure = new Error('the disk is gone');

// The project's files, any of which fails to be read.
const failingFiles: ProjectFiles = {
  ...files,
  read: () => {
    throw readFailure;
  },
};

const portsOf = (projectFiles: ProjectFiles) => ({
  distribution: {
    packagesOf: () => new Map<string, string>(),
  },
  files: projectFiles,
  formats: {
    read: () => undefined,
    write: ({ text }: { text: string }) => text,
  },
  lockOf: () => ({
    lock: {},
    status: LockReadStatus.Read,
  }),
  parser: unparsed,
});

const PRESET_FILE = '.droneey/constitution/presets/biome/foundation.yaml';

describe('createProjectConfigurationsCheck', () => {
  it('should give what the presets find as warnings of the project when a preset file does not parse', () => {
    // Arrange
    const check = createProjectConfigurationsCheck(portsOf(files));
    const finding = {
      code: PresetsCode.PresetFileUnparsed,
      details: {
        line: 1,
      },
      path: PRESET_FILE,
    } as const;

    // Act
    const report = check.check(project);

    // Assert
    expect(report).toStrictEqual({
      status: ConfigurationsCheckStatus.Checked,
      warnings: [
        {
          details: {
            code: PresetsCode.PresetFileUnparsed,
            file: PRESET_FILE,
            says: presetsFindingTextOf(finding),
          },
          kind: WarningKind.ConfigurationFinding,
        },
      ],
    });
  });

  it('should give the presets as unchecked, with why, when the check throws', () => {
    // Arrange
    const check = createProjectConfigurationsCheck(portsOf(failingFiles));

    // Act
    const report = check.check(project);

    // Assert
    expect(report).toStrictEqual({
      cause: readFailure,
      status: ConfigurationsCheckStatus.Unchecked,
    });
  });
});
