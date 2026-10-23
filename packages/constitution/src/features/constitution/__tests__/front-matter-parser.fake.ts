import type { BlockCard, FrontMatterParser, FrontMatterRead } from '../domain/contracts';
import type { SkillFrontMatterRead } from '../domain/entities';

const EMPTY_CARD: BlockCard = {
  extends: undefined,
  governs: [],
  isAbstract: false,
  requires: [],
  summary: '',
};

// cards: the card each front matter's text reads as; any other reads as an empty card.
const createFakeFrontMatterParser = (
  read: FrontMatterRead,
  cards: ReadonlyMap<string, BlockCard> = new Map(),
): FrontMatterParser => ({
  card: (yaml: string): BlockCard => cards.get(yaml) ?? EMPTY_CARD,
  parse: (): FrontMatterRead => read,
  skill: (): SkillFrontMatterRead => ({
    description: undefined,
    name: undefined,
    status: 'parsed',
  }),
});

export { createFakeFrontMatterParser };
