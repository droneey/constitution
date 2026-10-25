import { z } from 'zod';

const releasesModel = z.array(
  z.looseObject({
    // biome-ignore lint/style/useNamingConvention: GitHub names the field tag_name
    tag_name: z.string(),
  }),
);

type ReleasesWire = z.infer<typeof releasesModel>;

export type { ReleasesWire };
export { releasesModel };
