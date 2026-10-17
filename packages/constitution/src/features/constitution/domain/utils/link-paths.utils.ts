import { directoryOf, joinPaths, normalizePath } from './paths.utils';

const ROOT = '/';

// A link that starts with "/" is resolved from the repository root, as GitHub
// renders it; any other link from the folder of the file that holds it.
const resolveLink = (input: { path: string; target: string }): string => {
  const joined = input.target.startsWith(ROOT)
    ? input.target
    : joinPaths([
        directoryOf(input.path),
        input.target,
      ]);
  const resolved = normalizePath(joined);

  return resolved.endsWith(ROOT) ? resolved.slice(0, -ROOT.length) : resolved;
};

export { resolveLink };
