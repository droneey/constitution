// Why: a part stays well inside what one Read gives, as Claude Code cuts a file past 25,000 tokens
// or 2,000 lines, and a line past 2,000 characters.
const PART_BUDGET_BYTES = 60_000;
const PART_MAX_LINES = 1500;
const PART_LINE_WIDTH = 400;
const encoder = new TextEncoder();

const bytesOf = (lines: readonly string[]): number =>
  lines.reduce((sum, line) => sum + encoder.encode(line).length + 1, 0);

interface PartLines {
  readonly added: readonly string[];
  readonly held: readonly string[];
}

const isPastPartBudget = (input: PartLines): boolean =>
  bytesOf(input.held) + bytesOf(input.added) > PART_BUDGET_BYTES ||
  input.held.length + input.added.length > PART_MAX_LINES;

export { isPastPartBudget, PART_LINE_WIDTH };
