import { realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const PARENT = '..';

/**
 * The real path of `input` resolved from `root`, or undefined when it leads out of the root.
 *
 * @throws when no file or folder is at that path
 */
const confinedPathOf = (root: string, input: string): string | undefined => {
  const path = realpathSync(resolve(root, input));
  const fromRoot = relative(realpathSync(root), path);

  return fromRoot === PARENT ||
    fromRoot.startsWith(`${PARENT}${sep}`) ||
    // Stryker disable next-line ConditionalExpression: only a path on another drive of Windows is absolute from the root
    isAbsolute(fromRoot)
    ? undefined
    : path;
};

export { confinedPathOf };
