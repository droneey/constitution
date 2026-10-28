import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { isInnerPath } from '../utils';
import type { AbsolutePath } from './absolute-path.value-object';

/** A path inside the repository's folder, written one way; an empty one names the folder itself. */
type RepositoryRelativePath = Brand<string, 'RepositoryRelativePath'>;

const is = (candidate: unknown): candidate is RepositoryRelativePath =>
  typeof candidate === 'string' && isInnerPath(candidate);

/** @throws {@link InvalidValueError} when the text is absolute, not written one way, or leaves the folder */
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

/** The path a relative path names below the folder; an empty folder is the repository's own. */
const join = (folderPath: RepositoryRelativePath, relativePath: string): RepositoryRelativePath =>
  folderPath === ''
    ? create(relativePath)
    : create(`${folderPath}${PATH_SEPARATOR}${relativePath}`);

/**
 * The path from the repository's folder of a path inside it; undefined for one outside it, or one
 * whose rest is not written one way.
 */
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
