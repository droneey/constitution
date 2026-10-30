import type { Brand } from '#/kernel/types';

import { PATH_SEPARATOR } from '../../shared/constants';
import { InvalidValueError, ValueFailure } from '../../shared/errors';

type SiteBasePath = Brand<string, 'SiteBasePath'>;

const is = (candidate: unknown): candidate is SiteBasePath =>
  typeof candidate === 'string' &&
  candidate.startsWith(PATH_SEPARATOR) &&
  candidate.endsWith(PATH_SEPARATOR);

/** @throws {InvalidValueError} when the text does not open and end with "/" */
const create = (text: string): SiteBasePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.SiteBasePathInvalid,
      details: {
        value: text,
      },
    });
  }

  return text;
};

const SiteBasePath = {
  create,
  is,
} as const;

export { SiteBasePath };
