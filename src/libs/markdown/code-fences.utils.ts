const FENCE = /^\s*(?:`{3,}|~{3,})/;
const BACKTICK = '`';

interface Fence {
  character: string;
  info: string;
  length: number;
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

  return fence?.character === BACKTICK && fence.info.includes(BACKTICK)
    ? undefined
    : fence;
};

const closes = (input: { fence: Fence; line: string }): boolean => {
  const closing = fenceOf(input.line);

  return (
    closing?.character === input.fence.character &&
    closing.length >= input.fence.length &&
    closing.info.trim() === ''
  );
};

// A fence closes only on its own character, at least as long, as CommonMark
// says; a shorter or different fence inside it is part of the sample.
const withoutCodeFences = (text: string): string => {
  const lines: string[] = [];
  let fence: Fence | undefined;

  for (const line of text.split('\n')) {
    if (fence === undefined) {
      fence = openingOf(line);
      lines.push(fence === undefined ? line : '');
    } else {
      fence = closes({
        fence,
        line,
      })
        ? undefined
        : fence;
      lines.push('');
    }
  }

  return lines.join('\n');
};

export { withoutCodeFences };
