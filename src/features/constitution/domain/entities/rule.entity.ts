import type { Axis, Level } from '#/kernel';

interface StatedRule {
  readonly axis: Axis;
  readonly block: string;
  readonly check: string;
  readonly file: string;
  readonly ownTags: readonly string[];
  readonly parent: string | undefined;
  readonly slug: string;
  readonly statedLevel: Level | undefined;
  readonly statement: string;
  readonly why: string;
  readonly with: string | undefined;
}

interface Rule extends StatedRule {
  readonly level: Level;
  readonly tags: readonly string[];
}

export type { Rule, StatedRule };
