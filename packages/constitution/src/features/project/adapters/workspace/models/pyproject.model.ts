import { z } from 'zod';

const pyprojectModel = z.looseObject({
  tool: z
    .looseObject({
      uv: z
        .looseObject({
          workspace: z
            .looseObject({
              exclude: z.array(z.string()).optional(),
              members: z.array(z.string()).optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export { pyprojectModel };
