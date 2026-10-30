import type { FindingOf, ProblemOf } from '#/kernel/types';
import { withoutCodeFences } from '#/kernel/utils';

import { DocumentPath } from '../../../../constitution/entities';
import type { Check, CheckInput } from '../check.types';

enum DecisionsCode {
  LogMissing = 'decision-log-missing',
  OutOfOrder = 'decision-out-of-order',
  WithoutDateLine = 'decision-without-date-line',
  NotCalendarDate = 'decision-date-not-in-calendar',
}

interface DecisionsDetails {
  readonly [DecisionsCode.LogMissing]: object;
  readonly [DecisionsCode.OutOfOrder]: {
    readonly entry: number;
    readonly previous: number;
  };
  readonly [DecisionsCode.WithoutDateLine]: {
    readonly entry: number;
  };
  readonly [DecisionsCode.NotCalendarDate]: {
    readonly date: string;
    readonly entry: number;
  };
}

type DecisionsFinding = FindingOf<DecisionsDetails>;

type DecisionsProblem = ProblemOf<DecisionsDetails>;

interface Entry {
  readonly dateLine: string;
  readonly number: number;
}

const ENTRY = /^## ADR-(\d{4})\b/;
const DATE_LINE =
  /^\*\*Date:\*\* ((\d{4})-(\d{2})-(\d{2})) · \*\*Status:\*\* (?:Accepted|Proposed|Superseded by ADR-\d{4})$/;
const MONTHS = 12;

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

const calendarProblem = (input: {
  entry: number;
  match: RegExpExecArray;
}): DecisionsProblem | undefined => {
  // Stryker disable next-line StringLiteral: the pattern always captures the date
  const [, date = '', year, month, day] = input.match;

  return isCalendarDate({
    day: Number(day),
    month: Number(month),
    year: Number(year),
  })
    ? undefined
    : {
        code: DecisionsCode.NotCalendarDate,
        details: {
          date,
          entry: input.entry,
        },
      };
};

const lineProblem = (entry: Entry): DecisionsProblem | undefined => {
  const match = DATE_LINE.exec(entry.dateLine);

  if (match === null) {
    return {
      code: DecisionsCode.WithoutDateLine,
      details: {
        entry: entry.number,
      },
    };
  }

  return calendarProblem({
    entry: entry.number,
    match,
  });
};

const entryFindings = (entries: readonly Entry[]): readonly DecisionsFinding[] =>
  entries.flatMap((entry, index) => {
    const previous = entries[index - 1];
    const orderProblem: DecisionsProblem | undefined =
      previous === undefined || entry.number > previous.number
        ? undefined
        : {
            code: DecisionsCode.OutOfOrder,
            details: {
              entry: entry.number,
              previous: previous.number,
            },
          };

    return [
      orderProblem,
      lineProblem(entry),
    ]
      .filter((problem) => problem !== undefined)
      .map((problem) => ({
        ...problem,
        path: DocumentPath.Decisions,
      }));
  });

const decisionsCheck: Check<DecisionsFinding> = ({
  constitution,
}: CheckInput): readonly DecisionsFinding[] => {
  const log = constitution.documents.decisions;

  return log === undefined
    ? [
        {
          code: DecisionsCode.LogMissing,
          details: {},
          path: DocumentPath.Decisions,
        },
      ]
    : entryFindings(entriesOf(log));
};

export type { DecisionsDetails };
export { DecisionsCode, decisionsCheck };
