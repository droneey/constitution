import type { Finding, Problem } from '#/kernel/types';

import { DocumentPath } from '../../../../constants';
import { withoutCodeFences } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum DecisionsCode {
  LogMissing = 'decision-log-missing',
  OutOfOrder = 'decision-out-of-order',
  WithoutDateLine = 'decision-without-date-line',
  NotCalendarDate = 'decision-date-not-in-calendar',
  SupersededByNoLaterEntry = 'decision-superseded-by-no-later-entry',
}

interface Entry {
  dateLine: string;
  number: number;
}

const ENTRY = /^## ADR-(\d{4})\b/;
const DATE_LINE =
  /^\*\*Date:\*\* (\d{4})-(\d{2})-(\d{2}) · \*\*Status:\*\* (?:Accepted|Proposed|Superseded by ADR-(\d{4}))$/;
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

const lineProblem = (entry: Entry, numbers: ReadonlySet<number>): Problem | undefined => {
  const match = DATE_LINE.exec(entry.dateLine);
  const name = nameOf(entry.number);

  if (match === null) {
    return {
      code: DecisionsCode.WithoutDateLine,
      message: `entry ${name} has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed|Superseded by ADR-NNNN" under its heading`,
    };
  }

  const successor = match[4] === undefined ? undefined : Number(match[4]);

  if (successor !== undefined && (successor <= entry.number || !numbers.has(successor))) {
    return {
      code: DecisionsCode.SupersededByNoLaterEntry,
      message: `entry ${name} is superseded by ${nameOf(successor)}, which is no later entry of the log`,
    };
  }

  return isCalendarDate({
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  })
    ? undefined
    : {
        code: DecisionsCode.NotCalendarDate,
        message: `entry ${name} is dated ${match[1]}-${match[2]}-${match[3]}, which is not a calendar date`,
      };
};

const entryFindings = (entries: readonly Entry[]): readonly Finding[] => {
  const numbers = new Set(entries.map((entry) => entry.number));

  return entries.flatMap((entry, index) => {
    const previous = entries[index - 1];
    const problem = lineProblem(entry, numbers);

    return [
      ...(previous === undefined || entry.number > previous.number
        ? []
        : [
            {
              code: DecisionsCode.OutOfOrder,
              message: `entry ${nameOf(entry.number)} follows ${nameOf(previous.number)}; the numbers of the log only rise`,
            },
          ]),
      ...(problem === undefined
        ? []
        : [
            problem,
          ]),
    ].map((found) => ({
      ...found,
      path: DocumentPath.Decisions,
    }));
  });
};

const decisionsCheck: Check = ({ constitution }: CheckInput): readonly Finding[] => {
  const log = constitution.documents.decisions;

  return log === undefined
    ? [
        {
          code: DecisionsCode.LogMissing,
          message: 'is missing; the Constitution keeps its decision log at the root',
          path: DocumentPath.Decisions,
        },
      ]
    : entryFindings(entriesOf(log));
};

export { decisionsCheck };
