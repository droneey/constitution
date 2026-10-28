interface CommandTextInput {
  readonly args: readonly string[];
  readonly folderPath: string;
  readonly toolName: string;
}

interface ToolFailedMessageInput extends CommandTextInput {
  readonly mainlineName: string;
  readonly stderr: string;
}

const commandTextOf = (input: CommandTextInput): string =>
  `${input.toolName} ${input.args.join(' ')} in ${input.folderPath}`;

const toolNotRunMessage = (input: CommandTextInput): string =>
  `${commandTextOf(input)} could not start; install ${input.toolName}, and run the check inside the repository`;

const toolFailedMessage = (input: ToolFailedMessageInput): string =>
  `${commandTextOf(input)} failed: ${input.stderr}; fetch ${input.mainlineName}, and run the check inside the repository`;

const toolTimedOutMessage = (input: CommandTextInput): string =>
  `${commandTextOf(input)} did not answer in time; run the check again`;

const outputPastLimitMessage = (input: CommandTextInput): string =>
  `${commandTextOf(input)} answered past the size the check reads; mutate the branch in smaller changes`;

export { outputPastLimitMessage, toolFailedMessage, toolNotRunMessage, toolTimedOutMessage };
