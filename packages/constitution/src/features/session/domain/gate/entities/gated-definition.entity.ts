import type { AbsolutePath } from '#/kernel/value-objects';

import { RuleHash } from '../value-objects';
import type { RulesRead } from './gated-rule.entity';

interface GatedDefinition {
  readonly file: AbsolutePath;
  readonly hash: RuleHash;
  readonly text: string;
}

interface GatedDefinitionInput {
  readonly file: AbsolutePath;
  readonly hashOf: (text: string) => string;
  readonly text: string;
}

const create = (input: GatedDefinitionInput): GatedDefinition => ({
  file: input.file,
  hash: RuleHash.create(input.hashOf(input.text)),
  text: input.text,
});

const isRead = (definition: GatedDefinition, read: RulesRead): boolean =>
  read.definitions.has(definition.hash);

const keyOf = (definition: GatedDefinition): RuleHash => definition.hash;

const GatedDefinition = {
  create,
  isRead,
  keyOf,
} as const;

export { GatedDefinition };
