import { z } from 'zod';

// A pyproject.toml as far as uv's workspace goes: the globs of its members and of those left out.
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

type PyprojectWire = z.infer<typeof pyprojectModel>;

export type { PyprojectWire };
export { pyprojectModel };
