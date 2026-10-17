const HEADING = /^#{1,6}(?:\s|$)/;

interface MarkdownSection {
  heading: string;
  lines: readonly string[];
}

const isHeading = (line: string): boolean => HEADING.test(line);

// The text before the first heading belongs to no section and is dropped.
const sectionsOf = (text: string): readonly MarkdownSection[] => {
  const sections: {
    heading: string;
    lines: string[];
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
