const countOf = (input: { count: number; noun: string }): string =>
  `${String(input.count)} ${input.noun}${input.count === 1 ? '' : 's'}`;

export { countOf };
