import type { LoweredLevel } from '#/kernel/constants';
import type { RuleSlug } from '#/kernel/value-objects';

interface PartTitleInput {
  readonly count: number;
  readonly number: number;
}

interface LoweredInput {
  readonly level: LoweredLevel;
  readonly reason: string;
}

interface LoweredThroughInput extends LoweredInput {
  readonly via: RuleSlug;
}

const partTitleMessage = (input: PartTitleInput): string =>
  `The rules to read, part ${input.number} of ${input.count}`;

const partIntroMessage = (): string =>
  'Each rule is given at the level that binds where you work, with its Why. Read the whole file.';

const loweredMessage = (input: LoweredInput): string =>
  `Lowered here to ${input.level}: ${input.reason}`;

const loweredThroughMessage = (input: LoweredThroughInput): string =>
  `Lowered here to ${input.level} through ${input.via}: ${input.reason}`;

const whyMessage = (why: string): string => `Why: ${why}`;

export { loweredMessage, loweredThroughMessage, partIntroMessage, partTitleMessage, whyMessage };
