import type { Axis, Level } from '#/kernel/constants';

interface StatedRule {
  readonly axis: Axis;
  readonly block: string;
  // The section a rule sits under, and the title of its file.
  readonly chapter: string | undefined;
  readonly file: string;
  readonly ownTags: readonly string[];
  readonly parent: string | undefined;
  readonly slug: string;
  readonly statedLevel: Level | undefined;
  readonly statement: string;
  readonly title: string | undefined;
  readonly why: string;
  readonly with: string | undefined;
}

interface Rule extends StatedRule {
  readonly level: Level;
  readonly tags: readonly string[];
}

export type { Rule, StatedRule };
