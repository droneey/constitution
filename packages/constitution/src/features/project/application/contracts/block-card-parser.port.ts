import type { BlockCard } from '../../domain/entities';

interface BlockCardParser {
  readonly card: (yaml: string) => BlockCard;
}

export type { BlockCardParser };
