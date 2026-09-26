const FENCE = /^\s*(`{3,}|~{3,})(.*)$/;
const BACKTICK = '`';

interface Fence {
  character: string;
  length: number;
}

const openingOf = (line: string): Fence | undefined => {
  const match = FENCE.exec(line);
  const marker = match?.[1] ?? '';
  const info = match?.[2] ?? '';

  if (
    marker === '' ||
    (marker.startsWith(BACKTICK) && info.includes(BACKTICK))
  ) {
    return undefined;
  }

  return {
    character: marker.charAt(0),
    length: marker.length,
  };
};

const closes = (input: { fence: Fence; line: string }): boolean => {
  const match = FENCE.exec(input.line);
  const marker = match?.[1] ?? '';

  return (
    marker.startsWith(input.fence.character) &&
    marker.length >= input.fence.length &&
    (match?.[2] ?? '').trim() === ''
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
