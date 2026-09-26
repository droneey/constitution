import { posix } from 'node:path';

import {
  localLinkTargets,
  withoutCodeFences,
  withoutInlineCode,
} from '#/libs/markdown';

const ROOT = '/';
const HERE = '.';

const linkTargetsOf = (text: string): readonly string[] =>
  localLinkTargets(withoutInlineCode(withoutCodeFences(text)));

// A link that starts with "/" is resolved from the repository root, as GitHub
// renders it; any other link from the folder of the file that holds it.
const resolveLink = (input: { path: string; target: string }): string => {
  const joined = input.target.startsWith(ROOT)
    ? input.target.slice(ROOT.length)
    : posix.join(posix.dirname(input.path), input.target);
  const resolved = posix.normalize(joined === '' ? HERE : joined);

  return resolved.length > 1 && resolved.endsWith(ROOT)
    ? resolved.slice(0, -ROOT.length)
    : resolved;
};

const foldersOf = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set([
    HERE,
    ...[
      ...paths,
    ].flatMap((path) =>
      path
        .split(ROOT)
        .slice(0, -1)
        .map((_segment, index, segments) =>
          segments.slice(0, index + 1).join(ROOT),
        ),
    ),
  ]);

export { foldersOf, linkTargetsOf, resolveLink };
