import type { z } from 'zod';

const problemPathsOf = (error: z.ZodError): readonly string[] =>
  error.issues.map(({ path }) => path.join('.'));

export { problemPathsOf };
