import { z } from 'zod';

const installedPluginsModel = z.looseObject({
  plugins: z.record(
    z.string(),
    z.array(
      z.looseObject({
        installPath: z.string(),
      }),
    ),
  ),
});

type InstalledPluginsWire = z.infer<typeof installedPluginsModel>;

export type { InstalledPluginsWire };
export { installedPluginsModel };
