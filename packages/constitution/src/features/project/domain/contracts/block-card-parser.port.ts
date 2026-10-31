interface BlockCard {
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly isAbstract: boolean;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
}

const EMPTY_CARD = {
  governs: [],
  isAbstract: false,
  languages: [],
  requires: [],
} as const satisfies BlockCard;

interface BlockCardParser {
  readonly card: (yaml: string) => BlockCard;
}

export type { BlockCard, BlockCardParser };
export { EMPTY_CARD };
