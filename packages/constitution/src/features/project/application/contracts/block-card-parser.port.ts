import type { BlockCard } from '../../domain/block-set/entities';

interface BlockCardParser {
  readonly card: (yaml: string) => BlockCard;
}

export type { BlockCardParser };
