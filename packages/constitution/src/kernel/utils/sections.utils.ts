import { fencedLinesOf } from './code-fences.utils';

const HEADING = /^#{1,6}(?:\s|$)/;

interface MarkdownSection {
  readonly heading: string;
  readonly lines: readonly string[];
}

const isHeading = (line: string): boolean => HEADING.test(line);

const sectionsOf = (text: string): readonly MarkdownSection[] => {
  const lines = text.split('\n');
  const fenced = fencedLinesOf(lines);
  const sections: {
    readonly heading: string;
    readonly lines: string[];
  }[] = [];

  for (const [index, line] of lines.entries()) {
    if (fenced[index] !== true && isHeading(line)) {
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
