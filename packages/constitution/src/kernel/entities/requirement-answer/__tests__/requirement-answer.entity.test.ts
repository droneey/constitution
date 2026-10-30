import { describe, expect, it } from 'bun:test';

import { BlockId, RuleSlug } from '../../../value-objects';
import { Met, RequirementAnswer, RequirementsTableCode } from '../requirement-answer.entity';

const FILE = 'blocks/implementations/lingui/lingui.md';

const sourceOf = (lines: readonly string[]): Parameters<typeof RequirementAnswer.parse>[0] => ({
  block: BlockId.create('lingui'),
  file: FILE,
  text: lines.join('\n'),
});

const answer = (input: {
  how: string;
  met: string;
  requirement: string;
  seam?: string;
}): RequirementAnswer =>
  RequirementAnswer.create({
    block: BlockId.create('lingui'),
    file: FILE,
    how: input.how,
    requirement: RuleSlug.create(input.requirement),
    ...(input.seam === undefined
      ? {}
      : {
          seam: BlockId.create(input.seam),
        }),
    writtenMet: input.met,
  });

const answerFields: RequirementAnswer = {
  block: BlockId.create('lingui'),
  file: FILE,
  how: 'ICU plural',
  requirement: RuleSlug.create('i18n-plurals-by-cldr'),
  writtenMet: 'yes',
};

describe('RequirementAnswer.parse', () => {
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
      seam: BlockId.create('react-dom'),
    };

    // Act
    const parsed = RequirementAnswer.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [
        answer({
          how: 'ICU plural',
          met: 'yes',
          requirement: 'i18n-plurals-by-cldr',
          seam: 'react-dom',
        }),
        answer({
          how: 'compiled catalogs, and keys are strings',
          met: 'partly',
          requirement: 'i18n-typed-keys',
          seam: 'react-dom',
        }),
        answer({
          how: '',
          met: 'no',
          requirement: 'i18n-lazy-locales',
          seam: 'react-dom',
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
    const parsed = RequirementAnswer.parse(source);

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
      const parsed = RequirementAnswer.parse(source);

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
  ])('should read the row %p when it is written without padding or indented', (row) => {
    // Arrange
    const source = sourceOf([
      '## Requirements',
      row,
    ]);

    // Act
    const parsed = RequirementAnswer.parse(source);

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
  });

  it.each([
    '|Requirement|How|Met|',
    '| --- | :---: | --- |',
    '---|---|---',
  ])('should skip %p when it is the header or the separator of the table', (line) => {
    // Arrange
    const source = sourceOf([
      '## Requirements',
      line,
    ]);

    // Act
    const parsed = RequirementAnswer.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [],
      findings: [],
    });
  });

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
    const parsed = RequirementAnswer.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [],
      findings: [
        {
          code: RequirementsTableCode.RowMisshapen,
          details: {
            row,
          },
          path: FILE,
        },
      ],
    });
  });

  it.each([
    '| Requirement | How in lingui | Status |',
    '|Requirement|How|Status|',
    '| Requirement | How | Met | Notes |',
  ])('should report the header %p when it is not the Requirements header', (header) => {
    // Arrange
    const source = sourceOf([
      '## Requirements',
      header,
    ]);

    // Act
    const parsed = RequirementAnswer.parse(source);

    // Assert
    expect(parsed).toStrictEqual({
      answers: [],
      findings: [
        {
          code: RequirementsTableCode.HeaderMisshapen,
          details: {
            row: header,
          },
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
        '| `i18n-plurals-by-cldr` | ICU | yes |',
      ]);

      // Act
      const parsed = RequirementAnswer.parse(source);

      // Assert
      expect(parsed).toStrictEqual({
        answers: [],
        findings: [
          {
            code: RequirementsTableCode.HeadingMisshapen,
            details: {
              heading,
            },
            path: FILE,
          },
        ],
      });
    },
  );
});

describe('RequirementAnswer', () => {
  it.each([
    {
      condition: 'its file is a seam',
      fields: {
        ...answerFields,
        seam: BlockId.create('react-dom'),
      },
    },
    {
      condition: 'its file is no seam',
      fields: answerFields,
    },
  ])('should hold the seam only when $condition', ({ fields }) => {
    // Act
    const made = RequirementAnswer.create(fields);

    // Assert
    expect(made).toStrictEqual(fields);
  });

  it.each([
    {
      condition: 'it writes a word of Met',
      met: Met.Partly,
      written: 'partly',
    },
    {
      condition: 'it writes a word outside Met',
      met: undefined,
      written: 'mostly',
    },
  ])('should read the answer as Met says when $condition', ({ met, written }) => {
    // Arrange
    const given = answer({
      how: 'ICU plural',
      met: written,
      requirement: 'i18n-plurals-by-cldr',
    });

    // Act
    const read = RequirementAnswer.metOf(given);

    // Assert
    expect(read).toBe(met);
  });
});
