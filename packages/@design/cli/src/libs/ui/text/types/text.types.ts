import type { Tone } from '../../theme';
import type { ColumnAlign, StepStatus } from '../constants';

interface StepContent {
  readonly detail?: string;
  readonly label: string;
  readonly status: StepStatus;
}

interface Column {
  readonly align?: ColumnAlign;
  /** the key of the cell this column shows in each row */
  readonly key: string;
  readonly title: string;
}

type TableRow = Readonly<Record<string, string>>;

interface TableContent {
  readonly columns: readonly Column[];
  readonly rows: readonly TableRow[];
}

interface ProgressContent {
  readonly done: number;
  readonly label: string;
  readonly total: number;
}

interface NoteContent {
  readonly lines: readonly string[];
  readonly title: string;
  readonly tone: Tone;
}

interface FailureContent {
  /** each fact a line */
  readonly details: readonly string[];
  /** what the reader can do next */
  readonly hint?: string;
  readonly title: string;
}

type KeyValue = readonly [
  key: string,
  shown: string,
];

export type {
  Column,
  FailureContent,
  KeyValue,
  NoteContent,
  ProgressContent,
  StepContent,
  TableContent,
  TableRow,
};
