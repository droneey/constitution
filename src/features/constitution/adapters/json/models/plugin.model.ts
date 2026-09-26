import { z } from 'zod';

const RELATIVE_DIRECTORY = /^\.\/.*\/$/;
const PLUGIN_NAME = /^[a-z0-9-]+$/;

const pluginModel = z.looseObject({
  name: z.string().regex(PLUGIN_NAME),
  skills: z
    .union([
      z.string().regex(RELATIVE_DIRECTORY),
      z.array(z.string().regex(RELATIVE_DIRECTORY)),
    ])
    .optional(),
});

type PluginWire = z.infer<typeof pluginModel>;

export type { PluginWire };
export { pluginModel };
