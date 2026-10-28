import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError } from '../errors';

interface PathRule<TCode extends string> {
  readonly accepts: (text: string) => boolean;
  /** the failure a text the rule does not accept is refused with */
  readonly code: TCode;
}

interface BrandedPath<TPath extends string> {
  /** @throws InvalidValueError when the text breaks the path's rule */
  readonly create: (text: string) => TPath;
  readonly is: (candidate: unknown) => candidate is TPath;
}

const PARENT_FOLDER_NAME = '..';

const isAbsolutePath = (text: string): boolean => text.startsWith(PATH_SEPARATOR);

const isFolderRelativePath = (text: string): boolean =>
  !(isAbsolutePath(text) || text.split(PATH_SEPARATOR).includes(PARENT_FOLDER_NAME));

/** The companion of a path type: a path from the root of the file system, or from a folder. */
const brandedPath = <TPath extends string, TCode extends string>(
  rule: PathRule<TCode>,
): BrandedPath<TPath> => {
  const is = (candidate: unknown): candidate is TPath =>
    typeof candidate === 'string' && rule.accepts(candidate);

  return {
    create: (text): TPath => {
      if (!is(text)) {
        throw new InvalidValueError({
          code: rule.code,
          text,
        });
      }

      return text;
    },
    is,
  };
};

export type { BrandedPath };
export { brandedPath, isAbsolutePath, isFolderRelativePath };
