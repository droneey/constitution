import { DRONEEY_FOLDER_NAME, sessionsFolderInProject } from '#/kernel/constants';
import type { AbsolutePath } from '#/kernel/value-objects';
import { atLinesText } from '#/shared/cli';

import type { CountedText } from './counted-text.utils';

interface OwedInput {
  readonly changedLines: readonly string[];
  readonly governingRules: string;
  readonly partLines: readonly string[];
}

const governingRulesText: CountedText = {
  many: (count) => `${count} rules that govern`,
  one: '1 rule that governs',
};

const actionsText: CountedText = {
  many: (count) => `${count} actions`,
  one: '1 action',
};

const morePartsText: CountedText = {
  many: (count) => `and ${count} more files, named again once you have read these and retried`,
  one: 'and 1 more file, named again once you have read these and retried',
};

const moreCausesText: CountedText = {
  many: (count) => `and ${count} more causes`,
  one: 'and 1 more cause',
};

const changedByCommandsMessage = (changed: string): string =>
  `You changed ${changed} through the shell or an MCP tool; read the rules that govern them, then re-check those changes.`;

const partLineMessage = (part: AbsolutePath): string => `- ${part}`;

const READ_EACH_MESSAGE =
  'Read each file below whole with the Read tool, with no offset and no limit:';

const refusedMessage = (input: OwedInput): string =>
  [
    ...input.changedLines,
    `Before this action, read the ${input.governingRules} it and the files you read or changed, as they apply now.`,
    READ_EACH_MESSAGE,
    ...input.partLines,
    'Then retry the action.',
  ].join('\n');

const turnHeldMessage = (input: OwedInput): string =>
  [
    ...input.changedLines,
    `Read the ${input.governingRules} what you read, then review your answer against them.`,
    READ_EACH_MESSAGE,
    ...input.partLines,
  ].join('\n');

interface UnparsedCauseInput {
  readonly config: AbsolutePath;
  readonly lines: readonly number[];
}

const unparsedCauseMessage = (input: UnparsedCauseInput): string =>
  `${input.config} does not parse${atLinesText(input.lines)}; fix it first: an edit of it is the one action that goes through`;

const noReleaseCauseMessage = (releaseFolderPath: AbsolutePath): string =>
  `the Constitution's release is not installed; run mise install (looked for it at ${releaseFolderPath} and in the main checkout)`;

const unreadableCauseMessage = (file: AbsolutePath): string =>
  `the rule file ${file} cannot be read`;

const unwritableCauseMessage = (folder: AbsolutePath): string =>
  `the rules to read cannot be written under ${folder}/${sessionsFolderInProject}`;

const causeLineMessage = (causeText: string): string => `- ${causeText}`;

const closedMessage = (causeLines: readonly string[]): string =>
  [
    'The Constitution this project declares cannot be read, so the rule gate refuses the action:',
    ...causeLines,
  ].join('\n');

const passedClosedMessage = (causeLines: readonly string[]): string =>
  [
    'The rule gate let this through after three refusals, though the Constitution this project declares cannot be read:',
    ...causeLines,
  ].join('\n');

const passedUnreadText: CountedText = {
  many: (count) =>
    `The rule gate let this through after three refusals; ${count} rules it asked for are still unread.`,
  one: 'The rule gate let this through after three refusals; 1 rule it asked for is still unread.',
};

const passesToldMessage = (actions: string): string =>
  `The gates let ${actions} through after three refusals; what they asked for was not done.`;

const unignoredMessage = `git does not ignore ${sessionsFolderInProject}, where the rule gate writes the rules to read; add ${DRONEEY_FOLDER_NAME}/ to .gitignore.`;

export type { OwedInput };
export {
  actionsText,
  causeLineMessage,
  changedByCommandsMessage,
  closedMessage,
  governingRulesText,
  moreCausesText,
  morePartsText,
  noReleaseCauseMessage,
  partLineMessage,
  passedClosedMessage,
  passedUnreadText,
  passesToldMessage,
  refusedMessage,
  turnHeldMessage,
  unignoredMessage,
  unparsedCauseMessage,
  unreadableCauseMessage,
  unwritableCauseMessage,
};
