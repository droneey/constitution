import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type AbsolutePath = Brand<string, 'AbsolutePath'>;

const is = (candidate: unknown): candidate is AbsolutePath =>
  typeof candidate === 'string' && candidate.startsWith(PATH_SEPARATOR);

/** @throws {InvalidValueError} when the text does not open with "/" */
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

const join = (folderPath: AbsolutePath, relativePath: string): AbsolutePath => {
  if (relativePath === '') {
    return folderPath;
  }

  return folderPath === PATH_SEPARATOR
    ? create(`${PATH_SEPARATOR}${relativePath}`)
    : create(`${folderPath}${PATH_SEPARATOR}${relativePath}`);
};

const root = create(PATH_SEPARATOR);

const parentOf = (path: AbsolutePath): AbsolutePath => {
  const at = path.lastIndexOf(PATH_SEPARATOR);

  return at <= 0 ? root : create(path.slice(0, at));
};

const AbsolutePath = {
  create,
  is,
  join,
  parentOf,
  root,
} as const;

export { AbsolutePath };
