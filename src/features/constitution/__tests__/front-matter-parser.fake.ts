import type { FrontMatterParser, FrontMatterRead } from '../domain/contracts';
import type { SkillFrontMatterRead } from '../domain/entities';

const createFakeFrontMatterParser = (read: FrontMatterRead): FrontMatterParser => ({
  parse: (): FrontMatterRead => read,
  skill: (): SkillFrontMatterRead => ({
    description: undefined,
    name: undefined,
    status: 'parsed',
  }),
});

export { createFakeFrontMatterParser };
