import { describe, expect, it } from 'bun:test';

import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import { ActiveReadStatus } from '#/features/session';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { createActiveRulesSource } from '../active-rules-source.adapter';
import { chapterPath, chapterText, projectPortsOf, projectTreeOf } from './project-ports.fixtures';

const sourceOf = (tree = projectTreeOf()) => createActiveRulesSource(projectPortsOf(tree));

describe('createActiveRulesSource', () => {
  it('should find the project around the folder through the project feature', () => {
    // Act
    const place = sourceOf().findProjectAround(AbsolutePath.create(PROJECT));

    // Assert
    expect(place).toStrictEqual(projectPlace);
  });

  it('should read the rules the project makes active, where they are read from', () => {
    // Act
    const read = sourceOf().readActive(projectPlace);

    // Assert
    expect(read).toStrictEqual({
      rules: {
        active: [],
        core: [],
        levels: new Map(),
        lowerings: new Map(),
        releaseFolderPath: projectPlace.releaseFolderPath,
        repositoryFolderPath: projectPlace.repositoryFolderPath,
      },
      status: ActiveReadStatus.Read,
    });
  });

  it('should give the real path of a file not yet written', () => {
    // Act
    const real = sourceOf().realPathOf(AbsolutePath.create(`${PROJECT}/src/new.ts`));

    // Assert
    expect<string>(real).toBe(`${PROJECT}/src/new.ts`);
  });

  it('should give the wording of the rules a block file holds', () => {
    // Arrange
    const source = sourceOf(
      projectTreeOf({
        files: {
          [chapterPath]: chapterText,
        },
      }),
    );

    // Act
    const wordings = source.rulesIn(AbsolutePath.create(chapterPath));

    // Assert
    expect(wordings?.map((wording) => wording.slug)).toStrictEqual([
      RuleSlug.create('name-reveals-intent'),
      RuleSlug.create('name-reveals-more'),
    ]);
  });
});
