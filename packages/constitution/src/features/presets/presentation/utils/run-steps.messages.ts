import type { UnitPath } from '#/kernel/value-objects';

interface UnitStepInput {
  readonly command: string;
  readonly unitPath: UnitPath;
}

interface StepFailedInput {
  readonly code: number;
  readonly command: string;
}

const lineMessage = (line: string): string => `${line}\n`;

const stepMessage = (command: string): string => lineMessage(`$ ${command}`);

const unitStepMessage = ({ command, unitPath }: UnitStepInput): string =>
  lineMessage(`$ (${unitPath}) ${command}`);

const stepFailedMessage = ({ code, command }: StepFailedInput): string =>
  lineMessage(`${command} ended with code ${String(code)}`);

export { lineMessage, stepFailedMessage, stepMessage, unitStepMessage };
