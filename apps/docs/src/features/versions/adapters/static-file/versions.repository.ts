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

/** `fetch` rejects with a `TypeError` when the network fails, and the timeout's signal with a `TimeoutError` */
const isUnreachable = (error: unknown): boolean =>
  error instanceof TypeError || (error instanceof DOMException && error.name === 'TimeoutError');

/** reads the list at the site's root, so an old release's site learns of every later one */
export const createStaticFileVersionsRepository = ({
  address,
  timeoutMs = READ_TIMEOUT_MS,
  transport = fetch,
}: StaticFileVersionsInput): VersionsQueryRepository => ({
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
        code: VersionsFailure.Unanswered,
        details: {
          address,
          status: response.status,
        },
      });
    }

    const file = versionsModel.safeParse(await response.json());

    if (!file.success) {
      throw new VersionsError(
        {
          code: VersionsFailure.Malformed,
          details: {
            address,
            problems: file.error.issues.map((issue) => issue.path.map(String).join('.')),
          },
        },
        {
          cause: file.error,
        },
      );
    }

    return file.data;
  },
});
