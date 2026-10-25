interface RecognisedFailureInput {
  readonly error: unknown;
  readonly isRecognised: (error: unknown) => boolean;
}

// A catch handles only the failures it recognises: this gives back the one it recognises and
// rethrows any other, so a defect never passes for an expected failure.
const recognisedFailure = (input: RecognisedFailureInput): unknown => {
  if (input.isRecognised(input.error)) {
    return input.error;
  }

  throw input.error;
};

interface AttemptInput<TOutcome> {
  readonly effect: () => TOutcome;
  readonly isRecognised: (error: unknown) => boolean;
}

// The outcome of an effect, or undefined when it fails as the caller expects; any other failure
// is rethrown.
const attempted = <TOutcome>(input: AttemptInput<TOutcome>): TOutcome | undefined => {
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

const isSyntaxError = (error: unknown): boolean => error instanceof SyntaxError;

/** The syntax error a parse failed with; any other failure is rethrown. */
const syntaxErrorOf = (error: unknown): SyntaxError => {
  if (error instanceof SyntaxError) {
    return error;
  }

  throw error;
};

const isRangeError = (error: unknown): boolean => error instanceof RangeError;

export { attempted, isRangeError, isSyntaxError, recognisedFailure, syntaxErrorOf };
