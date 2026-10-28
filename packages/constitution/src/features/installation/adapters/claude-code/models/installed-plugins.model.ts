import { z } from 'zod';

/** The plugins are keyed by names from outside the program, so they are read into a Map. */
const installedPluginsModel = z.looseObject({
  plugins: z
    .record(
      z.string(),
      z.array(
        z.looseObject({
          installPath: z.string(),
        }),
      ),
    )
    .transform((plugins) => new Map(Object.entries(plugins))),
});

export { installedPluginsModel };
