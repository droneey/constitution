interface DistributionSources {
  /**
   * Each file the distribution of the folder packs, by its path in the distribution, to the folder of the
   * package whose build makes it, from the distribution's folder; none where no package builds it.
   */
  readonly packagesOf: (folder: string) => ReadonlyMap<string, string>;
}

export type { DistributionSources };
