const blockedMessage = (check: string): string =>
  `The tree changed since the check last passed. Run the project's check, \`${check}\`, and hand back only when it passes.`;

const reviewMessage = (blocks: string): string =>
  `Changed files fall under ${blocks}; /check edits reviews them against the rules.`;

const unjudgedMessage = (reason: string): string =>
  `git cannot report the tree, so the hand-back gate cannot judge it: ${reason}`;

export { blockedMessage, reviewMessage, unjudgedMessage };
