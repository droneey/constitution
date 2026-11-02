import { z } from 'zod';

// Why: Bun imports a JSON file's value as its default export too.
const strykerConfigurationModuleModel = z.object({
  default: z.object({
    mutate: z.array(z.string()),
  }),
});

export { strykerConfigurationModuleModel };
