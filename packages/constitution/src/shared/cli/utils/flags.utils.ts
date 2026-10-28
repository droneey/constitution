import type { ZodType, z } from 'zod';

import { baseFlagsSchema, outputFlagsSchema } from '../constants';
import { UsageError, UsageFailure } from '../errors';

interface FlagsInput<TFlags> {
  readonly opts: unknown;
  readonly schema: ZodType<TFlags>;
}

/** @throws {@link UsageError} when the options do not parse */
const flagsOf = <TFlags>(input: FlagsInput<TFlags>): TFlags => {
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
const baseFlagsOf = (opts: unknown): z.output<typeof baseFlagsSchema> =>
  flagsOf({
    opts,
    schema: baseFlagsSchema,
  });

/** @throws {@link UsageError} when the options do not parse */
const outputFlagsOf = (opts: unknown): z.output<typeof outputFlagsSchema> =>
  flagsOf({
    opts,
    schema: outputFlagsSchema,
  });

export { baseFlagsOf, flagsOf, outputFlagsOf };
