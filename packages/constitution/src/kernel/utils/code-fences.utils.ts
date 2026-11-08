const FENCE = /^\s*(?:`{3,}|~{3,})/;
const BACKTICK = '`';

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

const withoutCodeFences = (text: string): string => {
  const lines = text.split('\n');
  const fenced = fencedLinesOf(lines);

  return lines.map((line, index) => (fenced[index] === true ? '' : line)).join('\n');
};

export { fencedLinesOf, withoutCodeFences };
