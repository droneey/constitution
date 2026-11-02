const toolNotRunMessage = (toolName: string): string =>
  `${toolName} could not start; install it, and run the check again`;

const toolTimedOutMessage = (toolName: string): string =>
  `${toolName} ran past the time the check gives it; mutate fewer files in one run`;

const toolStoppedMessage = (toolName: string): string =>
  `${toolName} was stopped before its end; run the check again`;

export { toolNotRunMessage, toolStoppedMessage, toolTimedOutMessage };
