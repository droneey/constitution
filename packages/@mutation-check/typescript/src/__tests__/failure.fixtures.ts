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

/** What a case compares of a failure, each part by value. */
interface CaughtFailure {
  readonly cause: unknown;
  readonly code: unknown;
  readonly details: unknown;
}

/** The failure of the kind the call throws or rejects with; any other fails the case. */
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

/** The code a system's failure carries, such as `ENOENT`. */
const causeCodeOf = (cause: unknown): unknown =>
  cause instanceof Error && 'code' in cause ? cause.code : undefined;

export { causeCodeOf, failureOf };
