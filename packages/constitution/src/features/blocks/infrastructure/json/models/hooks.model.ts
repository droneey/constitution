import { z } from 'zod';

const hooksModel = z.looseObject({
  hooks: z.record(
    z.string(),
    z.array(
      z.looseObject({
        hooks: z.array(
          z.looseObject({
            command: z.string().optional(),
          }),
        ),
      }),
    ),
  ),
});

type HooksWire = z.infer<typeof hooksModel>;

export type { HooksWire };
export { hooksModel };
