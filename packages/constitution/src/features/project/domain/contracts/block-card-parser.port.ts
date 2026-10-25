/**
 * The fields a project reads from a block's card; where the card leaves one out or gives it in
 * another form, a list is empty, a flag false and a text absent.
 */
interface BlockCard {
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly isAbstract: boolean;
  readonly requires: readonly string[];
  readonly summary?: string;
}

/** The card of a block whose front matter gives nothing. */
const EMPTY_CARD = {
  governs: [],
  isAbstract: false,
  requires: [],
} as const satisfies BlockCard;

interface BlockCardParser {
  readonly card: (yaml: string) => BlockCard;
}

export type { BlockCard, BlockCardParser };
export { EMPTY_CARD };
