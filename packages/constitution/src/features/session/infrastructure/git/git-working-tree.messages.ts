const gitEndedMessage = (ended: string): string => `git ended with ${ended}`;

const unknownObjectFormatMessage = (format: string): string =>
  `git names an object format the hooks do not know: ${format}`;

export { gitEndedMessage, unknownObjectFormatMessage };
