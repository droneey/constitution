import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import { without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { DecisionsDetails } from '../decisions';
import { DecisionsCode, decisionsCheck } from '../decisions';

const LOG = 'DECISIONS.md';
const ACCEPTED = '**Date:** 2026-09-25 · **Status:** Accepted';

const logOf = (entries: readonly string[]): string =>
  [
    '# Decision Log',
    '',
    ...entries,
  ].join('\n');

const entry = (input: { line: string; number: string }): string =>
  `## ADR-${input.number} — A decision\n${input.line}\n\n- **Decision.** It holds.\n`;

describe('decisionsCheck', () => {
  it('should report the log when it is missing', () => {
    // Arrange
    const input = checkInputOf(
      without({
        files: validFiles(),
        path: LOG,
      }),
    );

    // Act
    const findings = decisionsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: DecisionsCode.LogMissing,
        details: {},
        path: LOG,
      },
    ]);
  });

  it.each<{
    expected: FindingOf<DecisionsDetails>[];
    name: string;
    numbers: string[];
  }>([
    {
      expected: [
        {
          code: DecisionsCode.OutOfOrder,
          details: {
            entry: 1,
            previous: 1,
          },
          path: LOG,
        },
      ],
      name: 'a number repeats',
      numbers: [
        '0001',
        '0001',
      ],
    },
    {
      expected: [
        {
          code: DecisionsCode.OutOfOrder,
          details: {
            entry: 2,
            previous: 3,
          },
          path: LOG,
        },
      ],
      name: 'a number falls',
      numbers: [
        '0001',
        '0003',
        '0002',
      ],
    },
  ])('should report the entry out of place when $name', ({ expected, numbers }) => {
    // Arrange
    const files = validFiles();

    files[LOG] = logOf(
      numbers.map((number) =>
        entry({
          line: ACCEPTED,
          number,
        }),
      ),
    );

    const input = checkInputOf(files);

    // Act
    const findings = decisionsCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each<{
    expected: FindingOf<DecisionsDetails>[];
    line: string;
  }>([
    {
      expected: [
        {
          code: DecisionsCode.WithoutDateLine,
          details: {
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-09-25 · **Status:** Done',
    },
    {
      expected: [
        {
          code: DecisionsCode.WithoutDateLine,
          details: {
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '- **Date:** 2026-09-25 · **Status:** Accepted',
    },
    {
      expected: [
        {
          code: DecisionsCode.WithoutDateLine,
          details: {
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-09-25 · **Status:** Accepted by the team',
    },
    {
      expected: [
        {
          code: DecisionsCode.WithoutDateLine,
          details: {
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-09-25 · **Status:** Superseded by ADR-2',
    },
    {
      expected: [
        {
          code: DecisionsCode.NotCalendarDate,
          details: {
            date: '2026-02-30',
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-02-30 · **Status:** Accepted',
    },
    {
      expected: [
        {
          code: DecisionsCode.NotCalendarDate,
          details: {
            date: '2026-13-05',
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-13-05 · **Status:** Accepted',
    },
    {
      expected: [
        {
          code: DecisionsCode.NotCalendarDate,
          details: {
            date: '2027-02-29',
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2027-02-29 · **Status:** Accepted',
    },
    {
      expected: [
        {
          code: DecisionsCode.NotCalendarDate,
          details: {
            date: '2026-00-10',
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-00-10 · **Status:** Accepted',
    },
    {
      expected: [
        {
          code: DecisionsCode.NotCalendarDate,
          details: {
            date: '2026-05-00',
            entry: 1,
          },
          path: LOG,
        },
      ],
      line: '**Date:** 2026-05-00 · **Status:** Accepted',
    },
    {
      expected: [],
      line: '**Date:** 2026-01-01 · **Status:** Accepted',
    },
    {
      expected: [],
      line: '**Date:** 2026-12-31 · **Status:** Accepted',
    },
    {
      expected: [],
      line: '**Date:** 2028-02-29 · **Status:** Accepted',
    },
    {
      expected: [],
      line: '**Date:** 2026-09-25 · **Status:** Superseded by ADR-0002',
    },
  ])('should report the entry when the line under the heading is $line', ({ expected, line }) => {
    // Arrange
    const files = validFiles();

    files[LOG] = logOf([
      entry({
        line,
        number: '0001',
      }),
    ]);

    const input = checkInputOf(files);

    // Act
    const findings = decisionsCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    {
      log: logOf([
        entry({
          line: ACCEPTED,
          number: '0001',
        }),
        entry({
          line: '**Date:** 2026-09-26 · **Status:** Proposed',
          number: '0003',
        }),
      ]),
      name: 'a deleted entry leaves its number unused',
    },
    {
      log: logOf([
        entry({
          line: ACCEPTED,
          number: '0001',
        }),
        '```markdown',
        '## ADR-0009 — A sample',
        '```',
      ]),
      name: 'a fence holds a sample heading',
    },
    {
      log: logOf([
        'An entry opens with a heading such as `## ADR-0007 — A title`.',
        '',
        entry({
          line: ACCEPTED,
          number: '0001',
        }),
      ]),
      name: 'a line of prose quotes a heading',
    },
    {
      log: logOf([
        '## ADR-0001 — A decision',
        '   ',
        ACCEPTED,
      ]),
      name: 'a line of spaces parts a heading from its date line',
    },
  ])('should find nothing when $name', ({ log }) => {
    // Arrange
    const files = validFiles();

    files[LOG] = log;

    const input = checkInputOf(files);

    // Act
    const findings = decisionsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
