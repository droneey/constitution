interface RecogniseInput {
  readonly caught: unknown;
  readonly isRecognised: (caught: unknown) => boolean;
}

/** @throws the caught failure itself when the catch does not recognise it. */
const recognise = (input: RecogniseInput): void => {
  if (!input.isRecognised(input.caught)) {
    throw input.caught;
  }
};

export { recognise };
