import type { CountedText } from './counted-text.utils';

const moreGoverningBlocksText: CountedText = {
  many: (count) =>
    `${count} more blocks govern it; they are named when the file is next read or edited.`,
  one: '1 more block governs it; it is named when the file is next read or edited.',
};

export { moreGoverningBlocksText };
