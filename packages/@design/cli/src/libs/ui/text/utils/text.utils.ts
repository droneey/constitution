import type { Theme } from '../../theme';
import { Glyph, Space, Tone } from '../../theme';
import { ColumnAlign, DETAIL_SEPARATOR, ELLIPSIS, STEP_LOOKS, TONE_GLYPHS } from '../constants';
import type {
  Column,
  FailureContent,
  KeyValue,
  NoteContent,
  ProgressContent,
  StepContent,
  TableContent,
} from '../types';
import { columnWidthsOf, keyWidthOf, padTo, shareOf } from './layout.utils';

const indentOf = (theme: Theme): string => ' '.repeat(theme.space[Space.Sm]);

const gapOf = (theme: Theme): string => ' '.repeat(theme.space[Space.Xs]);

const formatHeading = (theme: Theme, title: string): string =>
  theme.strong(theme.paint(Tone.Accent, title));

const formatStep = (theme: Theme, step: StepContent): string => {
  const { glyph, tone } = STEP_LOOKS[step.status];
  const detailText =
    step.detail === undefined ? '' : theme.paint(Tone.Muted, `${DETAIL_SEPARATOR}${step.detail}`);

  return `${theme.paint(tone, theme.glyphs[glyph])}${gapOf(theme)}${step.label}${detailText}`;
};

const formatTaskList = (theme: Theme, steps: readonly StepContent[]): string =>
  steps.map((step) => formatStep(theme, step)).join('\n');

/** stands for a spinner where nothing moves */
const formatWaiting = (theme: Theme, label: string): string =>
  `${theme.paint(Tone.Accent, theme.glyphs[Glyph.Step])}${gapOf(theme)}${label}${ELLIPSIS}`;

const formatProgress = (theme: Theme, progress: ProgressContent): string =>
  `${progress.label}${gapOf(theme)}${progress.done}/${progress.total}${gapOf(theme)}${theme.paint(
    Tone.Muted,
    `(${shareOf(progress).percent}%)`,
  )}`;

const formatNote = (theme: Theme, note: NoteContent): string =>
  [
    `${theme.paint(note.tone, theme.glyphs[TONE_GLYPHS[note.tone]])}${gapOf(theme)}${theme.strong(note.title)}`,
    ...note.lines.map((line) => `${indentOf(theme)}${line}`),
  ].join('\n');

const formatFailure = (theme: Theme, failure: FailureContent): string =>
  [
    `${theme.paint(Tone.Error, theme.glyphs[Glyph.Failure])}${gapOf(theme)}${theme.strong(failure.title)}`,
    ...failure.details.map((detail) => `${indentOf(theme)}${detail}`),
    ...(failure.hint === undefined
      ? []
      : [
          `${indentOf(theme)}${theme.paint(Tone.Muted, `${theme.glyphs[Glyph.Hint]}${gapOf(theme)}${failure.hint}`)}`,
        ]),
  ].join('\n');

const formatTable = (theme: Theme, table: TableContent): string => {
  const columnWidths = columnWidthsOf(table);

  const lineOf = (cellOf: (column: Column) => string): string =>
    table.columns
      .map((column, index) =>
        padTo({
          align: column.align ?? ColumnAlign.Start,
          text: cellOf(column),
          width: columnWidths[index] ?? 0,
        }),
      )
      .join(indentOf(theme))
      .trimEnd();

  return [
    theme.strong(lineOf((column) => column.title)),
    ...table.rows.map((row) => lineOf((column) => row[column.key] ?? '')),
  ].join('\n');
};

const formatKeyValues = (theme: Theme, pairs: readonly KeyValue[]): string => {
  const keyWidth = keyWidthOf(pairs);

  return pairs
    .map(
      ([key, shown]) =>
        `${theme.paint(
          Tone.Muted,
          padTo({
            text: key,
            width: keyWidth,
          }),
        )}${indentOf(theme)}${shown}`,
    )
    .join('\n');
};

export {
  formatFailure,
  formatHeading,
  formatKeyValues,
  formatNote,
  formatProgress,
  formatStep,
  formatTable,
  formatTaskList,
  formatWaiting,
};
