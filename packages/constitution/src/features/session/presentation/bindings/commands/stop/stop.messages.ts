import type { CountedText } from '../../../utils';

// Why: an agent may stop to ask the user something before its work is done, and a stop made while
// the stop hook is active goes through.
const QUESTION =
  'If you are stopping to ask the user a question and the work is not done, say so plainly and stop again.';

const checkMessage = (check: string): string =>
  `You changed files since the check last passed. Run the project's check, \`${check}\`, and hand back only when it passes. ${QUESTION}`;

const reviewMessage = (blocks: string): string =>
  `The changes fall under ${blocks} and no review covers this tree. Run /check to review them against the rules, and hand back only when the review is done. ${QUESTION}`;

interface SubagentChangesInput {
  readonly agent: string;
  readonly paths: string;
}

const subagentChangesMessage = (input: SubagentChangesInput): string =>
  `Subagent ${input.agent} changed ${input.paths}; a subagent cannot start the reviewer, so you, the coordinator, review its work with /check.`;

interface CheckAndReviewInput {
  readonly blocks: string;
  readonly check: string;
}

const checkAndReviewMessage = (input: CheckAndReviewInput): string =>
  `The files you changed have neither a passing check nor a review on this tree. Run the project's check, \`${input.check}\`, then /check to review them, as they fall under ${input.blocks}; hand back only when both are done. ${QUESTION}`;

const moreSubagentsText: CountedText = {
  many: (count) => `${count} more subagents changed files; review their work too.`,
  one: '1 more subagent changed files; review its work too.',
};

const moreBlocksText: CountedText = {
  many: (count) => `and ${count} more blocks`,
  one: 'and 1 more block',
};

const unjudgedMessage = (reason: string): string =>
  `git cannot report the tree, so the hand-back gate cannot judge it: ${reason}`;

export {
  checkAndReviewMessage,
  checkMessage,
  moreBlocksText,
  moreSubagentsText,
  reviewMessage,
  subagentChangesMessage,
  unjudgedMessage,
};
