import { reportLineOf } from '#/kernel/messages';

interface UnknownArgumentsInput {
  readonly args: string;
  readonly everythingArgument: string;
}

const nothingChangedMessage = reportLineOf('no line to mutate changed');

const unknownArgumentsMessage = (input: UnknownArgumentsInput): string =>
  reportLineOf(
    `${input.args} is no argument the check takes; run it with none to mutate the branch's changes, or with ${input.everythingArgument} to mutate everything`,
  );

export { nothingChangedMessage, unknownArgumentsMessage };
