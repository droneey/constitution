const DELIMITER = '---';

interface MarkdownDocument {
  body: string;
  frontMatter: string | undefined;
}

const splitFrontMatter = (text: string): MarkdownDocument => {
  const lines = text.split('\n');
  const end = lines[0] === DELIMITER ? lines.indexOf(DELIMITER, 1) : -1;

  if (end === -1) {
    return {
      body: text,
      frontMatter: undefined,
    };
  }

  return {
    body: lines.slice(end + 1).join('\n'),
    frontMatter: lines.slice(1, end).join('\n'),
  };
};

export type { MarkdownDocument };
export { splitFrontMatter };
