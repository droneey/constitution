const HEADING = /^#{1,6}(?:\s|$)/;

interface MarkdownSection {
  readonly heading: string;
  readonly lines: readonly string[];
}

const isHeading = (line: string): boolean => HEADING.test(line);

const sectionsOf = (text: string): readonly MarkdownSection[] => {
  const sections: {
    readonly heading: string;
    readonly lines: string[];
  }[] = [];

  for (const line of text.split('\n')) {
    if (isHeading(line)) {
      sections.push({
        heading: line,
        lines: [],
      });
    } else {
      sections.at(-1)?.lines.push(line);
    }
  }

  return sections;
};

export type { MarkdownSection };
export { isHeading, sectionsOf };
