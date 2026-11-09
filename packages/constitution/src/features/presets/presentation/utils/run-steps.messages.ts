import type { UnitPath } from '#/kernel/value-objects';

import type { HeldRule } from '../../domain/run-plan/entities';

interface UnitStepInput {
  readonly command: string;
  readonly unitPath: UnitPath;
}

interface StepFailedInput {
  readonly code: number;
  readonly command: string;
}

interface BrokenRuleInput {
  readonly isWhyShown: boolean;
  readonly rule: HeldRule;
}

const lineMessage = (line: string): string => `${line}\n`;

const stepMessage = (command: string): string => lineMessage(`$ ${command}`);

const unitStepMessage = ({ command, unitPath }: UnitStepInput): string =>
  lineMessage(`$ (${unitPath}) ${command}`);

const stepFailedMessage = ({ code, command }: StepFailedInput): string =>
  lineMessage(`${command} ended with code ${String(code)}`);

const brokenRuleMessage = ({ isWhyShown, rule }: BrokenRuleInput): string =>
  `${lineMessage(`${rule.slug} · ${rule.level} — ${rule.statement}`)}${
    isWhyShown ? lineMessage(`  Why: ${rule.why}`) : ''
  }`;

export { brokenRuleMessage, lineMessage, stepFailedMessage, stepMessage, unitStepMessage };
