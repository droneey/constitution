const PIPE = '|';
const ESCAPED_PIPE = '\\|';
// Why: GFM reads a pipe after a backslash as text of its cell, never as a cell's edge.
const CELL_EDGE = /(?<!\\)\|/;

const isTableLine = (line: string): boolean => line.startsWith(PIPE);

const cellsOf = (line: string): readonly string[] =>
  line
    .split(CELL_EDGE)
    .slice(1, -1)
    .map((cell) => cell.trim().replaceAll(ESCAPED_PIPE, PIPE));

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
