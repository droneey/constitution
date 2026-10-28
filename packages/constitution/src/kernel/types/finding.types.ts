interface Finding<TCode extends string = string, TDetails = object> {
  readonly code: TCode;
  readonly details: TDetails;
  readonly path: string;
}

type Problem<TCode extends string = string, TDetails = object> = Omit<
  Finding<TCode, TDetails>,
  'path'
>;

type FindingOf<TDetails> = {
  readonly [TCode in keyof TDetails & string]: Finding<TCode, TDetails[TCode]>;
}[keyof TDetails & string];

type ProblemOf<TDetails> = {
  readonly [TCode in keyof TDetails & string]: Problem<TCode, TDetails[TCode]>;
}[keyof TDetails & string];

export type { Finding, FindingOf, ProblemOf };
