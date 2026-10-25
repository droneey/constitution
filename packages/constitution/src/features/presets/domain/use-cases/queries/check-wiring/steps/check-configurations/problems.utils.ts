import { Placeholder } from '#/kernel/constants';
import type { WiringProblem } from '#/kernel/entities';
import { WiringProblemKind } from '#/kernel/entities';
import { PartAddress } from '#/kernel/value-objects';

import type { PresetPart, WiringContext } from '../../../../../entities';
import { Parts } from '../../../../../entities';
import { isAnchored, isComment, namedOf, presetsPrefix } from '../../../shared/wiring';

const FROM = /^[ \t]*#[ \t]*from /;
const END = /^[ \t]*#[ \t]*end /;
const EXTENDS = /extends?[ \t]*=/;
const BLANK = /^[ \t]*$/;
const TRAILING_BLANKS = /[ \t]+$/;
const EXTENSION = /\..*/;
// presets/<scope>/<tool>/<axis>/<file>
const PART_SEGMENTS = 5;

// <package> in a part stands for the project's import package, at least one character long.
const lineMatches = (input: { got: string; want: string }): boolean => {
  const { got, want } = input;

  if (!want.includes(Placeholder.Package)) {
    return want === got;
  }

  const first = want.slice(0, want.indexOf(Placeholder.Package));
  const last = want.slice(want.lastIndexOf(Placeholder.Package) + Placeholder.Package.length);

  if (!got.startsWith(first)) {
    return false;
  }

  let position = first.length + 1;

  for (const segment of want.split(Placeholder.Package).slice(1, -1)) {
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
  readonly context: WiringContext;
  readonly expected: readonly string[];
  readonly folder: string;
  readonly lines: readonly string[];
  readonly tool: string;
}

// The problem of the copy whose marker opens at line, or undefined when it holds.
const copyProblemOf = (
  input: CopyInput & {
    at: number;
    line: string;
  },
): WiringProblem | undefined => {
  const { context, lines, tool } = input;
  const path = input.line.replace(TRAILING_BLANKS, '');
  const rel = path.slice(path.indexOf(presetsPrefix));
  const segments = rel.split('/');

  if (
    segments.length < PART_SEGMENTS ||
    segments[2] !== tool ||
    !isAnchored({
      before: path.slice(0, path.indexOf(presetsPrefix)),
      folder: input.folder,
      naming: context,
    })
  ) {
    return undefined;
  }

  if (rel.includes(' ') || rel.includes(',')) {
    return {
      kind: WiringProblemKind.MarkerSaysMore,
      tool,
    };
  }

  const part = `${segments[1]}/${segments[3]}/${segments[4]}`.replace(EXTENSION, '');
  const file = Parts.fileAt(context.parts, rel);
  const text = Parts.textAt(context.parts, rel);

  if (file === undefined) {
    return {
      kind: WiringProblemKind.CopyOfRemovedPart,
      part,
    };
  }

  if (!input.expected.includes(part)) {
    return {
      kind: WiringProblemKind.CopyNotTaken,
      part,
    };
  }

  const after = lines.slice(input.at + 1);
  const close = after.findIndex((candidate) => END.test(candidate) && candidate.includes(rel));

  if (close === -1) {
    return {
      kind: WiringProblemKind.CopyWithoutEnd,
      part,
    };
  }

  // a part that cannot be read is warned of apart, and its copy is left unjudged
  if (text === undefined) {
    return undefined;
  }

  const want = linesOf(text);
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

  return isWhole
    ? undefined
    : {
        kind: WiringProblemKind.CopyEdited,
        part,
      };
};

// Each part sits between "# from <path>" and "# end <path>", and the lines around the pairs are the
// project's own.
const copyProblemsOf = (input: CopyInput): readonly WiringProblem[] =>
  input.lines.flatMap((line, at) => {
    const problem = FROM.test(line)
      ? copyProblemOf({
          ...input,
          at,
          line,
        })
      : undefined;

    return problem === undefined
      ? []
      : [
          problem,
        ];
  });

interface ChainInput {
  readonly context: WiringContext;
  readonly entries: readonly PresetPart[];
  readonly folder: string;
  readonly lines: readonly string[];
  readonly tool: string;
}

// A chain's marker lists its links from the first to the end, and the file extends the end; a
// chain with a link that cannot be read is warned of apart, and left unjudged.
const chainProblemsOf = (input: ChainInput): readonly WiringProblem[] => {
  const { context, entries, tool } = input;
  const { parts } = context;

  if (entries.some(({ file }) => Parts.textAt(parts, file.path) === undefined)) {
    return [];
  }

  const byName = new Map<string | undefined, PartAddress>(
    entries.map(({ address }) => [
      address.name,
      address,
    ]),
  );
  const extended = new Set(entries.map(({ address }) => Parts.linkOf(parts, address)));
  const endPart = entries.findLast(({ address }) => !extended.has(address.name));

  if (endPart === undefined) {
    return [];
  }

  const end = endPart.address;
  const sequence: PartAddress[] = [];

  for (
    let current: PartAddress | undefined = end;
    current !== undefined && !sequence.includes(current);
    current = byName.get(Parts.linkOf(parts, current))
  ) {
    sequence.push(current);
  }

  const order = sequence.toReversed().map(PartAddress.shortOf).join(' ');
  const endPath = endPart.file.path;
  const prefix = `${presetsPrefix}${end.scope}/${tool}/`;
  // a marker that names the end names a part of its scope
  const markers = input.lines
    .filter((line) => FROM.test(line))
    .map((line) =>
      namedOf({
        folder: input.folder,
        isCodeOnly: false,
        naming: context,
        text: line,
        tool,
      }),
    )
    .filter((marker) => marker.join(' ') !== order && marker.includes(PartAddress.shortOf(end)))
    .map(
      (): WiringProblem => ({
        kind: WiringProblemKind.MarkerOutOfOrder,
        tool,
      }),
    );
  const shorts = input.lines
    .filter(
      (line) =>
        !isComment(line) && EXTENDS.test(line) && line.includes(prefix) && !line.includes(endPath),
    )
    .map(
      (): WiringProblem => ({
        kind: WiringProblemKind.ExtendsShortOfEnd,
        tool,
      }),
    );

  return [
    ...markers,
    ...shorts,
  ];
};

export { chainProblemsOf, copyProblemsOf };
