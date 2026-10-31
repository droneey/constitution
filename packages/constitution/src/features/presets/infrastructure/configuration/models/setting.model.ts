import { z } from 'zod';

type SettingWire =
  | boolean
  | number
  | string
  | readonly SettingWire[]
  | {
      readonly [key: string]: SettingWire;
    };

const settingModel: z.ZodType<SettingWire> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.number(),
    z.string(),
    z.array(settingModel),
    z.record(z.string(), settingModel),
  ]),
);

export { settingModel };
