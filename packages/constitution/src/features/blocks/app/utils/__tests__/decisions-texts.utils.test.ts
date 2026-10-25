import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import type { DecisionsDetails } from '../../../domain/use-cases/queries/check';
import { DecisionsCode } from '../../../domain/use-cases/queries/check';
import { decisionsTexts } from '../decisions-texts.utils';

describe('decisionsTexts', () => {
  it.each<{
    problem: ProblemOf<DecisionsDetails>;
    text: string;
  }>([
    {
      problem: {
        code: DecisionsCode.LogMissing,
        details: {},
      },
      text: 'is missing; the Constitution keeps its decision log at the root',
    },
    {
      problem: {
        code: DecisionsCode.OutOfOrder,
        details: {
          entry: 7,
          previous: 12,
        },
      },
      text: 'entry ADR-0007 follows ADR-0012; the numbers of the log only rise',
    },
    {
      problem: {
        code: DecisionsCode.WithoutDateLine,
        details: {
          entry: 1,
        },
      },
      text: 'entry ADR-0001 has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed" under its heading',
    },
    {
      problem: {
        code: DecisionsCode.NotCalendarDate,
        details: {
          date: '2026-02-30',
          entry: 123,
        },
      },
      text: 'entry ADR-0123 is dated 2026-02-30, which is not a calendar date',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(decisionsTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
