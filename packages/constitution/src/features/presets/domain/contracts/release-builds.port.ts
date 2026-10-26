interface ReleaseBuilds {
  /**
   * Each built file's path from the pack's folder, to its source's path from there; none where the
   * pack lists no build.
   */
  readonly sourcesOf: (folder: string) => ReadonlyMap<string, string>;
}

export type { ReleaseBuilds };
