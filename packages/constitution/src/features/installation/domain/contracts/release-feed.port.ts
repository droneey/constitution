import type { LatestRelease } from '../entities';

interface ReleaseFeed {
  readonly latest: () => Promise<LatestRelease>;
}

export type { ReleaseFeed };
