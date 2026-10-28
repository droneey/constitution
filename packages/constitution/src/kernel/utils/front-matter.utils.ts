const DELIMITER = '---';

interface MarkdownDocument {
  readonly body: string;
  readonly frontMatter?: string;
}

const splitFrontMatter = (text: string): MarkdownDocument => {
  const lines = text.split(/\r?\n/);
  const end = lines[0] === DELIMITER ? lines.indexOf(DELIMITER, 1) : -1;

  if (end === -1) {
    return {
      body: lines.join('\n'),
    };
  }

  return {
    body: lines.slice(end + 1).join('\n'),
    frontMatter: lines.slice(1, end).join('\n'),
  };
};

export { splitFrontMatter };
