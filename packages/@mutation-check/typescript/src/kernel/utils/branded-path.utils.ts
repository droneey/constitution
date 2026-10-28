import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError } from '../errors';

interface PathRule<TCode extends string> {
  readonly accepts: (text: string) => boolean;
  readonly refusalCode: TCode;
}

interface BrandedPath<TPath extends string> {
  /** @throws {InvalidValueError} when the text breaks the path's rule */
  readonly create: (text: string) => TPath;
  readonly is: (candidate: unknown) => candidate is TPath;
}

const PARENT_FOLDER_NAME = '..';

const isAbsolutePath = (text: string): boolean => text.startsWith(PATH_SEPARATOR);

const isFolderRelativePath = (text: string): boolean =>
  !(isAbsolutePath(text) || text.split(PATH_SEPARATOR).includes(PARENT_FOLDER_NAME));

const brandedPath = <TPath extends string, TCode extends string>(
  rule: PathRule<TCode>,
): BrandedPath<TPath> => {
  const is = (candidate: unknown): candidate is TPath =>
    typeof candidate === 'string' && rule.accepts(candidate);

  return {
    /** @throws {InvalidValueError} when the text breaks the path's rule */
    create: (text): TPath => {
      if (!is(text)) {
        throw new InvalidValueError({
          code: rule.refusalCode,
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
