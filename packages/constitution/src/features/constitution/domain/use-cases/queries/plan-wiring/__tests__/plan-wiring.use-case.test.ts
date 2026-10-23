import { describe, expect, it } from 'bun:test';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  ARCHIVE,
  Folder,
  PROJECT,
  parsers,
  projectTreeOf,
} from '../../../../../__tests__/project.fixtures';
import { createFakeProjectFiles } from '../../../../../__tests__/project-files.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { plannedOf } from '../../check-wiring/__tests__/wiring.fixtures';
import { planProjectWiring } from '../plan-wiring.use-case';

describe('planProjectWiring', () => {
  it('should list the files the tools of the blocks constitution.yaml lists read when the project keeps none', () => {
    // Arrange
    const files = createFakeProjectFiles(
      projectTreeOf({
        blocks: [
          {
            folder: Folder.Language,
            id: 'typescript',
          },
          {
            folder: Folder.Implementation,
            id: 'biome',
          },
        ],
        config: 'languages: [typescript]\nimplementations: [biome]\n',
        files: {
          [`${ARCHIVE}/presets/common/biome/foundation/self.jsonc`]: '{}\n',
          [`${ARCHIVE}/templates/project/common/biome/biome.json`]: '{ "extends": ["<parts>"] }\n',
        },
      }),
    );

    // Act
    const lines = planProjectWiring({
      ...parsers(),
      clock: createFakeClock('2026-06-15'),
      files,
      start: PROJECT,
      workingTree: createFakeWorkingTree(),
    });

    // Assert
    expect(plannedOf(lines)).toStrictEqual([
      [
        'biome.json',
        'new',
        '.',
      ],
      [
        'biome',
        '.droneey/constitution/templates/project/common/biome/biome.json',
      ],
      [
        '.droneey/constitution/presets/common/biome/foundation/self.jsonc',
      ],
    ]);
  });
});
