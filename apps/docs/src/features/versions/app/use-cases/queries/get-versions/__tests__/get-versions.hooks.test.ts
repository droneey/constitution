import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';

import { createVersion } from '../../../../../domain/value-objects';
import { VersionsStatus } from '../get-versions.constants';
import { useGetVersions } from '../get-versions.hooks';
import { renderVersionsState } from './get-versions.hooks.fixtures';

afterEach(() => {
  cleanup();
});

describe('useGetVersions', () => {
  it('should be loading when the read has not answered yet', () => {
    // Arrange
    const { getVersions } = createFakeGetVersions();

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    expect(versionsState.current).toStrictEqual({
      status: VersionsStatus.Loading,
    });
  });

  it('should stay loading when no use case is provided', () => {
    // Arrange
    const hook = useGetVersions;

    // Act
    const { result: versionsState } = renderHook(hook);

    // Assert
    expect(versionsState.current).toStrictEqual({
      status: VersionsStatus.Loading,
    });
  });

  it('should hold the releases when the read answers', async () => {
    // Arrange
    const { getVersions } = createFakeGetVersions({
      latest: createVersion('0.70.0'),
      versions: [
        createVersion('0.70.0'),
        createVersion('0.69.2'),
      ],
    });

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    await waitFor(() => {
      expect(versionsState.current).toStrictEqual({
        latest: createVersion('0.70.0'),
        status: VersionsStatus.Loaded,
        versions: [
          createVersion('0.70.0'),
          createVersion('0.69.2'),
        ],
      });
    });
  });

  it('should have failed when the read fails', async () => {
    // Arrange
    const { getVersions } = createFakeGetVersions(new Error('unreadable'));

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    await waitFor(() => {
      expect(versionsState.current).toStrictEqual({
        status: VersionsStatus.Failed,
      });
    });
  });

  it('should abort the read when the caller unmounts', () => {
    // Arrange
    const { getVersions, signals } = createFakeGetVersions();
    const { unmount } = renderVersionsState(getVersions);

    // Act
    unmount();

    // Assert
    expect(signals.map((signal) => signal.aborted)).toStrictEqual([
      true,
    ]);
  });

  it('should hold the newer releases when the older read is aborted', async () => {
    // Arrange
    const { result: versionsState, provide } = renderVersionsState(
      createFakeGetVersions().getVersions,
    );
    const newer = createFakeGetVersions({
      latest: createVersion('0.71.0'),
      versions: [
        createVersion('0.71.0'),
        createVersion('0.70.0'),
      ],
    });

    // Act
    provide(newer.getVersions);

    // Assert
    await waitFor(() => {
      expect(versionsState.current).toStrictEqual({
        latest: createVersion('0.71.0'),
        status: VersionsStatus.Loaded,
        versions: [
          createVersion('0.71.0'),
          createVersion('0.70.0'),
        ],
      });
    });
  });
});
