import { isSyntaxError, recognisedFailure } from '#/kernel/utils';
import { Version } from '#/kernel/value-objects';

import type { ReleaseFeed } from '../../domain/contracts';
import type { LatestRelease } from '../../domain/entities';
import { ReleaseLookup } from '../../domain/entities';
import { releasesModel } from './models';

// Every release is published as a pre-release first, which GitHub's latest leaves out, so the
// newest of the list is read; one is all the list is asked for.
const RELEASES = 'https://api.github.com/repos/droneey/constitution/releases?per_page=1';
const TAG_PREFIX = /^v/;

const unreachable = (cause: unknown): LatestRelease => ({
  cause,
  lookup: ReleaseLookup.Unreachable,
});

// What fetch throws when the network is down, a proxy refuses the call, or it ran out of time; Bun
// gives a refused connection or tunnel its code.
const isUnreachable = (error: unknown): boolean =>
  error instanceof TypeError ||
  error instanceof DOMException ||
  (error instanceof Error && 'code' in error);

const createGitHubReleaseFeed = (input: {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  timeoutMs: number;
}): ReleaseFeed => {
  const answerOf = async (): Promise<Response | LatestRelease> => {
    try {
      return await input.fetch(RELEASES, {
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'droneey-constitution',
        },
        signal: AbortSignal.timeout(input.timeoutMs),
      });
    } catch (error) {
      return unreachable(
        recognisedFailure({
          error,
          isRecognised: isUnreachable,
        }),
      );
    }
  };

  return {
    latest: async (): Promise<LatestRelease> => {
      const answer = await answerOf();

      if (!(answer instanceof Response)) {
        return answer;
      }

      if (!answer.ok) {
        return unreachable(answer);
      }

      const body: unknown = await answer.json().catch((error: unknown) =>
        recognisedFailure({
          error,
          isRecognised: isSyntaxError,
        }),
      );

      if (body instanceof SyntaxError) {
        return unreachable(body);
      }

      const read = releasesModel.safeParse(body);

      if (!read.success) {
        return unreachable(read.error);
      }

      const version = read.data[0]?.tag_name.replace(TAG_PREFIX, '');

      return Version.is(version)
        ? {
            lookup: ReleaseLookup.Found,
            version,
          }
        : unreachable(read.data);
    },
  };
};

export { createGitHubReleaseFeed };
