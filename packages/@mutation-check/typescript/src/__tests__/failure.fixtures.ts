import type { ProgramError } from '#/kernel/errors';

type FailureKind = abstract new (
  ...args: never[]
) => ProgramError<{
  readonly code: string;
}>;

interface FailureInput {
  readonly call: () => unknown;
  readonly kind: FailureKind;
}

interface CaughtFailure {
  readonly cause: unknown;
  readonly code: unknown;
  readonly details: unknown;
}

const failureOf = async (input: FailureInput): Promise<CaughtFailure | undefined> => {
  try {
    await input.call();
  } catch (error) {
    if (!(error instanceof input.kind)) {
      throw error;
    }

    return {
      cause: error.cause,
      code: error.code,
      details: error.details,
    };
  }

  return undefined;
};

const causeCodeOf = (cause: unknown): unknown =>
  cause instanceof Error && 'code' in cause ? cause.code : undefined;

export { causeCodeOf, failureOf };
