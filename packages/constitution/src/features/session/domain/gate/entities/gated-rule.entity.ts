import type { LoweredLevel } from '#/kernel/constants';
import { Level } from '#/kernel/constants';
import type { RuleText, RuleWording } from '#/kernel/entities';
import type { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { RuleHash } from '../value-objects';

const unstatedLevel = Level.Must;

interface RuleLowered {
  readonly level: LoweredLevel;
  readonly reason: string;
  readonly via?: RuleSlug;
}

interface RuleStanding {
  readonly isHeld?: boolean;
  readonly level: Level;
  readonly lowered?: RuleLowered;
}

interface GatedRule extends RuleText, RuleStanding {
  readonly file: AbsolutePath;
  readonly hash: RuleHash;
}

interface RuleRead {
  readonly hash: RuleHash;
  readonly slug: RuleSlug;
}

interface RulesRead {
  readonly definitions: ReadonlySet<RuleHash>;
  readonly rules: ReadonlyMap<RuleSlug, ReadonlySet<RuleHash>>;
}

interface GatedRuleInput {
  readonly file: AbsolutePath;
  readonly hashOf: (text: string) => string;
  readonly standing: RuleStanding;
  readonly wording: RuleWording;
}

const levelOf = (input: { declared: Level | undefined; wording: RuleWording }): Level =>
  input.declared ?? input.wording.statedLevel ?? unstatedLevel;

// Why: a rule is given without its Why, so a Why rewritten alone asks for no reading again; a
// rule a tool holds is given as its heading alone, so its statement is asked for once none does,
// and a rule no tool holds keeps the hash it had before tools were told apart.
const hashedTextOf = (rule: RuleText & RuleStanding): string =>
  JSON.stringify([
    ...(rule.isHeld === true
      ? [
          rule.isHeld,
        ]
      : []),
    rule.slug,
    rule.tightens ?? '',
    rule.level,
    rule.lowered?.level ?? '',
    rule.lowered?.via ?? '',
    rule.lowered?.reason ?? '',
    rule.statement,
  ]);

const create = (input: GatedRuleInput): GatedRule => {
  const { standing, wording } = input;
  const rule = {
    ...standing,
    slug: wording.slug,
    statement: wording.statement,
    ...(wording.tightens === undefined
      ? {}
      : {
          tightens: wording.tightens,
        }),
    why: wording.why,
  };

  return {
    ...rule,
    file: input.file,
    hash: RuleHash.create(input.hashOf(hashedTextOf(rule))),
  };
};

const appliedLevelOf = (rule: GatedRule): Level => rule.lowered?.level ?? rule.level;

const isRead = (rule: RuleRead, read: RulesRead): boolean =>
  read.rules.get(rule.slug)?.has(rule.hash) === true;

const keyOf = (rule: RuleRead): string => `${rule.slug} ${rule.hash}`;

const GatedRule = {
  appliedLevelOf,
  create,
  isRead,
  keyOf,
  levelOf,
} as const;

export type { RuleLowered, RuleRead, RuleStanding, RulesRead };
export { GatedRule };
