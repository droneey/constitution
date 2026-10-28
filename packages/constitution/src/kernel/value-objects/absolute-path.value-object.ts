import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type AbsolutePath = Brand<string, 'AbsolutePath'>;

const is = (candidate: unknown): candidate is AbsolutePath =>
  typeof candidate === 'string' && candidate.startsWith(PATH_SEPARATOR);

/** @throws {@link InvalidValueError} when the text does not open with "/" */
const create = (text: string): AbsolutePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.AbsolutePath,
      details: {
        text,
      },
    });
  }

  return text;
};

/** The path a relative path names below the folder; an empty one names the folder itself. */
const join = (folderPath: AbsolutePath, relativePath: string): AbsolutePath => {
  if (relativePath === '') {
    return folderPath;
  }

  // the root's path is the separator alone
  return folderPath === PATH_SEPARATOR
    ? create(`${PATH_SEPARATOR}${relativePath}`)
    : create(`${folderPath}${PATH_SEPARATOR}${relativePath}`);
};

const AbsolutePath = {
  create,
  is,
  join,
} as const;

export { AbsolutePath };
