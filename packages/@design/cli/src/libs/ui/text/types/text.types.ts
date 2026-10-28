import type { Tone } from '../../theme';
import type { ColumnAlign, StepStatus } from '../constants';

interface StepContent {
  /** what is known of its outcome: a count, a reason, a time */
  readonly detail?: string;
  readonly label: string;
  readonly status: StepStatus;
}

interface Column {
  readonly align?: ColumnAlign;
  /** the field of a row the column shows */
  readonly key: string;
  readonly title: string;
}

/** a row's cells by their columns' keys */
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
  /** what is known of the failure, each fact a line */
  readonly details: readonly string[];
  /** what to do next */
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
