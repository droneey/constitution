import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  without,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { decisionsCheck } from '../decisions';

const LOG = 'DECISIONS.md';
const ACCEPTED = '**Date:** 2026-09-25 · **Status:** Accepted';
const NO_DATE_LINE =
  'entry ADR-0001 has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed|Superseded by ADR-NNNN" under its heading';

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
        message:
          'is missing; the constitution keeps its decision log at the root',
        path: LOG,
      },
    ]);
  });

  it.each([
    {
      expected:
        'entry ADR-0003 sits where ADR-0002 is expected; the log is contiguous and append-only',
      name: 'a number is skipped',
      numbers: [
        '0001',
        '0003',
      ],
    },
    {
      expected:
        'entry ADR-0001 sits where ADR-0002 is expected; the log is contiguous and append-only',
      name: 'a number repeats',
      numbers: [
        '0001',
        '0001',
      ],
    },
  ])(
    'should report the entry out of place when $name',
    ({ expected, numbers }) => {
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
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: LOG,
        },
      ]);
    },
  );

  it.each([
    {
      expected: NO_DATE_LINE,
      line: '**Date:** 2026-09-25 · **Status:** Done',
    },
    {
      expected: NO_DATE_LINE,
      line: '- **Date:** 2026-09-25 · **Status:** Accepted',
    },
    {
      expected: NO_DATE_LINE,
      line: '**Date:** 2026-09-25 · **Status:** Accepted by the team',
    },
    {
      expected:
        'entry ADR-0001 is dated 2026-02-30, which is not a calendar date',
      line: '**Date:** 2026-02-30 · **Status:** Accepted',
    },
    {
      expected:
        'entry ADR-0001 is dated 2026-13-05, which is not a calendar date',
      line: '**Date:** 2026-13-05 · **Status:** Accepted',
    },
    {
      expected:
        'entry ADR-0001 is superseded by ADR-0009, which is not an entry',
      line: '**Date:** 2026-09-25 · **Status:** Superseded by ADR-0009',
    },
  ])(
    'should report "$expected" when the line under the heading is $line',
    ({ expected, line }) => {
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
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: LOG,
        },
      ]);
    },
  );

  it.each([
    {
      log: logOf([
        entry({
          line: '**Date:** 2026-09-25 · **Status:** Superseded by ADR-0002',
          number: '0001',
        }),
        entry({
          line: '**Date:** 2026-09-26 · **Status:** Proposed',
          number: '0002',
        }),
      ]),
      name: 'a later entry supersedes an earlier one',
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
