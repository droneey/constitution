import { posix } from 'node:path';

const ROOT = '/';
const ANCHOR = '#';

// A link that starts with "/" is resolved from the repository root, as GitHub
// renders it; any other link from the folder of the file that holds it.
const resolveLink = (input: { path: string; target: string }): string => {
  const joined = input.target.startsWith(ROOT)
    ? input.target.slice(ROOT.length)
    : posix.join(posix.dirname(input.path), input.target);
  const resolved = posix.normalize(joined);

  return resolved.length > 1 && resolved.endsWith(ROOT)
    ? resolved.slice(0, -ROOT.length)
    : resolved;
};

// A link target from the root, for text that leaves its file: the digests have
// no folder of their own. The anchor is no path and stays as written.
const targetFromRoot = (input: { path: string; target: string }): string => {
  const [path = '', ...anchor] = input.target.split(ANCHOR);

  return [
    resolveLink({
      path: input.path,
      target: path,
    }),
    ...anchor,
  ].join(ANCHOR);
};

export { resolveLink, targetFromRoot };
