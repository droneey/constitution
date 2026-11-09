import type { CountedText } from './counted-text.utils';

const moreFilesText: CountedText = {
  many: (count) => `and ${count} more files`,
  one: 'and 1 more file',
};

export { moreFilesText };
