import { CURRENT_SEGMENT, PATH_SEPARATOR } from '#/kernel/constants';
import { normalizePath, withoutCodeFences, withoutInlineCode } from '#/kernel/utils';

const INLINE_LINK =
  /\[(?:[^[\]]|\[[^[\]]*\])*\]\(\s*(?:<(?<angled>[^>\n]*)>|(?<bare>[^\s()]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const LINK_DEFINITION = /^ {0,3}\[[^\]]+\]:\s*(?:<(?<angled>[^>\n]*)>|(?<bare>\S+))/gm;
const EXTERNAL = /^(?:[a-z][\d+.a-z-]*:|#|\/\/)/i;
const ANCHOR = '#';

const directoryOf = (path: string): string => {
  const end = path.lastIndexOf(PATH_SEPARATOR);

  return end === -1 ? CURRENT_SEGMENT : path.slice(0, end);
};

const joinPaths = (paths: readonly string[]): string => normalizePath(paths.join(PATH_SEPARATOR));

const isLocal = (target: string): boolean => target !== '' && !EXTERNAL.test(target);

const targetsIn = (text: string): readonly string[] =>
  [
    ...text.matchAll(INLINE_LINK),
    ...text.matchAll(LINK_DEFINITION),
  ].map((match) => {
    const { angled, bare } = match.groups ?? {};

    // Stryker disable next-line StringLiteral: one of the two targets always takes part
    return angled ?? bare ?? '';
  });

const localLinkTargets = (text: string): readonly string[] =>
  targetsIn(text)
    .filter(isLocal)
    .map(
      // Stryker disable next-line StringLiteral: split always yields a first part
      (target) => target.split(ANCHOR)[0] ?? '',
    );

const linkTargetsOf = (text: string): readonly string[] =>
  localLinkTargets(withoutInlineCode(withoutCodeFences(text)));

const foldersOf = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set([
    CURRENT_SEGMENT,
    ...[
      ...paths,
    ].flatMap((path) =>
      path
        .split(PATH_SEPARATOR)
        .slice(0, -1)
        .map((_segment, index, segments) => segments.slice(0, index + 1).join(PATH_SEPARATOR)),
    ),
  ]);

interface ResolveLinkInput {
  readonly path: string;
  readonly target: string;
}

/**
 * A link that starts with "/" is resolved from the repository root, as GitHub renders it; any other
 * link from the folder of the file that holds it.
 */
const resolveLink = (input: ResolveLinkInput): string => {
  const joined = input.target.startsWith(PATH_SEPARATOR)
    ? input.target
    : joinPaths([
        directoryOf(input.path),
        input.target,
      ]);
  const resolved = normalizePath(joined);

  return resolved.endsWith(PATH_SEPARATOR) ? resolved.slice(0, -PATH_SEPARATOR.length) : resolved;
};

export { directoryOf, foldersOf, linkTargetsOf, localLinkTargets, resolveLink };
