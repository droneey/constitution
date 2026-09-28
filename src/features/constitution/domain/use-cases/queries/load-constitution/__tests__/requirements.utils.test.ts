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
  met: string;
  requirement: string;
  with?: string;
}): RequirementAnswer => ({
  block: 'lingui',
  file: FILE,
  how: input.how,
  met: input.met,
  requirement: input.requirement,
  with: input.with,
});

describe('parseRequirements', () => {
  it('should read the rows of every Requirements section and of no other section when a file holds several sections', () => {
    // Arrange
    const source = {
      ...sourceOf([
        '## Requirements',
        '',
        '| Requirement | How | Met |',
        '|---|---|---|',
        '| `i18n-plurals-by-cldr` | ICU plural | yes |',
        '| `i18n-typed-keys` | compiled catalogs, and keys are strings | partly |',
        '## Notes',
        '| `not-an-answer` | x | yes |',
        '## Requirements',
        '| `i18n-lazy-locales` |  | no |',
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
          met: 'yes',
          requirement: 'i18n-plurals-by-cldr',
          with: 'react-dom',
        }),
        answer({
          how: 'compiled catalogs, and keys are strings',
          met: 'partly',
          requirement: 'i18n-typed-keys',
          with: 'react-dom',
        }),
        answer({
          how: '',
          met: 'no',
          requirement: 'i18n-lazy-locales',
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
      '| `i18n-plurals-by-cldr` | ICU plural | yes |',
    ]);

    // Act
    const parsed = parseRequirements(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [
        answer({
          how: 'ICU plural',
          met: 'yes',
          requirement: 'i18n-plurals-by-cldr',
        }),
      ],
      findings: [],
    });
  });

  it.each([
    '## Requirements for implementations',
    '## C# requirements',
  ])(
    'should neither read nor report a section when its heading %p holds more than Requirements',
    (heading) => {
      // Arrange
      const source = sourceOf([
        heading,
        '| `i18n-plurals-by-cldr` | ICU plural | yes |',
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
    '|i18n-typed-keys|compiled catalogs|partly|',
    '  | `i18n-typed-keys` | compiled catalogs | partly |',
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
            met: 'partly',
            requirement: 'i18n-typed-keys',
          }),
        ],
        findings: [],
      });
    },
  );

  it.each([
    '|Requirement|How|Met|',
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
    '| i18n | `i18n-plurals-by-cldr` | ICU | yes |',
    '| Block | Requirement | Met |',
    'Note | Requirement | How | Met |',
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
          message: `has the row "${row}" in its Requirements, which is not "| \`<requirement>\` | <how> | <met> |"`,
          path: FILE,
        },
      ],
    });
  });

  it.each([
    '| Requirement | How in lingui | Status |',
    '|Requirement|How|Status|',
    '| Requirement | How | Met | Notes |',
  ])(
    'should report the header %p when it is not the Requirements header',
    (header) => {
      // Arrange
      const source = sourceOf([
        '## Requirements',
        header,
      ]);

      // Act
      const parsed = parseRequirements(source);

      // Assert
      expect(parsed).toStrictEqual({
        answers: [],
        findings: [
          {
            message: `has the header "${header}" in its Requirements; it is "| Requirement | How | Met |"`,
            path: FILE,
          },
        ],
      });
    },
  );

  it.each([
    '# requirements',
    '##  Requirements',
  ])(
    'should report the heading %p when it names the Requirements section in another form',
    (heading) => {
      // Arrange
      const source = sourceOf([
        heading,
        '| `i18n-plurals-by-cldr` | ICU | yes |',
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
