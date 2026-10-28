import { realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const PARENT_SEGMENT = '..';

interface PathInRoot {
  readonly path: string;
  readonly rootPath: string;
}

interface ConfinedPathInput {
  /** a path from outside the program, absolute or relative to the root */
  readonly givenPath: string;
  readonly rootPath: string;
}

const leadsOutOf = ({ rootPath, path }: PathInRoot): boolean => {
  const pathFromRoot = relative(rootPath, path);

  return (
    pathFromRoot === PARENT_SEGMENT ||
    pathFromRoot.startsWith(`${PARENT_SEGMENT}${sep}`) ||
    // Stryker disable next-line ConditionalExpression: only a path on another drive of Windows is absolute from the root
    isAbsolute(pathFromRoot)
  );
};

/**
 * The real path of `givenPath` resolved from `rootPath`, or undefined when it leads out of the root.
 * A path that leads out by its name alone is refused before the file system is asked, so the answer
 * never tells whether anything lies outside the root.
 *
 * @throws a failure {@link isMissingPathError} recognises when nothing lies at a path inside the root
 */
const confinedPathOf = ({ rootPath, givenPath }: ConfinedPathInput): string | undefined => {
  const resolvedPath = resolve(rootPath, givenPath);

  if (
    leadsOutOf({
      rootPath: resolve(rootPath),
      path: resolvedPath,
    })
  ) {
    return;
  }

  const realPath = realpathSync(resolvedPath);

  return leadsOutOf({
    rootPath: realpathSync(rootPath),
    path: realPath,
  })
    ? undefined
    : realPath;
};

export { confinedPathOf };
