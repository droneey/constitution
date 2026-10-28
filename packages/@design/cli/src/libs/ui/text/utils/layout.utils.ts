import { BAR_CELLS, ColumnAlign, PERCENT } from '../constants';
import type { Column, KeyValue, TableContent } from '../types';

/** in terminal cells */
const widthOf = (text: string): number => Bun.stringWidth(text);

interface PadInput {
  readonly align?: ColumnAlign;
  readonly text: string;
  readonly width: number;
}

const padTo = (input: PadInput): string => {
  const padding = ' '.repeat(Math.max(0, input.width - widthOf(input.text)));

  return input.align === ColumnAlign.End ? `${padding}${input.text}` : `${input.text}${padding}`;
};

const columnWidthsOf = ({ columns, rows }: TableContent): readonly number[] =>
  columns.map((column: Column) =>
    Math.max(widthOf(column.title), ...rows.map((row) => widthOf(row[column.key] ?? ''))),
  );

const keyWidthOf = (pairs: readonly KeyValue[]): number =>
  Math.max(0, ...pairs.map(([key]) => widthOf(key)));

interface Share {
  readonly filledCells: number;
  readonly percent: number;
}

interface ShareInput {
  readonly done: number;
  readonly total: number;
}

const shareOf = (input: ShareInput): Share => {
  const ratio = input.total <= 0 ? 0 : Math.min(1, Math.max(0, input.done / input.total));

  return {
    filledCells: Math.round(ratio * BAR_CELLS),
    percent: Math.floor(ratio * PERCENT),
  };
};

export { columnWidthsOf, keyWidthOf, padTo, shareOf, widthOf };
