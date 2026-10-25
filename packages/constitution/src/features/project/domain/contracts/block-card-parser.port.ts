/**
 * The fields a project reads from a block's card, each empty where the card leaves it out or
 * gives it in another form.
 */
interface BlockCard {
  readonly extends: string | undefined;
  readonly governs: readonly string[];
  readonly isAbstract: boolean;
  readonly requires: readonly string[];
  readonly summary: string;
}

interface BlockCardParser {
  readonly card: (yaml: string) => BlockCard;
}

export type { BlockCard, BlockCardParser };
