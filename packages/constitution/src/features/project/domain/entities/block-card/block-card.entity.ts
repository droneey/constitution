interface BlockCard {
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly isAbstract: boolean;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
  readonly summary?: string;
}

const EMPTY_CARD = {
  governs: [],
  isAbstract: false,
  languages: [],
  requires: [],
} as const satisfies BlockCard;

/** The cards read, by the front matter each was read from. */
type BlockCards = ReadonlyMap<string, BlockCard>;

export type { BlockCard, BlockCards };
export { EMPTY_CARD };
