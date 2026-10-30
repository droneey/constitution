interface MalformedMessageInput {
  readonly fileName: string;
  readonly problemPaths: readonly string[];
}

const missingMessage = (fileName: string): string =>
  `the unit holds no ${fileName}; write one as its test runner reads it`;

const unparsableMessage = (fileName: string): string =>
  `${fileName} could not be parsed; write it as its test runner reads it`;

const malformedMessage = (input: MalformedMessageInput): string =>
  `${input.fileName} holds ${input.problemPaths.join(', ')} not of the shape its test runner reads; write them as it reads them`;

export { malformedMessage, missingMessage, unparsableMessage };
