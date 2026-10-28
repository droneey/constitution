interface RecogniseInput {
  readonly caught: unknown;
  readonly isRecognised: (caught: unknown) => boolean;
}

const recognise = (input: RecogniseInput): void => {
  if (!input.isRecognised(input.caught)) {
    throw input.caught;
  }
};

export { recognise };
