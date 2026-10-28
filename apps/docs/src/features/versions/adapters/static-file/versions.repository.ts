import { isNoJson, isUnreachable, problemPathsOf, WHOLE_FILE_PATH } from '#/libs/served-json';

import type { VersionsQueryRepository } from '../../domain/contracts';
import type { Versions } from '../../domain/entities';
import { VersionsError, VersionsFailure } from '../../domain/errors';
import { versionsModel } from './models';

type Transport = (
  address: string,
  init: {
    signal: AbortSignal;
  },
) => Promise<Response>;

interface StaticFileVersionsInput {
  readonly address: string;
  readonly timeoutMs?: number;
  readonly transport?: Transport;
}

const READ_TIMEOUT_MS = 10_000;

const malformedError = (
  address: string,
  problems: readonly string[],
  cause: Error,
): VersionsError =>
  new VersionsError(
    {
      code: VersionsFailure.Malformed,
      details: {
        address,
        problems,
      },
    },
    {
      cause,
    },
  );

export const createStaticFileVersionsRepository = ({
  address,
  timeoutMs = READ_TIMEOUT_MS,
  transport = fetch,
}: StaticFileVersionsInput): VersionsQueryRepository => ({
  /** @throws {VersionsError} when the site answers no list of releases, in time or at all */
  read: async (signal): Promise<Versions> => {
    const response = await transport(address, {
      signal: AbortSignal.any([
        signal,
        AbortSignal.timeout(timeoutMs),
      ]),
    }).catch((error: unknown) => {
      if (!isUnreachable(error)) {
        throw error;
      }

      throw new VersionsError(
        {
          code: VersionsFailure.Unreachable,
          details: {
            address,
          },
        },
        {
          cause: error,
        },
      );
    });

    if (!response.ok) {
      throw new VersionsError({
        code: VersionsFailure.NoFile,
        details: {
          address,
          status: response.status,
        },
      });
    }

    const file: unknown = await response.json().catch((error: unknown) => {
      if (!isNoJson(error)) {
        throw error;
      }

      throw malformedError(
        address,
        [
          WHOLE_FILE_PATH,
        ],
        error,
      );
    });
    const parsedFile = versionsModel.safeParse(file);

    if (!parsedFile.success) {
      throw malformedError(address, problemPathsOf(parsedFile.error.issues), parsedFile.error);
    }

    return parsedFile.data;
  },
});
