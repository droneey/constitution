import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeAppliedFilesRepository } from '../../../../../__tests__/applied-files-repository.fake';
import { PROJECT } from '../../../../../__tests__/presets.fixtures';
import type { AppliedFiles } from '../../../../entities';
import { applyChanges } from '../apply-changes.use-case';

const changes: AppliedFiles = {
  deletedFilePaths: [
    AbsolutePath.create(`${PROJECT}/gone.json`),
  ],
  files: [
    {
      filePath: AbsolutePath.create(`${PROJECT}/made.json`),
      text: '{}\n',
    },
  ],
  locks: [],
};

describe('applyChanges', () => {
  it('should write exactly the changes it is given, once', () => {
    // Arrange
    const writes = createFakeAppliedFilesRepository();

    // Act
    applyChanges({
      changes,
      writes: writes.repository,
    });

    // Assert
    expect(writes.written()).toStrictEqual([
      changes,
    ]);
  });

  it('should fail as its writes fail', () => {
    // Arrange
    const failure = new Error('disk full');
    const writes = createFakeAppliedFilesRepository(failure);

    // Act
    const apply = (): void => {
      applyChanges({
        changes,
        writes: writes.repository,
      });
    };

    // Assert
    expect(apply).toThrow(failure);
  });
});
