import { attempted, isSyntaxError } from '#/kernel/utils';
import { Version } from '#/kernel/value-objects';
import { isNestedWithin, readTextWithin } from '#/libs/bounded-input';

import type { ReleaseFeed } from '../../domain/contracts';
import type { LatestRelease } from '../../domain/entities';
import { ReleaseLookup } from '../../domain/entities';
import { releasesModel } from './models';

// Why: every release is published as a pre-release first, which GitHub's latest leaves out, so the
// newest of the list is read; one is all the list is asked for.
const RELEASES = 'https://api.github.com/repos/droneey/constitution/releases?per_page=1';
const TAG_PREFIX = /^v/;
const MAX_ANSWER_BYTES = 1_048_576;
const MAX_ANSWER_DEPTH = 16;

const UNREADABLE = {
  lookup: ReleaseLookup.Unreadable,
} as const satisfies LatestRelease;

// Why: fetch throws these when the network is down, a proxy refuses the call, or it ran out of
// time; Bun gives a refused connection or tunnel its code.
const isUnanswered = (error: unknown): error is Error =>
  error instanceof TypeError ||
  error instanceof DOMException ||
  (error instanceof Error && 'code' in error);

interface GitHubReleaseFeedInput {
  readonly fetch: (url: string, init: RequestInit) => Promise<Response>;
  readonly timeoutMs: number;
}

const createGitHubReleaseFeed = (input: GitHubReleaseFeedInput): ReleaseFeed => {
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
      if (!isUnanswered(error)) {
        throw error;
      }

      return {
        lookup: ReleaseLookup.Unanswered,
        reason: error.message,
      };
    }
  };

  return {
    latest: async (): Promise<LatestRelease> => {
      const answer = await answerOf();

      if (!(answer instanceof Response)) {
        return answer;
      }

      if (!answer.ok) {
        return {
          lookup: ReleaseLookup.Refused,
          status: answer.status,
        };
      }

      const text = await readTextWithin({
        maxBytes: MAX_ANSWER_BYTES,
        stream: answer.body ?? [],
      });

      if (
        text === undefined ||
        !isNestedWithin({
          maxDepth: MAX_ANSWER_DEPTH,
          text,
        })
      ) {
        return UNREADABLE;
      }

      const body = attempted<unknown>({
        effect: () => JSON.parse(text),
        isRecognised: isSyntaxError,
      });
      const version = releasesModel.safeParse(body).data?.[0]?.tag_name.replace(TAG_PREFIX, '');

      return Version.is(version)
        ? {
            lookup: ReleaseLookup.Found,
            version,
          }
        : UNREADABLE;
    },
  };
};

export { createGitHubReleaseFeed };
