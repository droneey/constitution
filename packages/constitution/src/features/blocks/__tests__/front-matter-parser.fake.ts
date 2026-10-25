import type { FrontMatterParser, FrontMatterRead } from '../domain/contracts';
import type { SkillFrontMatterRead } from '../domain/entities';
import { ReadStatus } from '../domain/entities';

const createFakeFrontMatterParser = (read: FrontMatterRead): FrontMatterParser => ({
  parse: (): FrontMatterRead => read,
  skill: (): SkillFrontMatterRead => ({
    status: ReadStatus.Parsed,
  }),
});

export { createFakeFrontMatterParser };
