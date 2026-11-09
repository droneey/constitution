import { z } from 'zod';

const distributionEntryModel = z.strictObject({
  file: z.string(),
  package: z.string(),
});

const distributionMapModel = z.record(z.string(), distributionEntryModel);

type DistributionMapWire = z.infer<typeof distributionMapModel>;

export type { DistributionMapWire };
export { distributionMapModel };
