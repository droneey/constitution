interface RecognisedFailureInput<TFailure> {
  readonly error: unknown;
  readonly isRecognised: (error: unknown) => error is TFailure;
}

/**
 * A catch handles only the failures it recognises: this gives back the one it recognises and
 * rethrows any other, so a defect never passes for an expected failure.
 */
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

/**
 * The outcome of an effect, or undefined when it fails as the caller expects; any other failure is
 * rethrown.
 */
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
