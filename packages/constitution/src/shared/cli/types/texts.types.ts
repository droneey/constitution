/** One format's text for each code of a map from a code to the details it names. */
type TextsOf<TDetails> = {
  readonly [TCode in keyof TDetails]: (details: TDetails[TCode]) => string;
};

export type { TextsOf };
