import type { Setting } from '../../domain/entities';
import { settingModel } from './models';

// A null leaves its map or list, as constitution spells no absence by it.
const withoutNull = (_key: string, held: unknown): unknown => {
  if (Array.isArray(held)) {
    return held.filter((entry) => entry !== null);
  }

  return held === null ? undefined : held;
};

/** A date becomes its text; undefined for a value that holds none, such as a null alone. */
const settingOfWire = (held: unknown): Setting | undefined => {
  const json: string | undefined = JSON.stringify(held, withoutNull);
  const parsed = json === undefined ? undefined : settingModel.safeParse(JSON.parse(json));

  return parsed?.success === true ? parsed.data : undefined;
};

export { settingOfWire };
