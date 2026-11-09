import { PROGRAM_NAME } from '../../../constants';

const usageLine = (commandName: string): string =>
  `usage: ${PROGRAM_NAME} ${commandName} <config>\n`;

const failureLine = (message: string): string => `${PROGRAM_NAME}: ${message}\n`;

export { failureLine, usageLine };
