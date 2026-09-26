import { describe, expect, it } from 'bun:test';

import { parseRequirements } from '../requirements.utils';

const FILE = 'blocks/implementations/lingui/lingui.md';

const sourceOf = (
  lines: readonly string[],
): {
  block: string;
  file: string;
  text: string;
  with: string | null;
} => ({
  block: 'lingui',
  file: FILE,
  text: lines.join('\n'),
  with: null,
});

const answer = (input: {
  how: string;
  requirement: string;
  status: string;
}): {
  block: string;
  file: string;
  how: string;
  requirement: string;
  status: string;
  with: null;
} => ({
  block: 'lingui',
  file: FILE,
  how: input.how,
  requirement: input.requirement,
  status: input.status,
  with: null,
});

describe('parseRequirements', () => {
  it('should read every row of every Requirements section when the headings carry trailing spaces', () => {
    // Arrange
    const source = sourceOf([
      '# Lingui',
      '| `outside` | a table elsewhere | met |',
      '## Requirements  ',
      '',
      '| Requirement | How in lingui | Status |',
      '|---|:---:|---|',
      '| `i18n-plurals-by-cldr` | ICU plural | met |',
      '| i18n-typed-keys | compiled catalogs | partial: keys are strings |',
      '## Notes',
      '| `not-an-answer` | x | met |',
      '## Requirements',
      '| `i18n-lazy-locales` |  | not met |',
    ]);

    // Act
    const parsed = parseRequirements(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [
        answer({
          how: 'ICU plural',
          requirement: 'i18n-plurals-by-cldr',
          status: 'met',
        }),
        answer({
          how: 'compiled catalogs',
          requirement: 'i18n-typed-keys',
          status: 'partial: keys are strings',
        }),
        answer({
          how: '',
          requirement: 'i18n-lazy-locales',
          status: 'not met',
        }),
      ],
      findings: [],
    });
  });

  it.each([
    '| i18n plurals-by-cldr | ICU | not met |',
    '| `i18n-plurals-by-cldr` | ICU |',
    '| `i18n-plurals-by-cldr` (MUST) | ICU | met |',
    '| [`i18n-plurals-by-cldr`](../../domains/i18n/i18n.md) | ICU | met |',
    '`i18n-plurals-by-cldr` | ICU | met',
  ])('should report the row %p when it is not a requirement answer', (row) => {
    // Arrange
    const source = sourceOf([
      '## Requirements',
      row,
    ]);

    // Act
    const parsed = parseRequirements(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [],
      findings: [
        {
          message: `has the row "${row}" in its Requirements, which is not "| \`<requirement>\` | <how> | <status> |"`,
          path: FILE,
        },
      ],
    });
  });

  it.each([
    '### Requirements',
    '# requirements',
  ])(
    'should report the heading %p when it names the Requirements section in another form',
    (heading) => {
      // Arrange
      const source = sourceOf([
        heading,
        '| `i18n-plurals-by-cldr` | ICU | met |',
      ]);

      // Act
      const parsed = parseRequirements(source);

      // Assert
      expect(parsed).toStrictEqual({
        answers: [],
        findings: [
          {
            message: `has the heading "${heading}", which names the Requirements section; it is "## Requirements"`,
            path: FILE,
          },
        ],
      });
    },
  );
});
