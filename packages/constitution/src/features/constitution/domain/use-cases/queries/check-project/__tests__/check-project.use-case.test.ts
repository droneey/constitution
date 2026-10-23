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
import type { ProjectWarning } from '../../../../entities';
import { warnedOf } from '../../check-wiring/__tests__/wiring.fixtures';
import { checkProject } from '../check-project.use-case';

const TODAY = '2026-06-15';

const readingOf = (
  warnings: readonly ProjectWarning[] | undefined,
): readonly (readonly string[])[] => warnedOf(warnings ?? []);

describe('checkProject', () => {
  it('should give nothing when no constitution.yaml lies around the start folder', () => {
    // Arrange
    const files = createFakeProjectFiles({
      files: {
        [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
      },
    });

    // Act
    const warnings = checkProject({
      ...parsers(),
      clock: createFakeClock(TODAY),
      files,
      start: PROJECT,
      workingTree: createFakeWorkingTree(),
    });

    // Assert
    expect(warnings).toBeUndefined();
  });

  it("should give the declaration's warnings, then the wiring's, when both have some", () => {
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
        config: [
          'axes: [architecture, workflow]',
          'domains: []',
          'platforms: []',
          'languages: [typescript]',
          'implementations: [biome, nonesuch]',
          'packages: {}',
          'packs: []',
          'check: bun run check',
          'overrides: []',
          '',
        ].join('\n'),
        files: {
          [`${ARCHIVE}/presets/common/biome/foundation/self.jsonc`]: '{}\n',
          [`${ARCHIVE}/templates/project/common/biome/biome.json`]: '{ "extends": ["<parts>"] }\n',
          [`${PROJECT}/biome.json`]: '{}\n',
        },
      }),
    );

    // Act
    const warnings = checkProject({
      ...parsers(),
      clock: createFakeClock(TODAY),
      files,
      start: PROJECT,
      workingTree: createFakeWorkingTree(),
    });

    // Assert
    expect(readingOf(warnings)).toStrictEqual([
      [
        'unknown',
      ],
      [
        'constitution',
      ],
      [
        'wiring',
        'biome',
        '.',
      ],
    ]);
  });
});
