import type { ZodType } from 'zod';

import { baseFlagsSchema, outputFlagsSchema } from '../constants';
import { UsageError, UsageFailure } from '../errors';

/** @throws {@link UsageError} when the options do not parse */
const flagsOf = <TFlags>(input: { opts: unknown; schema: ZodType<TFlags> }): TFlags => {
  const parsed = input.schema.safeParse(input.opts);

  if (!parsed.success) {
    throw new UsageError({
      code: UsageFailure.OptionsUnparsed,
      details: {
        problems: parsed.error.issues.map((issue) => `${String(issue.path)}: ${issue.message}`),
      },
    });
  }

  return parsed.data;
};

/** @throws {@link UsageError} when the options do not parse */
const baseFlagsOf = (
  opts: unknown,
): {
  readonly base?: string | undefined;
} =>
  flagsOf({
    opts,
    schema: baseFlagsSchema,
  });

/** @throws {@link UsageError} when the options do not parse */
const outputFlagsOf = (
  opts: unknown,
): {
  readonly color?: boolean | undefined;
  readonly motion?: boolean | undefined;
  readonly plain?: boolean | undefined;
} =>
  flagsOf({
    opts,
    schema: outputFlagsSchema,
  });

export { baseFlagsOf, outputFlagsOf };
