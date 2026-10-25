interface CountInput {
  readonly count: number;
  readonly noun: string;
}

const countOf = (input: CountInput): string =>
  `${String(input.count)} ${input.noun}${input.count === 1 ? '' : 's'}`;

export { countOf };
