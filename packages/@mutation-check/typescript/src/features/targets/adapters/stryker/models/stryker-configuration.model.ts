import { z } from 'zod';

/** A Stryker configuration's module as Bun imports it: a JSON file's value is its default export too. */
const strykerConfigurationModuleModel = z.object({
  default: z.object({
    mutate: z.array(z.string()),
  }),
});

export { strykerConfigurationModuleModel };
