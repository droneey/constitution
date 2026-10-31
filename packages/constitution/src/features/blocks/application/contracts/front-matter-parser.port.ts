import type { FrontMatterRead } from '../../domain/block/entities';
import type { SkillFrontMatterRead } from '../../domain/skill/entities';

interface FrontMatterParser {
  readonly parse: (yaml: string) => FrontMatterRead;
  readonly skill: (yaml: string) => SkillFrontMatterRead;
}

export type { FrontMatterParser };
