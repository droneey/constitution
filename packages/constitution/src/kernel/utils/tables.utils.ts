const PIPE = '|';

const isTableLine = (line: string): boolean => line.startsWith(PIPE);

const cellsOf = (line: string): readonly string[] =>
  line
    .split(PIPE)
    .slice(1, -1)
    .map((cell) => cell.trim());

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
