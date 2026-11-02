import { describe, expect, it } from 'bun:test';

import type { FakeTree } from '#/__tests__/project-files.fake';
import { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { PresetsProject, ProjectRead } from '#/features/presets';
import { ProjectReadStatus } from '#/features/presets';
import { Axis, Layer } from '#/kernel/constants';
import { ProjectUnit } from '#/kernel/entities';
import { AbsolutePath, BlockSource, coreBlockId, repositoryUnit } from '#/kernel/value-objects';

import { createProjectReader } from '../project-reader.adapter';
import {
  projectPortsOf,
  projectTreeOf,
  UNPARSED_CONFIG,
  UNPARSED_LINE,
} from './project-ports.fixtures';

const start = AbsolutePath.create(PROJECT);

describe('createProjectReader', () => {
  it("should give the project the project feature opens in the presets' terms", () => {
    // Arrange
    const reader = createProjectReader(projectPortsOf());

    // Act
    const read = reader.open(start);

    // Assert
    expect<object>(read).toStrictEqual({
      answer: {
        model: {
          blocks: [
            {
              chapters: [],
              governs: [],
              id: coreBlockId,
              isAbstract: false,
              languages: [],
              layer: Layer.Core,
              requires: [],
              seams: [],
              source: BlockSource.create(),
            },
          ],
          roles: [],
          rules: [],
        },
        packs: [],
        releaseFolderPath,
        repositoryFolderPath: PROJECT,
        units: [
          ProjectUnit.create({
            axes: [
              Axis.Foundation,
            ],
            blocks: new Set([
              coreBlockId,
            ]),
            languages: new Set(),
            loweredRules: new Set(),
            packs: [],
            path: repositoryUnit,
          }),
        ],
        warnings: [],
      },
      status: ProjectReadStatus.Opened,
    });
  });

  it.each<{
    condition: string;
    expected: ProjectRead<PresetsProject>;
    start: string;
    tree: FakeTree;
  }>([
    {
      condition: 'no project holds the start folder',
      expected: {
        status: ProjectReadStatus.NoProject,
      },
      start: '/elsewhere',
      tree: projectTreeOf(),
    },
    {
      condition: 'its release is not installed',
      expected: {
        releaseFolderPath: AbsolutePath.create(releaseFolderPath),
        status: ProjectReadStatus.ReleaseMissing,
      },
      start: PROJECT,
      tree: {
        files: {
          [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
          [`${PROJECT}/constitution.yaml`]: 'axes: []\n',
        },
      },
    },
    {
      condition: 'its constitution.yaml does not parse',
      expected: {
        lines: [
          UNPARSED_LINE,
        ],
        status: ProjectReadStatus.ConfigUnparsed,
      },
      start: PROJECT,
      tree: projectTreeOf({
        config: UNPARSED_CONFIG,
      }),
    },
  ])(
    "should tell in the presets' terms why it cannot be read when $condition",
    ({ expected, start: from, tree }) => {
      // Arrange
      const reader = createProjectReader(projectPortsOf(tree));

      // Act
      const read = reader.open(AbsolutePath.create(from));

      // Assert
      expect(read).toStrictEqual(expected);
    },
  );
});
