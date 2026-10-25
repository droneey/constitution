import { describe, expect, it } from 'bun:test';

import { VersionsFailure } from '../../../domain/errors';
import { Version } from '../../../domain/value-objects';
import { createStaticFileVersionsRepository } from '../versions.repository';
import {
  failureOf,
  transportFailing,
  transportServing,
  transportSilent,
  versionsFileOf,
} from './versions.repository.fixtures';

const servingFile = (file: unknown): ReturnType<typeof transportServing> =>
  transportServing({
    '/versions.json': {
      body: file,
      status: 200,
    },
  });

describe('createStaticFileVersionsRepository', () => {
  it.each([
    {
      condition: 'the file lists them',
      file: versionsFileOf(),
      latest: '0.70.0',
      versions: [
        '0.70.0',
        '0.69.2',
        '0.9.10',
      ],
    },
    {
      condition: 'every part holds several digits',
      file: versionsFileOf({
        latest: '10.20.30',
        versions: [
          '10.20.30',
        ],
      }),
      latest: '10.20.30',
      versions: [
        '10.20.30',
      ],
    },
    {
      condition: 'the file holds a key a later release added',
      file: versionsFileOf({
        channel: 'stable',
      }),
      latest: '0.70.0',
      versions: [
        '0.70.0',
        '0.69.2',
        '0.9.10',
      ],
    },
  ])('should read the releases when $condition', async ({ file, latest, versions }) => {
    // Arrange
    const repository = createStaticFileVersionsRepository({
      address: '/versions.json',
      transport: servingFile(file),
    });

    // Act
    const read = await repository.read(new AbortController().signal);

    // Assert
    expect(read).toStrictEqual({
      latest: Version.create(latest),
      versions: versions.map(Version.create),
    });
  });

  it('should fail as unanswered, with the status, when the site answers no file', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository({
      address: '/versions.json',
      transport: transportServing({
        '/other.json': {
          body: versionsFileOf(),
          status: 200,
        },
      }),
    });

    // Act
    const failure = await failureOf(repository.read(new AbortController().signal));

    // Assert
    expect(failure).toStrictEqual({
      cause: undefined,
      code: VersionsFailure.Unanswered,
      details: {
        address: '/versions.json',
        status: 404,
      },
    });
  });

  it.each([
    {
      cause: 'TypeError',
      condition: 'the network fails',
      repository: createStaticFileVersionsRepository({
        address: '/versions.json',
        transport: transportFailing(new TypeError('Failed to fetch')),
      }),
    },
    {
      cause: 'TimeoutError',
      condition: 'the site gives no answer in time',
      repository: createStaticFileVersionsRepository({
        address: '/versions.json',
        timeoutMs: 0,
        transport: transportSilent,
      }),
    },
  ])('should fail as unreachable when $condition', async ({ cause, repository }) => {
    // Act
    const failure = await failureOf(repository.read(new AbortController().signal));

    // Assert
    expect(failure).toStrictEqual({
      cause,
      code: VersionsFailure.Unreachable,
      details: {
        address: '/versions.json',
      },
    });
  });

  it('should fail with the caller’s reason when the caller has aborted the read', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository({
      address: '/versions.json',
      transport: servingFile(versionsFileOf()),
    });
    const controller = new AbortController();

    controller.abort();

    // Act
    const failure = await failureOf(repository.read(controller.signal));

    // Assert
    expect(failure).toBe(controller.signal.reason);
  });

  it.each([
    {
      condition: 'the latest is no release version',
      file: versionsFileOf({
        latest: 'v0.70.0',
      }),
      problems: [
        'latest',
      ],
    },
    {
      condition: 'a release is no release version',
      file: versionsFileOf({
        versions: [
          '0.70.0',
          '0.69.2.1',
        ],
      }),
      problems: [
        'versions.1',
      ],
    },
    {
      condition: 'the latest is a list that holds a release version',
      file: versionsFileOf({
        latest: [
          '0.70.0',
        ],
      }),
      problems: [
        'latest',
      ],
    },
    {
      condition: 'the latest is missing and the releases are not a list',
      file: {
        versions: '0.69.2',
      },
      problems: [
        'latest',
        'versions',
      ],
    },
  ])(
    'should fail as malformed, naming each problem’s place, when $condition',
    async ({ file, problems }) => {
      // Arrange
      const repository = createStaticFileVersionsRepository({
        address: '/versions.json',
        transport: servingFile(file),
      });

      // Act
      const failure = await failureOf(repository.read(new AbortController().signal));

      // Assert
      expect(failure).toStrictEqual({
        cause: 'ZodError',
        code: VersionsFailure.Malformed,
        details: {
          address: '/versions.json',
          problems,
        },
      });
    },
  );
});
