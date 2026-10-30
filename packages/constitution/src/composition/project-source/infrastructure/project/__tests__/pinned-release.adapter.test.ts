import { describe, expect, it } from 'bun:test';

import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import { ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath, Version } from '#/kernel/value-objects';

import { createPinnedRelease } from '../pinned-release.adapter';
import { projectPortsOf } from './project-ports.fixtures';

describe('createPinnedRelease', () => {
  it('should find the project around the start folder through the project feature', () => {
    // Arrange
    const pinned = createPinnedRelease(projectPortsOf());

    // Act
    const place = pinned.findProjectAround(AbsolutePath.create(PROJECT));

    // Assert
    expect(place).toStrictEqual(projectPlace);
  });

  it('should read the release the project pins through the project feature', () => {
    // Arrange
    const pinned = createPinnedRelease(projectPortsOf());

    // Act
    const release = pinned.readRelease(projectPlace);

    // Assert
    expect(release).toStrictEqual({
      status: ReleaseStatus.Installed,
      version: Version.create('1.0.0'),
    });
  });
});
