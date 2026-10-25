import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';
import type { WiringReport } from '#/features/session';
import { WiringCheckStatus } from '#/features/session';
import { Axis, Layer } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { OpenedProject } from '#/kernel/entities';
import { BlockListing, ProjectUnit, Resolution, WarningCode } from '#/kernel/entities';
import { BlockId, coreBlockId, repositoryUnit } from '#/kernel/value-objects';

import { createPresetsWiringCheck } from '../presets-wiring-check.adapter';

// A project whose biome.json takes none of the parts of the release's biome preset.
const files = createFakeProjectFiles({
  files: {
    [`${releaseFolderPath}/presets/common/biome/foundation/self.jsonc`]: '{}\n',
    [`${releaseFolderPath}/templates/project/common/biome/biome.json`]:
      '{ "extends": ["<parts>"] }\n',
    [`${PROJECT}/biome.json`]: '{}\n',
  },
});

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
    check: 'bun run check',
    listing: BlockListing.create({
      overrides: [],
      repository: [],
      units: [],
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
        loweredRules: new Set(),
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

// A report's status and, where it was checked, the code of each warning and whether it names biome.
const reportOf = (report: WiringReport): unknown =>
  report.status === WiringCheckStatus.Checked
    ? {
        status: report.status,
        warnings: report.warnings.map((warning) => ({
          code: warning.code,
          isBiomeNamed: warning.message.includes('biome'),
        })),
      }
    : report;

describe('createPresetsWiringCheck', () => {
  it("should give the presets' warning as checked when a configuration lacks the parts of its blocks", () => {
    // Arrange
    const check = createPresetsWiringCheck({
      files,
      parser: {
        parse: () => undefined,
      },
      workingTree: createFakeWorkingTree(),
    });

    // Act
    const report = check.check(project);

    // Assert
    expect(reportOf(report)).toStrictEqual({
      status: WiringCheckStatus.Checked,
      warnings: [
        {
          code: WarningCode.Wiring,
          isBiomeNamed: true,
        },
      ],
    });
  });

  it('should give the wiring as unchecked, with why, when the check throws', () => {
    // Arrange
    const check = createPresetsWiringCheck({
      files: failingFiles,
      parser: {
        parse: () => undefined,
      },
      workingTree: createFakeWorkingTree(),
    });

    // Act
    const report = check.check(project);

    // Assert
    expect(report).toStrictEqual({
      cause: readFailure,
      status: WiringCheckStatus.Unchecked,
    });
  });
});
