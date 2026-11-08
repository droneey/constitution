import type { Level, LoweredLevel } from '#/kernel/constants';
import type { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

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

interface RulesHeadingInput {
  readonly file: AbsolutePath;
  readonly level: Level;
}

const partTitleMessage = (input: PartTitleInput): string =>
  `The rules to read, part ${input.number} of ${input.count}`;

const partIntroMessage = (): string =>
  "Each chapter's vocabulary comes first, then each rule's statement at the level that binds where you work, MUST before SHOULD. A rule's Why stays in the chapter its heading names, and `constitution rules --for <file> --why` prints it. Read the whole file.";

const vocabularyHeadingMessage = (file: AbsolutePath): string => `Vocabulary of ${file}`;

const rulesHeadingMessage = (input: RulesHeadingInput): string =>
  `${input.level} rules of ${input.file}`;

const loweredMessage = (input: LoweredInput): string =>
  `Lowered here to ${input.level}: ${input.reason}`;

const loweredThroughMessage = (input: LoweredThroughInput): string =>
  `Lowered here to ${input.level} through ${input.via}: ${input.reason}`;

const whyMessage = (why: string): string => `Why: ${why}`;

export {
  loweredMessage,
  loweredThroughMessage,
  partIntroMessage,
  partTitleMessage,
  rulesHeadingMessage,
  vocabularyHeadingMessage,
  whyMessage,
};
