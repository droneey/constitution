const PIPE = '|';

const isTableLine = (line: string): boolean => line.startsWith(PIPE);

/** The cells of a table's line, trimmed, without what stands outside its first and last pipe. */
const cellsOf = (line: string): readonly string[] =>
  line
    .split(PIPE)
    .slice(1, -1)
    .map((cell) => cell.trim());

/** The tables of a text's lines, each the run of lines that open with a pipe. */
const tablesOf = (lines: readonly string[]): readonly (readonly string[])[] => {
  const tables: string[][] = [];
  let current: string[] | undefined;

  for (const line of lines) {
    if (!isTableLine(line)) {
      current = undefined;

      continue;
    }

    if (current === undefined) {
      current = [];
      tables.push(current);
    }

    current.push(line);
  }

  return tables;
};

export { cellsOf, isTableLine, tablesOf };
