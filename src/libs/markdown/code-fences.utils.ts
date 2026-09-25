const FENCE = /^ {0,3}(?:```|~~~)/;

interface FenceState {
  isInside: boolean;
  lines: readonly string[];
}

const step = (state: FenceState, line: string): FenceState => {
  if (FENCE.test(line)) {
    return {
      isInside: !state.isInside,
      lines: [
        ...state.lines,
        '',
      ],
    };
  }

  return {
    isInside: state.isInside,
    lines: [
      ...state.lines,
      state.isInside ? '' : line,
    ],
  };
};

const withoutCodeFences = (text: string): string =>
  text
    .split('\n')
    .reduce(step, {
      isInside: false,
      lines: [],
    })
    .lines.join('\n');

const isFence = (line: string): boolean => FENCE.test(line);

export { isFence, withoutCodeFences };
