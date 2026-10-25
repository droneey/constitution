/**
 * What a check finds at a file: its code, a stable kebab-case id like a linter's rule id, and the
 * values it names; the text a reader sees is rendered from both at the edge.
 */
interface Finding<TCode extends string = string, TDetails = object> {
  readonly code: TCode;
  readonly details: TDetails;
  readonly path: string;
}

/** a finding before the file it is reported at is known */
type Problem<TCode extends string = string, TDetails = object> = Omit<
  Finding<TCode, TDetails>,
  'path'
>;

/** The findings of a map from each code to the details it names, one member per code. */
type FindingOf<TDetails> = {
  readonly [TCode in keyof TDetails & string]: Finding<TCode, TDetails[TCode]>;
}[keyof TDetails & string];

/** The problems of a map from each code to the details it names, one member per code. */
type ProblemOf<TDetails> = {
  readonly [TCode in keyof TDetails & string]: Problem<TCode, TDetails[TCode]>;
}[keyof TDetails & string];

export type { Finding, FindingOf, ProblemOf };
