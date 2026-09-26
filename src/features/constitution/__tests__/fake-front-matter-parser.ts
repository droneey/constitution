import type { FrontMatterParser, FrontMatterRead } from '../domain/contracts';

const createFakeFrontMatterParser = (
  read: FrontMatterRead,
): FrontMatterParser => ({
  parse: (): FrontMatterRead => read,
});

export { createFakeFrontMatterParser };
