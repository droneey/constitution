import type { Axis, Level } from '#/kernel';

interface StatedRule {
  axis: Axis;
  block: string;
  check: string;
  file: string;
  ownTags: readonly string[];
  parent: string | undefined;
  slug: string;
  statedLevel: Level | undefined;
  statement: string;
  why: string;
  with: string | undefined;
}

interface Rule extends StatedRule {
  level: Level;
  tags: readonly string[];
}

export type { Rule, StatedRule };
