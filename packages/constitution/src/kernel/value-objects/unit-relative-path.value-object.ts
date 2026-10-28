import { CONFIG_FILE_NAME } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { isInnerPath } from '../utils';

/** A path inside a unit's folder, written one way; an empty one names the folder itself. */
type UnitRelativePath = Brand<string, 'UnitRelativePath'>;

const is = (candidate: unknown): candidate is UnitRelativePath =>
  typeof candidate === 'string' && isInnerPath(candidate);

/** @throws {@link InvalidValueError} when the text is absolute, not written one way, or leaves the folder */
const create = (text: string): UnitRelativePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.UnitRelativePath,
      details: {
        text,
      },
    });
  }

  return text;
};

const UnitRelativePath = {
  create,
  is,
} as const;

const configFilePath = UnitRelativePath.create(CONFIG_FILE_NAME);

export { configFilePath, UnitRelativePath };
