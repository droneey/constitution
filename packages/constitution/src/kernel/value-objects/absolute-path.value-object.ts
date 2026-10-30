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

const rootFolderPath = create(PATH_SEPARATOR);

const parentOf = (folderPath: AbsolutePath): AbsolutePath => {
  const at = folderPath.lastIndexOf(PATH_SEPARATOR);

  return at <= 0 ? rootFolderPath : create(folderPath.slice(0, at));
};

/** The folder, then each folder above it, the root last. */
const upwardFrom = (folderPath: AbsolutePath): readonly AbsolutePath[] =>
  folderPath === rootFolderPath
    ? [
        folderPath,
      ]
    : [
        folderPath,
        ...upwardFrom(parentOf(folderPath)),
      ];

const AbsolutePath = {
  create,
  is,
  join,
  upwardFrom,
} as const;

export { AbsolutePath };
