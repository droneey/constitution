import { describe, expect, it } from 'bun:test';

import type { RequirementAnswer } from '../../../../entities';
import { parseRequirements } from '../requirements.utils';

const FILE = 'blocks/implementations/lingui/lingui.md';

const sourceOf = (
  lines: readonly string[],
): {
  block: string;
  file: string;
  text: string;
  with: string | undefined;
} => ({
  block: 'lingui',
  file: FILE,
  text: lines.join('\n'),
  with: undefined,
});

const answer = (input: {
  how: string;
  requirement: string;
  status: string;
  with?: string;
}): RequirementAnswer => ({
  block: 'lingui',
  file: FILE,
  how: input.how,
  requirement: input.requirement,
  status: input.status,
  with: input.with,
});

describe('parseRequirements', () => {
  it('should read the rows of every Requirements section and of no other section when a file holds several sections', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '## Requirements',
        '',
        '| Requirement | How in lingui | Status |',
        '|---|---|---|',
        '| `i18n-plurals-by-cldr` | ICU plural | met |',
        '| `i18n-typed-keys` | compiled catalogs | partial: keys are strings |',
        '## Notes',
        '| `not-an-answer` | x | met |',
        '## Requirements',
        '| `i18n-lazy-locales` |  | not met |',
      ]),
      with: 'react-dom',
    };

    // Act
    const parsed = parseRequirements(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [
        answer({
          how: 'ICU plural',
          requirement: 'i18n-plurals-by-cldr',
          status: 'met',
          with: 'react-dom',
        }),
        answer({
          how: 'compiled catalogs',
          requirement: 'i18n-typed-keys',
          status: 'partial: keys are strings',
          with: 'react-dom',
        }),
        answer({
          how: '',
          requirement: 'i18n-lazy-locales',
          status: 'not met',
          with: 'react-dom',
        }),
      ],
      findings: [],
    });
  });

  it('should read the rows of a Requirements section when its heading carries trailing spaces', () => {
    // Arrange
    const source = sourceOf([
      '## Requirements  ',
      '| `i18n-plurals-by-cldr` | ICU plural | met |',
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
      ],
      findings: [],
    });
  });

  it('should neither read nor report a section when its heading only begins with Requirements', () => {
    // Arrange
    const source = sourceOf([
      '## Requirements for implementations',
      '| `i18n-plurals-by-cldr` | ICU plural | met |',
    ]);

    // Act
    const parsed = parseRequirements(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [],
      findings: [],
    });
  });

  it.each([
    '|i18n-typed-keys|compiled catalogs|partial: keys are strings|',
    '  | `i18n-typed-keys` | compiled catalogs | partial: keys are strings |',
  ])(
    'should read the row %p when it is written without padding or indented',
    (row) => {
      // Arrange
      const source = sourceOf([
        '## Requirements',
        row,
      ]);

      // Act
      const parsed = parseRequirements(source);

      // Assert
      expect(parsed).toStrictEqual({
        answers: [
          answer({
            how: 'compiled catalogs',
            requirement: 'i18n-typed-keys',
            status: 'partial: keys are strings',
          }),
        ],
        findings: [],
      });
    },
  );

  it.each([
    '|Requirement|How|Status|',
    '| --- | :---: | --- |',
    '---|---|---',
  ])(
    'should skip %p when it is the header or the separator of the table',
    (line) => {
      // Arrange
      const source = sourceOf([
        '## Requirements',
        line,
      ]);

      // Act
      const parsed = parseRequirements(source);

      // Assert
      expect(parsed).toStrictEqual({
        answers: [],
        findings: [],
      });
    },
  );

  it.each([
    '| i18n | `i18n-plurals-by-cldr` | ICU | met |',
    '| Block | Requirement | Status |',
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
    '# requirements',
    '##  Requirements',
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
