import type { TextsOf } from '../types';

/** The text a format's table gives one code, which a union of codes cannot index the table for. */
const textOf = <TDetails, TCode extends keyof TDetails>(
  texts: TextsOf<TDetails>,
  code: TCode,
  details: TDetails[TCode],
): string => texts[code](details);

export { textOf };
