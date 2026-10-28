import type { z } from 'zod';

/** Each place the input breaks the schema, as the keys and indexes that reach it joined by dots. */
const problemPathsOf = (error: z.ZodError): readonly string[] =>
  error.issues.map(({ path }) => path.join('.'));

export { problemPathsOf };
