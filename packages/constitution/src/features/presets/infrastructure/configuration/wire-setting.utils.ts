import type { Setting } from '../../domain/setting/entities';
import { settingModel } from './models';

const withoutNull = (_key: string, held: unknown): unknown => {
  if (Array.isArray(held)) {
    return held.filter((entry) => entry !== null);
  }

  return held === null ? undefined : held;
};

const settingOfWire = (held: unknown): Setting | undefined => {
  const json: string | undefined = JSON.stringify(held, withoutNull);
  const parsed = json === undefined ? undefined : settingModel.safeParse(JSON.parse(json));

  return parsed?.success === true ? parsed.data : undefined;
};

export { settingOfWire };
