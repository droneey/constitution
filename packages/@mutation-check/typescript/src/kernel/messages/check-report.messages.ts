const CHECK_NAME = 'mutation';

const reportLineOf = (text: string): string => `${CHECK_NAME}: ${text}\n`;

const unexpectedErrorMessage = (error: unknown): string =>
  `the check stopped on an error of its own, ${String(error)}; report it`;

export { reportLineOf, unexpectedErrorMessage };
