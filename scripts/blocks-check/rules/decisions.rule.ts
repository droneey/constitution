import type { Constitution, Finding, Rule } from '../models';

const HEADING = /^## ADR-(\d{4})\b/gm;
const DECISIONS = 'DECISIONS.md';
const NUMBER_WIDTH = 4;

const label = (number: number): string =>
  String(number).padStart(NUMBER_WIDTH, '0');

const numbersOf = (text: string): readonly number[] =>
  [
    ...text.matchAll(HEADING),
  ].map((match) => Number(match[1]));

const contiguous = (numbers: readonly number[]): readonly Finding[] =>
  numbers.flatMap((number, index) => {
    const expected = index + 1;

    return number === expected
      ? []
      : [
          {
            message: `entry ADR-${label(number)} sits where ADR-${label(expected)} is expected; the log is contiguous and append-only`,
            path: DECISIONS,
          },
        ];
  });

const decisionsRule: Rule = ({
  decisions,
}: Constitution): readonly Finding[] =>
  decisions === undefined
    ? [
        {
          message:
            'is missing; the constitution keeps its decision log at the root',
          path: DECISIONS,
        },
      ]
    : contiguous(numbersOf(decisions));

export { decisionsRule };
