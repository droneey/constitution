import type { Brand } from '#/kernel/types';

import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';

type RepositoryPath = Brand<string, 'RepositoryPath'>;
const PARENT = '..';

const is = (candidate: unknown): candidate is RepositoryPath =>
  typeof candidate === 'string' &&
  !candidate.startsWith(PATH_SEPARATOR) &&
  !candidate.split(PATH_SEPARATOR).includes(PARENT);

/** @throws {InvalidValueError} when the text opens with "/" or holds a ".." segment */
const create = (text: string): RepositoryPath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.PathOutsideRepository,
      details: {
        value: text,
      },
    });
  }

  return text;
};

const pathBelow = (folderPath: RepositoryPath, path: RepositoryPath): string | undefined => {
  const prefix = `${folderPath}${PATH_SEPARATOR}`;

  return path.startsWith(prefix) ? path.slice(prefix.length) : undefined;
};

const RepositoryPath = {
  create,
  is,
  pathBelow,
} as const;

export { RepositoryPath };
