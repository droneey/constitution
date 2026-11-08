import { describe, expect, it } from 'bun:test';

import type { MarkdownSection } from '../../utils';
import { RuleSlug } from '../../value-objects';
import { RuleBody, RuleForm } from '../rule-body.entity';
import type { RuleFormProblem } from '../rule-form.entity';
import { RuleFormCode } from '../rule-form.entity';

const slug = RuleSlug.create('type-name-undecorated');

const whyOf = (lines: readonly string[] = []): MarkdownSection => ({
  heading: '#### Why',
  lines: [
    '',
    'The declaration shows the kind.',
    ...lines,
  ],
});

const examplesOf = (lines: readonly string[]): MarkdownSection => ({
  heading: '#### Examples',
  lines,
});

const pair = [
  '',
  '```ts title="Avoid"',
  'interface IOrder {}',
  '```',
  '',
  '```ts title="Prefer"',
  'interface Order {}',
  '```',
];

const sectionedOf = (subsections: readonly MarkdownSection[]) =>
  RuleBody.read({
    form: RuleForm.Sectioned,
    lines: [
      'Every name says what its thing is.',
    ],
    slug,
    subsections,
  });

describe('RuleBody.read', () => {
  it('should give the Why as one text and each titled block with its language when a rule holds both sections', () => {
    // Arrange
    const subsections = [
      whyOf([
        '',
        '  The mark lengthens the name.  ',
      ]),
      examplesOf([
        ...pair,
        '',
        '```mermaid title="The flow"',
        '# not a heading',
        'graph TD',
        '```',
        '',
        '   ',
        '~~~ title="Tree"',
        'src/',
        '~~~',
      ]),
    ];

    // Act
    const body = sectionedOf(subsections);

    // Assert
    expect(body).toStrictEqual({
      examples: [
        {
          code: 'interface IOrder {}',
          language: 'ts',
          title: 'Avoid',
        },
        {
          code: 'interface Order {}',
          language: 'ts',
          title: 'Prefer',
        },
        {
          code: '# not a heading\ngraph TD',
          language: 'mermaid',
          title: 'The flow',
        },
        {
          code: 'src/',
          language: '',
          title: 'Tree',
        },
      ],
      problems: [],
      proseLines: [
        'Every name says what its thing is.',
        '',
        'The declaration shows the kind.',
        '',
        '  The mark lengthens the name.  ',
      ],
      why: 'The declaration shows the kind. The mark lengthens the name.',
    });
  });

  it('should read the sections when their headings end in spaces', () => {
    // Arrange
    const subsections = [
      {
        ...whyOf(),
        heading: '#### Why  ',
      },
      {
        ...examplesOf(pair),
        heading: '#### Examples ',
      },
    ];

    // Act
    const { problems, why } = sectionedOf(subsections);

    // Assert
    expect({
      problems,
      why,
    }).toStrictEqual({
      problems: [],
      why: 'The declaration shows the kind.',
    });
  });

  it.each<{
    condition: string;
    problems: readonly RuleFormProblem[];
    subsections: readonly MarkdownSection[];
  }>([
    {
      condition: 'it has neither section',
      problems: [
        {
          code: RuleFormCode.WithoutWhySection,
          details: {
            slug,
          },
        },
        {
          code: RuleFormCode.WithoutExamples,
          details: {
            slug,
          },
        },
      ],
      subsections: [],
    },
    {
      condition: 'its Examples come before its Why',
      problems: [
        {
          code: RuleFormCode.WhyMisplaced,
          details: {
            slug,
          },
        },
        {
          code: RuleFormCode.ExamplesNotLast,
          details: {
            slug,
          },
        },
      ],
      subsections: [
        examplesOf(pair),
        whyOf(),
      ],
    },
    {
      condition: 'another section stands between its statement and its Why',
      problems: [
        {
          code: RuleFormCode.WhyMisplaced,
          details: {
            slug,
          },
        },
        {
          code: RuleFormCode.SectionUnknown,
          details: {
            heading: '#### Notes',
            slug,
          },
        },
      ],
      subsections: [
        {
          heading: '#### Notes',
          lines: [],
        },
        whyOf(),
        examplesOf(pair),
      ],
    },
    {
      condition: 'a deeper heading sits under its Why',
      problems: [
        {
          code: RuleFormCode.SectionUnknown,
          details: {
            heading: '##### More',
            slug,
          },
        },
      ],
      subsections: [
        whyOf(),
        {
          heading: '##### More',
          lines: [
            'More reasons.',
          ],
        },
        examplesOf(pair),
      ],
    },
    {
      condition: 'a deeper heading opens its sections',
      problems: [
        {
          code: RuleFormCode.SectionUnknown,
          details: {
            heading: '##### First',
            slug,
          },
        },
      ],
      subsections: [
        {
          heading: '##### First',
          lines: [],
        },
        whyOf(),
        examplesOf(pair),
      ],
    },
    {
      condition: 'its Examples hold prose and a heading',
      problems: [
        {
          code: RuleFormCode.ExamplesHoldHeading,
          details: {
            heading: '###### Avoid',
            slug,
          },
        },
        {
          code: RuleFormCode.ExamplesHoldProse,
          details: {
            slug,
          },
        },
      ],
      subsections: [
        whyOf(),
        examplesOf(pair),
        {
          heading: '###### Avoid',
          lines: [
            'A name marked with its kind.',
          ],
        },
      ],
    },
    {
      condition: 'a block of its Examples has no title',
      problems: [
        {
          code: RuleFormCode.ExampleUntitled,
          details: {
            language: 'text',
            slug,
          },
        },
        {
          code: RuleFormCode.ExampleUntitled,
          details: {
            language: '',
            slug,
          },
        },
        {
          code: RuleFormCode.ExampleUntitled,
          details: {
            language: '',
            slug,
          },
        },
      ],
      subsections: [
        whyOf(),
        examplesOf([
          '```text',
          'src/',
          '```',
          '```',
          'src/',
          '```',
          '``` title=""',
          'src/',
          '```',
        ]),
      ],
    },
  ])('should report it when $condition', ({ problems, subsections }) => {
    // Act
    const body = sectionedOf(subsections);

    // Assert
    expect(body.problems).toStrictEqual(problems);
  });

  it('should keep only the titled blocks of its Examples, reading a deeper heading inside them', () => {
    // Arrange
    const subsections = [
      whyOf(),
      examplesOf([
        '```text',
        'src/',
        '```',
      ]),
      {
        heading: '##### Prefer',
        lines: [
          '```ts title="Prefer"',
          'interface Order {}',
          '```',
        ],
      },
      {
        heading: '##### Tree',
        lines: [
          '```text title="Tree"',
          'src/',
          '```',
        ],
      },
    ];

    // Act
    const { examples } = sectionedOf(subsections);

    // Assert
    expect(examples).toStrictEqual([
      {
        code: 'interface Order {}',
        language: 'ts',
        title: 'Prefer',
      },
      {
        code: 'src/',
        language: 'text',
        title: 'Tree',
      },
    ]);
  });
});

describe('RuleBody.formsOf', () => {
  it.each([
    {
      condition: 'a table under its statement',
      forms: [
        RuleForm.Tabled,
      ],
      lines: [
        '| Why |',
      ],
      subsections: [],
    },
    {
      condition: 'a table only inside a fence and a section',
      forms: [
        RuleForm.Sectioned,
      ],
      lines: [
        '```md',
        '| Why |',
        '```',
      ],
      subsections: [
        whyOf(),
      ],
    },
    {
      condition: 'both a table and a section',
      forms: [
        RuleForm.Tabled,
        RuleForm.Sectioned,
      ],
      lines: [
        '| Why |',
      ],
      subsections: [
        whyOf(),
      ],
    },
    {
      condition: 'neither',
      forms: [],
      lines: [
        'A.',
      ],
      subsections: [],
    },
  ])('should give $forms when a rule shows $condition', ({ forms, lines, subsections }) => {
    // Act
    const given = RuleBody.formsOf({
      heading: '### a · MUST',
      lines,
      subsections,
    });

    // Assert
    expect(given).toStrictEqual(forms);
  });
});

describe('RuleBody.withoutExamples', () => {
  it('should keep the lines before any heading and leave out each Examples section to the next heading of its level or above, a fenced heading among them', () => {
    // Arrange
    const text = [
      'Before any heading.',
      '### a · MUST',
      'A.',
      '#### Why',
      'Reason.',
      '#### Examples ',
      '```md title="Prefer"',
      '#### Why',
      '```',
      '##### Deeper',
      'inside',
      '### b · MUST',
      'B.',
      '#### Examples',
      'gone',
      '#### Notes',
      'kept',
      '##### Deeper',
      'kept too',
    ].join('\n');

    // Act
    const stripped = RuleBody.withoutExamples(text);

    // Assert
    expect(stripped).toBe(
      [
        'Before any heading.',
        '### a · MUST',
        'A.',
        '#### Why',
        'Reason.',
        '### b · MUST',
        'B.',
        '#### Notes',
        'kept',
        '##### Deeper',
        'kept too',
      ].join('\n'),
    );
  });
});
