import { z } from 'zod';

const marketplaceModel = z.looseObject({
  name: z.string().min(1),
  plugins: z
    .array(
      z.looseObject({
        name: z.string().min(1),
        source: z.union([
          z.string().min(1),
          z.looseObject({
            ref: z.string().optional(),
            repo: z.string().optional(),
            source: z.string().min(1),
          }),
        ]),
      }),
    )
    .min(1),
});

type MarketplaceWire = z.infer<typeof marketplaceModel>;

export type { MarketplaceWire };
export { marketplaceModel };
