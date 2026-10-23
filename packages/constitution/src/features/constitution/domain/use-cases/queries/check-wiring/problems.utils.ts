import type { Naming } from './named.utils';
import { isAnchored, isComment, namedOf } from './named.utils';
import { keyOf, PRESETS } from './parts.utils';
import type { Part, WiringContext } from './wiring-context.utils';
import { shortOf } from './wiring-context.utils';

// What is wrong with a configuration's copies of a tool's parts, and with the chain it extends.

const PLACEHOLDER = '<package>';
const FROM = /^[ \t]*#[ \t]*from /;
const END = /^[ \t]*#[ \t]*end /;
const EXTENDS = /extends?[ \t]*=/;
const BLANK = /^[ \t]*$/;
const TRAILING_BLANKS = /[ \t]+$/;
const EXTENSION = /\..*/;
const PART_SEGMENTS = 5;

// <package> in a part stands for the project's import package, at least one character long.
const lineMatches = (input: { got: string; want: string }): boolean => {
  const { got, want } = input;

  if (!want.includes(PLACEHOLDER)) {
    return want === got;
  }

  const first = want.slice(0, want.indexOf(PLACEHOLDER));
  const last = want.slice(want.lastIndexOf(PLACEHOLDER) + PLACEHOLDER.length);

  if (!got.startsWith(first)) {
    return false;
  }

  let position = first.length + 1;

  for (const segment of want.split(PLACEHOLDER).slice(1, -1)) {
    const found = segment === '' ? 0 : got.slice(position).indexOf(segment) + 1;

    if (found === 0) {
      return false;
    }

    position += found + segment.length;
  }

  return got.length - last.length >= position && got.endsWith(last);
};

const linesOf = (text: string): readonly string[] =>
  text.split('\n').filter((line) => !BLANK.test(line));

interface CopyInput {
  context: WiringContext;
  expected: readonly string[];
  lines: readonly string[];
  tool: string;
}

// The problem of the copy whose marker opens at line, or '' when it holds.
const copyProblemOf = (
  input: CopyInput & {
    at: number;
    line: string;
  },
): string => {
  const { context, lines, tool } = input;
  const path = input.line.replace(TRAILING_BLANKS, '');
  const rel = path.slice(path.indexOf(PRESETS));
  const segments = rel.split('/');

  if (
    segments.length < PART_SEGMENTS ||
    segments[2] !== tool ||
    !isAnchored({
      before: path.slice(0, path.indexOf(PRESETS)),
      naming: context.naming,
    })
  ) {
    return '';
  }

  if (rel.includes(' ') || rel.includes(',')) {
    return `; a marker of ${tool} says more than its path`;
  }

  const key = `${segments[1]}/${segments[3]}/${segments[4]}`.replace(EXTENSION, '');
  const file = context.parts.partFile.get(rel);

  if (file === undefined) {
    return `; holds a copy of ${key} the release no longer has`;
  }

  if (!input.expected.includes(key)) {
    return `; copies ${key}, which it does not take`;
  }

  const after = lines.slice(input.at + 1);
  const close = after.findIndex((candidate) => END.test(candidate) && candidate.includes(rel));

  if (close === -1) {
    return `; the copy of ${key} has no end line`;
  }

  const want = linesOf(context.readPart(file));
  const got = after.slice(0, close).filter((candidate) => !BLANK.test(candidate));
  const isWhole =
    got.length === want.length &&
    want.every((wanted, index) =>
      lineMatches({
        // Stryker disable next-line StringLiteral: both hold as many lines
        got: got[index] ?? '',
        want: wanted,
      }),
    );

  return isWhole ? '' : `; the copy of ${key} is edited inside`;
};

// Each part sits between "# from <path>" and "# end <path>", and the lines around the pairs are the
// project's own.
const copyProblemsOf = (input: CopyInput): string =>
  input.lines
    .map((line, at) =>
      FROM.test(line)
        ? copyProblemOf({
            ...input,
            at,
            line,
          })
        : '',
    )
    .join('');

// A chain's marker lists its links from the first to the end, and the file extends the end.
const chainProblemsOf = (input: {
  context: WiringContext;
  entries: readonly Part[];
  lines: readonly string[];
  naming: Naming;
  tool: string;
}): string => {
  const { context, entries, tool } = input;
  const { links, partAt } = context.parts;
  const byName = new Map<string | undefined, Part>(
    entries.map((entry) => [
      entry.name,
      entry,
    ]),
  );
  const extended = new Set(
    entries.map((entry) => links.get(keyOf(entry.scope, entry.tool, entry.axis, entry.name))),
  );
  const end = entries.findLast((entry) => !extended.has(entry.name));

  if (end === undefined) {
    return '';
  }

  const sequence: Part[] = [];

  for (
    let current: Part | undefined = end;
    current !== undefined && !sequence.includes(current);
    current = byName.get(links.get(keyOf(end.scope, end.tool, end.axis, current.name)))
  ) {
    sequence.push(current);
  }

  const order = sequence.toReversed().map(shortOf).join(' ');
  // Stryker disable next-line StringLiteral: every part taken has its path
  const endPath = partAt.get(keyOf(end.scope, end.tool, end.axis, end.name)) ?? '';
  const prefix = `${PRESETS}${end.scope}/${tool}/`;
  // a marker that names the end names a part of its scope
  const markers = input.lines
    .filter((line) => FROM.test(line))
    .map((line) =>
      namedOf({
        isCodeOnly: false,
        naming: input.naming,
        text: line,
        tool,
      }),
    )
    .filter((marker) => marker.join(' ') !== order && marker.includes(shortOf(end)))
    .map(() => `; its marker of ${tool} lists the links out of order`);
  const shorts = input.lines
    .filter(
      (line) =>
        !isComment(line) && EXTENDS.test(line) && line.includes(prefix) && !line.includes(endPath),
    )
    .map(() => `; it extends a link of ${tool} short of the chain's end`);

  return [
    ...markers,
    ...shorts,
  ].join('');
};

export { chainProblemsOf, copyProblemsOf };
