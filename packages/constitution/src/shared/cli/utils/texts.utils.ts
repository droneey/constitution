import type { TextsOf } from '../types';

// Why: a union of codes cannot index the table.
const textOf = <TDetails, TCode extends keyof TDetails>(
  texts: TextsOf<TDetails>,
  code: TCode,
  details: TDetails[TCode],
): string => texts[code](details);

export { textOf };
