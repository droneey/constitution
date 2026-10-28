import type { FrontMatterRead, SkillFrontMatterRead } from '../entities';

interface FrontMatterParser {
  readonly parse: (yaml: string) => FrontMatterRead;
  readonly skill: (yaml: string) => SkillFrontMatterRead;
}

export type { FrontMatterParser };
