import { z } from 'zod';

const distributionEntryModel = z.strictObject({
  /** the file of the package's build output, from the package's folder */
  file: z.string(),
  /** the package's folder, from the distribution's */
  package: z.string(),
});

/** Each file the distribution packs, by its path in the distribution. */
const distributionMapModel = z.record(z.string(), distributionEntryModel);

type DistributionMapWire = z.infer<typeof distributionMapModel>;

export type { DistributionMapWire };
export { distributionMapModel };
