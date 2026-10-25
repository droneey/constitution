import { z } from 'zod';

// A configuration's settings as JSON holds them once its nulls are left out.
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

export type { SettingWire };
export { settingModel };
