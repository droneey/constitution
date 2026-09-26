import {
  localLinkTargets,
  withoutCodeFences,
  withoutInlineCode,
} from '#/libs/markdown';

const ROOT = '/';
const HERE = '.';

const linkTargetsOf = (text: string): readonly string[] =>
  localLinkTargets(withoutInlineCode(withoutCodeFences(text)));

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

export { foldersOf, linkTargetsOf };
