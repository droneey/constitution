const FENCE = /^\s*(?:`{3,}|~{3,})/;
const BACKTICK = '`';

interface FencedBlock {
  readonly info: string;
  readonly lines: readonly string[];
}

interface Fence {
  readonly character: string;
  readonly info: string;
  readonly length: number;
}

const fenceOf = (line: string): Fence | undefined => {
  const match = FENCE.exec(line);

  if (match === null) {
    return undefined;
  }

  const marker = match[0].trim();

  return {
    character: marker.charAt(0),
    info: line.slice(match[0].length),
    length: marker.length,
  };
};

const openingOf = (line: string): Fence | undefined => {
  const fence = fenceOf(line);

  return fence?.character === BACKTICK && fence.info.includes(BACKTICK) ? undefined : fence;
};

const closes = (input: { fence: Fence; line: string }): boolean => {
  const closing = fenceOf(input.line);

  return (
    closing?.character === input.fence.character &&
    closing.length >= input.fence.length &&
    closing.info.trim() === ''
  );
};

// Why: a fence closes only on its own character, at least as long, as CommonMark says; a shorter or
// different fence inside it is part of the sample.
const fencedLinesOf = (lines: readonly string[]): readonly boolean[] => {
  let fence: Fence | undefined;

  return lines.map((line): boolean => {
    if (fence === undefined) {
      fence = openingOf(line);

      return fence !== undefined;
    }

    fence = closes({
      fence,
      line,
    })
      ? undefined
      : fence;

    return true;
  });
};

const fencedBlocksOf = (lines: readonly string[]): readonly FencedBlock[] => {
  const blocks: FencedBlock[] = [];
  let open:
    | {
        readonly fence: Fence;
        readonly lines: string[];
      }
    | undefined;

  for (const line of lines) {
    if (open === undefined) {
      const fence = openingOf(line);

      if (fence !== undefined) {
        open = {
          fence,
          lines: [],
        };
        blocks.push({
          info: fence.info.trim(),
          lines: open.lines,
        });
      }
    } else if (
      closes({
        fence: open.fence,
        line,
      })
    ) {
      open = undefined;
    } else {
      open.lines.push(line);
    }
  }

  return blocks;
};

const withoutCodeFences = (text: string): string => {
  const lines = text.split('\n');
  const fenced = fencedLinesOf(lines);

  return lines.map((line, index) => (fenced[index] === true ? '' : line)).join('\n');
};

export type { FencedBlock };
export { fencedBlocksOf, fencedLinesOf, withoutCodeFences };
