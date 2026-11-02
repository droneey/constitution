interface MutateMalformedMessageInput {
  readonly fileName: string;
  readonly problemPaths: readonly string[];
}

const missingMessage = (fileNames: readonly string[]): string =>
  `no configuration of the mutation tool (${fileNames.join(', ')}); write one`;

const unreadableMessage = (fileName: string): string => `${fileName} could not be read; fix it`;

const mutateMalformedMessage = (input: MutateMalformedMessageInput): string =>
  `${input.fileName} holds ${input.problemPaths.join(', ')} not of the shape the mutation tool reads; name the files to mutate as a list of patterns`;

export { missingMessage, mutateMalformedMessage, unreadableMessage };
