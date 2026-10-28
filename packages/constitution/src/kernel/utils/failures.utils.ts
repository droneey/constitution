interface RecognisedFailureInput<TFailure> {
  readonly error: unknown;
  readonly isRecognised: (error: unknown) => error is TFailure;
}

const recognisedFailure = <TFailure>(input: RecognisedFailureInput<TFailure>): TFailure => {
  if (input.isRecognised(input.error)) {
    return input.error;
  }

  throw input.error;
};

interface AttemptInput<TOutcome, TFailure> {
  readonly effect: () => TOutcome;
  readonly isRecognised: (error: unknown) => error is TFailure;
}

const attempted = <TOutcome, TFailure = unknown>(
  input: AttemptInput<TOutcome, TFailure>,
): TOutcome | undefined => {
  let outcome: TOutcome | undefined;

  try {
    outcome = input.effect();
  } catch (error) {
    recognisedFailure({
      error,
      isRecognised: input.isRecognised,
    });
  }

  return outcome;
};

const isSyntaxError = (error: unknown): error is SyntaxError => error instanceof SyntaxError;

const isRangeError = (error: unknown): error is RangeError => error instanceof RangeError;

export { attempted, isRangeError, isSyntaxError, recognisedFailure };
