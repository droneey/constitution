import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { createFakeGetVersions } from '#/__tests__/get-versions.fake';

import { VersionsError, VersionsFailure } from '../../../../../domain/errors';
import { Version } from '../../../../../domain/value-objects';
import { VersionsStatus } from '../get-versions.constants';
import { useGetVersions } from '../get-versions.hooks';
import { renderVersionsState } from './get-versions.hooks.fixtures';
import type { ReportErrorFake } from './report-error.fake';
import { reportErrorFake } from './report-error.fake';

let reportError: ReportErrorFake;

beforeEach(() => {
  reportError = reportErrorFake();
});

afterEach(() => {
  cleanup();
  reportError.restore();
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
      latest: Version.create('0.70.0'),
      versions: [
        Version.create('0.70.0'),
        Version.create('0.69.2'),
      ],
    });

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    await waitFor(() => {
      expect(versionsState.current).toStrictEqual({
        latest: Version.create('0.70.0'),
        status: VersionsStatus.Loaded,
        versions: [
          Version.create('0.70.0'),
          Version.create('0.69.2'),
        ],
      });
    });
  });

  it('should have failed, reporting nothing, when the list cannot be read', async () => {
    // Arrange
    const { getVersions } = createFakeGetVersions(
      new VersionsError({
        code: VersionsFailure.Unreachable,
        details: {
          address: '/versions.json',
        },
      }),
    );

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    await waitFor(() => {
      expect({
        reported: reportError.reported,
        state: versionsState.current,
      }).toStrictEqual({
        reported: [],
        state: {
          status: VersionsStatus.Failed,
        },
      });
    });
  });

  it('should have failed and reported the defect when the read meets one', async () => {
    // Arrange
    const defect = new RangeError('a defect');
    const { getVersions } = createFakeGetVersions(defect);

    // Act
    const { result: versionsState } = renderVersionsState(getVersions);

    // Assert
    await waitFor(() => {
      expect({
        reported: reportError.reported,
        state: versionsState.current,
      }).toStrictEqual({
        reported: [
          defect,
        ],
        state: {
          status: VersionsStatus.Failed,
        },
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
      latest: Version.create('0.71.0'),
      versions: [
        Version.create('0.71.0'),
        Version.create('0.70.0'),
      ],
    });

    // Act
    provide(newer.getVersions);

    // Assert
    await waitFor(() => {
      expect(versionsState.current).toStrictEqual({
        latest: Version.create('0.71.0'),
        status: VersionsStatus.Loaded,
        versions: [
          Version.create('0.71.0'),
          Version.create('0.70.0'),
        ],
      });
    });
  });
});
