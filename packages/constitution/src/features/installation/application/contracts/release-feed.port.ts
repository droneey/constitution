import type { LatestRelease } from '../../domain/latest-release/entities';

interface ReleaseFeed {
  readonly latest: () => Promise<LatestRelease>;
}

export type { ReleaseFeed };
