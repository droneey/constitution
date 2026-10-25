import type { Finding, Problem } from '#/kernel/types';
import { withoutCodeFences } from '#/kernel/utils';

import { DocumentPath } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum DecisionsCode {
  LogMissing = 'decision-log-missing',
  OutOfOrder = 'decision-out-of-order',
  WithoutDateLine = 'decision-without-date-line',
  NotCalendarDate = 'decision-date-not-in-calendar',
}

interface Entry {
  readonly dateLine: string;
  readonly number: number;
}

const ENTRY = /^## ADR-(\d{4})\b/;
const DATE_LINE = /^\*\*Date:\*\* (\d{4})-(\d{2})-(\d{2}) · \*\*Status:\*\* (?:Accepted|Proposed)$/;
const NUMBER_WIDTH = 4;
const MONTHS = 12;

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

const isCalendarDate = (input: { day: number; month: number; year: number }): boolean =>
  input.month >= 1 &&
  input.month <= MONTHS &&
  input.day >= 1 &&
  input.day <=
    Temporal.PlainYearMonth.from({
      month: input.month,
      year: input.year,
    }).daysInMonth;

const calendarProblem = (input: { match: RegExpExecArray; name: string }): Problem | undefined => {
  const [, year, month, day] = input.match;

  return isCalendarDate({
    day: Number(day),
    month: Number(month),
    year: Number(year),
  })
    ? undefined
    : {
        code: DecisionsCode.NotCalendarDate,
        message: `entry ${input.name} is dated ${year}-${month}-${day}, which is not a calendar date`,
      };
};

const lineProblem = (entry: Entry): Problem | undefined => {
  const match = DATE_LINE.exec(entry.dateLine);
  const name = nameOf(entry.number);

  if (match === null) {
    return {
      code: DecisionsCode.WithoutDateLine,
      message: `entry ${name} has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed" under its heading`,
    };
  }

  return calendarProblem({
    match,
    name,
  });
};

const entryFindings = (entries: readonly Entry[]): readonly Finding[] =>
  entries.flatMap((entry, index) => {
    const previous = entries[index - 1];
    const problem = lineProblem(entry);

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
