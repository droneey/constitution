const NO_RULES_MESSAGE = 'No rule of the Constitution governs these files.';

const outsideMessage = (files: string): string =>
  `No project with a constitution.yaml holds ${files}, so no rule is given for them.`;

const unreadRulesMessage = (causeLines: readonly string[]): string =>
  [
    'The rules that govern these files cannot be read:',
    ...causeLines,
  ].join('\n');

export { NO_RULES_MESSAGE, outsideMessage, unreadRulesMessage };
