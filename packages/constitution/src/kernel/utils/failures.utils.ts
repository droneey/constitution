// A catch handles only the failures it recognises: this gives back the one it recognises and
// rethrows any other, so a defect never passes for an expected failure.
const recognisedFailure = (input: {
  error: unknown;
  isRecognised: (error: unknown) => boolean;
}): unknown => {
  if (input.isRecognised(input.error)) {
    return input.error;
  }

  throw input.error;
};

// The outcome of an effect, or undefined when it fails as the caller expects; any other failure
// is rethrown.
const attempted = <TOutcome>(input: {
  effect: () => TOutcome;
  isRecognised: (error: unknown) => boolean;
}): TOutcome | undefined => {
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
