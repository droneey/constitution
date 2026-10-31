import type { Brand } from '#/kernel/types';

import { PATH_SEPARATOR } from '../../shared/constants';
import { InvalidValueError, ValueFailure } from '../../shared/errors';

type AbsolutePath = Brand<string, 'AbsolutePath'>;

const is = (candidate: unknown): candidate is AbsolutePath =>
  typeof candidate === 'string' && candidate.startsWith(PATH_SEPARATOR);

/** @throws {InvalidValueError} when the text does not open with "/" */
const create = (text: string): AbsolutePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.PathNotAbsolute,
      details: {
        value: text,
      },
    });
  }

  return text;
};

const AbsolutePath = {
  create,
  is,
} as const;

export { AbsolutePath };
