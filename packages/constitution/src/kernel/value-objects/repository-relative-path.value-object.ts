import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { isInnerPath } from '../utils';
import type { AbsolutePath } from './absolute-path.value-object';

type RepositoryRelativePath = Brand<string, 'RepositoryRelativePath'>;

const is = (candidate: unknown): candidate is RepositoryRelativePath =>
  typeof candidate === 'string' && isInnerPath(candidate);

/**
 * @throws {InvalidValueError} when the text is absolute, not written one way, or leaves the
 * folder
 */
const create = (text: string): RepositoryRelativePath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.RepositoryRelativePath,
      details: {
        text,
      },
    });
  }

  return text;
};

const join = (folderPath: RepositoryRelativePath, relativePath: string): RepositoryRelativePath =>
  folderPath === ''
    ? create(relativePath)
    : create(`${folderPath}${PATH_SEPARATOR}${relativePath}`);

const fromAbsolute = (
  repositoryFolderPath: AbsolutePath,
  path: string,
): RepositoryRelativePath | undefined => {
  const prefix = `${repositoryFolderPath}${PATH_SEPARATOR}`;
  const rest = path.slice(prefix.length);

  return path.startsWith(prefix) && is(rest) ? rest : undefined;
};

const RepositoryRelativePath = {
  create,
  fromAbsolute,
  is,
  join,
} as const;

export { RepositoryRelativePath };
