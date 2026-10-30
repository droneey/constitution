import type { LatestRelease } from '../../domain/entities';

interface ReleaseFeed {
  readonly latest: () => Promise<LatestRelease>;
}

export type { ReleaseFeed };
