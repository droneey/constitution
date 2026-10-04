import type { Finding } from '#/kernel';

import { DocumentPath } from '../../../../constants';
import { withoutCodeFences } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

interface Entry {
  dateLine: string;
  number: number;
}

const ENTRY = /^## ADR-(\d{4})\b/;
const DATE_LINE = /^\*\*Date:\*\* (\d{4})-(\d{2})-(\d{2}) · \*\*Status:\*\* (?:Accepted|Proposed)$/;
const DATE_FORM = '"**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed"';
const NUMBER_WIDTH = 4;

const nameOf = (number: number): string => `ADR-${String(number).padStart(NUMBER_WIDTH, '0')}`;

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

const isCalendarDate = (input: { day: number; month: number; year: number }): boolean => {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day));

  // A day or month out of range rolls the date into another month.
  return date.getUTCMonth() === input.month - 1;
};

const lineMessage = (entry: Entry): string | undefined => {
  const match = DATE_LINE.exec(entry.dateLine);

  if (match === null) {
    return `has no line ${DATE_FORM} under its heading`;
  }

  return isCalendarDate({
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  })
    ? undefined
    : `is dated ${match[1]}-${match[2]}-${match[3]}, which is not a calendar date`;
};

const entryFindings = (entries: readonly Entry[]): readonly Finding[] =>
  entries.flatMap((entry, index) => {
    const previous = entries[index - 1];
    const message = lineMessage(entry);

    return [
      ...(previous === undefined || entry.number > previous.number
        ? []
        : [
            `follows ${nameOf(previous.number)}; the numbers of the log only rise`,
          ]),
      ...(message === undefined
        ? []
        : [
            message,
          ]),
    ].map((problem) => ({
      message: `entry ${nameOf(entry.number)} ${problem}`,
      path: DocumentPath.Decisions,
    }));
  });

const decisionsCheck: Check = ({ constitution }: CheckInput): readonly Finding[] => {
  const log = constitution.documents.decisions;

  return log === undefined
    ? [
        {
          message: 'is missing; the constitution keeps its decision log at the root',
          path: DocumentPath.Decisions,
        },
      ]
    : entryFindings(entriesOf(log));
};

export { decisionsCheck };
