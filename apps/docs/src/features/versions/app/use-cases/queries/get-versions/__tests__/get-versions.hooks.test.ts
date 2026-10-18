import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { useVersions } from '../get-versions.hooks';
import { createFakeGetVersions } from './get-versions.fake';
import { renderReleases } from './get-versions.hooks.fixtures';

afterEach(() => {
  cleanup();
});

describe('useVersions', () => {
  it('should be loading when the read has not answered yet', () => {
    // Arrange
    const { getVersions } = createFakeGetVersions();

    // Act
    const { result: releases } = renderReleases(getVersions);

    // Assert
    expect(releases.current).toStrictEqual({
      status: 'loading',
    });
  });

  it('should stay loading when no use case is provided', () => {
    // Arrange
    const hook = useVersions;

    // Act
    const { result: releases } = renderHook(hook);

    // Assert
    expect(releases.current).toStrictEqual({
      status: 'loading',
    });
  });

  it('should hold the releases when the read answers', async () => {
    // Arrange
    const { getVersions } = createFakeGetVersions({
      latest: '0.70.0',
      versions: [
        '0.70.0',
        '0.69.2',
      ],
    });

    // Act
    const { result: releases } = renderReleases(getVersions);

    // Assert
    await waitFor(() => {
      expect(releases.current).toStrictEqual({
        latest: '0.70.0',
        status: 'loaded',
        versions: [
          '0.70.0',
          '0.69.2',
        ],
      });
    });
  });

  it('should have failed when the read fails', async () => {
    // Arrange
    const { getVersions } = createFakeGetVersions(new Error('unreadable'));

    // Act
    const { result: releases } = renderReleases(getVersions);

    // Assert
    await waitFor(() => {
      expect(releases.current).toStrictEqual({
        status: 'failed',
      });
    });
  });

  it('should abort the read when the caller unmounts', () => {
    // Arrange
    const { getVersions, signals } = createFakeGetVersions();
    const { unmount } = renderReleases(getVersions);

    // Act
    unmount();

    // Assert
    expect(signals.map((signal) => signal.aborted)).toStrictEqual([
      true,
    ]);
  });

  it('should hold the newer releases when the older read is aborted', async () => {
    // Arrange
    const { result: releases, provide } = renderReleases(createFakeGetVersions().getVersions);
    const newer = createFakeGetVersions({
      latest: '0.71.0',
      versions: [
        '0.71.0',
        '0.70.0',
      ],
    });

    // Act
    provide(newer.getVersions);

    // Assert
    await waitFor(() => {
      expect(releases.current).toStrictEqual({
        latest: '0.71.0',
        status: 'loaded',
        versions: [
          '0.71.0',
          '0.70.0',
        ],
      });
    });
  });
});
