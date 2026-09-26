import type { Finding } from '#/kernel';
import { withoutCodeFences } from '#/libs/markdown';

import { DOCUMENT_PATHS } from '../../../../constants';
import type { Check, CheckInput } from '../check.types';

interface Entry {
  dateLine: string;
  number: number;
}

const ENTRY = /^## ADR-(\d{4})\b/;
const DATE_LINE =
  /^\*\*Date:\*\* (\d{4})-(\d{2})-(\d{2}) · \*\*Status:\*\* (?:Accepted|Proposed|Superseded by ADR-(\d{4}))$/;
const DATE_FORM =
  '"**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed|Superseded by ADR-NNNN"';
const NUMBER_WIDTH = 4;

const nameOf = (number: number): string =>
  `ADR-${String(number).padStart(NUMBER_WIDTH, '0')}`;

const entriesOf = (text: string): readonly Entry[] => {
  const lines = withoutCodeFences(text).split('\n');

  return lines.flatMap((line, index) => {
    const match = ENTRY.exec(line);

    return match === null
      ? []
      : [
          {
            dateLine:
              lines.slice(index + 1).find((next) => next.trim() !== '') ??
              // Stryker disable next-line StringLiteral: any text without a date line reads alike
              '',
            number: Number(match[1]),
          },
        ];
  });
};

const isCalendarDate = (input: {
  day: number;
  month: number;
  year: number;
}): boolean => {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day));

  // A day or month out of range rolls the date into another month.
  return date.getUTCMonth() === input.month - 1;
};

const lineMessage = (input: {
  entry: Entry;
  numbers: ReadonlySet<number>;
}): string | undefined => {
  const match = DATE_LINE.exec(input.entry.dateLine);
  const successor = match?.[4];

  if (match === null) {
    return `has no line ${DATE_FORM} under its heading`;
  }

  if (
    !isCalendarDate({
      day: Number(match[3]),
      month: Number(match[2]),
      year: Number(match[1]),
    })
  ) {
    return `is dated ${match[1]}-${match[2]}-${match[3]}, which is not a calendar date`;
  }

  return successor === undefined || input.numbers.has(Number(successor))
    ? undefined
    : `is superseded by ADR-${successor}, which is not an entry`;
};

const entryFindings = (entries: readonly Entry[]): readonly Finding[] => {
  const numbers = new Set(entries.map((entry) => entry.number));

  return entries.flatMap((entry, index) => {
    const expected = index + 1;
    const message = lineMessage({
      entry,
      numbers,
    });

    return [
      ...(entry.number === expected
        ? []
        : [
            `sits where ${nameOf(expected)} is expected; the log is contiguous and append-only`,
          ]),
      ...(message === undefined
        ? []
        : [
            message,
          ]),
    ].map((problem) => ({
      message: `entry ${nameOf(entry.number)} ${problem}`,
      path: DOCUMENT_PATHS.decisions,
    }));
  });
};

const decisionsCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] => {
  const log = constitution.documents.decisions;

  return log === undefined
    ? [
        {
          message:
            'is missing; the constitution keeps its decision log at the root',
          path: DOCUMENT_PATHS.decisions,
        },
      ]
    : entryFindings(entriesOf(log));
};

export { decisionsCheck };
