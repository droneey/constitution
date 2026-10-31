interface CountedText {
  readonly many: (count: number) => string;
  readonly one: string;
}

interface CountedTextInput {
  readonly count: number;
  readonly text: CountedText;
}

const countedTextOf = (input: CountedTextInput): string =>
  input.count === 1 ? input.text.one : input.text.many(input.count);

export type { CountedText };
export { countedTextOf };
