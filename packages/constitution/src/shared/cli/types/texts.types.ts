type TextsOf<TDetails> = {
  readonly [TCode in keyof TDetails]: (details: TDetails[TCode]) => string;
};

export type { TextsOf };
