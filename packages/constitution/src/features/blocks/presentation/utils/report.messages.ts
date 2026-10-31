import type { SimilarRules } from '../../domain/block-graph/entities';

const FINDING = 'finding';

const NO_BLOCKS = 'no blocks in this folder';

const SOUND = 'every block is sound';

const ADVICE_TITLE = 'Advice on the blocks';

const findingsTitleMessage = (counted: string): string => `${counted} in the blocks`;

const adviceMessage = ({ left, right }: SimilarRules): string =>
  `similar rules: ${left.slug} (${left.block}) and ${right.slug} (${right.block})`;

export { ADVICE_TITLE, adviceMessage, FINDING, findingsTitleMessage, NO_BLOCKS, SOUND };
