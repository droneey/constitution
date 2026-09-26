import { withoutCodeFences } from './code-fences.utils';
import { blankInlineCode } from './inline-code.utils';

// Group 1 is what comes before the target; group 2 the target in angle
// brackets, group 3 the bare target.
const INLINE_LINK =
  /(\[(?:[^[\]]|\[[^[\]]*\])*\]\(\s*)(?:<([^>\n]*)>|([^\s()]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const LINK_DEFINITION = /^( {0,3}\[[^\]]+\]:\s*)(?:<([^>\n]*)>|(\S+))/gm;
const EXTERNAL = /^(?:[a-z][\d+.a-z-]*:|#|\/\/)/i;
const ANCHOR = '#';
const BLANK = ' ';

interface LinkTarget {
  start: number;
  target: string;
}

const isLocal = (target: string): boolean =>
  target !== '' && !EXTERNAL.test(target);

const targetsIn = (text: string): readonly LinkTarget[] =>
  [
    ...text.matchAll(INLINE_LINK),
    ...text.matchAll(LINK_DEFINITION),
  ].map((match) => ({
    start:
      match.index + (match[1] ?? '').length + (match[2] === undefined ? 0 : 1),
    target: match[2] ?? match[3] ?? '',
  }));

const localLinkTargets = (text: string): readonly string[] =>
  targetsIn(text)
    .map((link) => link.target)
    .filter(isLocal)
    .map((target) => target.split(ANCHOR)[0] ?? '');

// Fences and code spans blanked to spaces, as the links check strips them: an
// offset in the prose is an offset in the text.
const proseOf = (text: string): string => {
  const unfenced = withoutCodeFences(text).split('\n');

  return blankInlineCode(
    text
      .split('\n')
      .map((line, index) =>
        unfenced[index] === line ? line : BLANK.repeat(line.length),
      )
      .join('\n'),
  );
};

// Code keeps its text: a link in a fence or a code span stays as written.
// Targets are spliced from the last back, so the earlier offsets still hold.
const rewriteLocalLinks = (input: {
  rewrite: (target: string) => string;
  text: string;
}): string =>
  targetsIn(proseOf(input.text))
    .map((link) => ({
      start: link.start,
      target: input.text.slice(link.start, link.start + link.target.length),
    }))
    .filter((link) => isLocal(link.target))
    .toSorted((left, right) => right.start - left.start)
    .reduce(
      (text, link) =>
        `${text.slice(0, link.start)}${input.rewrite(link.target)}${text.slice(link.start + link.target.length)}`,
      input.text,
    );

export { localLinkTargets, rewriteLocalLinks };
