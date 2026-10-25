import { describe, expect, it } from 'bun:test';

import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import { BlockId, Glob } from '#/kernel/value-objects';

import { createFakeFrontMatterParser } from '../../../../../../../../../__tests__/front-matter-parser.fake';
import type { FrontMatterFields, FrontMatterRead } from '../../../../../../../../contracts';
import { FrontMatter, FrontMatterField, ReadStatus } from '../../../../../../../../entities';
import type { FrontMatterReadFinding } from '../front-matter.utils';
import { FrontMatterReadCode, readFrontMatter } from '../front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';
const TEXT = '---\nid: ui\n---\n# UI\n';
const BODY = '# UI\n';
const FIELDS: FrontMatterFields = {
  abstract: false,
  extends: undefined,
  governs: [],
  id: 'ui',
  languages: [],
  requires: [],
  summary: 'The ui block.',
} as const;
const fieldOrder = [
  FrontMatterField.Id,
  FrontMatterField.Summary,
  FrontMatterField.Requires,
  FrontMatterField.Extends,
  FrontMatterField.Abstract,
  FrontMatterField.Languages,
  FrontMatterField.Governs,
];
const keyLines = [
  'id',
  'summary',
  'requires',
  'extends',
  'abstract',
  'languages',
  'governs',
];

const mappingOf = (input: {
  fields?: Partial<FrontMatterFields> | undefined;
  keys?: readonly string[] | undefined;
}): FrontMatterRead => ({
  fields: {
    ...FIELDS,
    ...input.fields,
  },
  issues: [],
  keys: input.keys ?? keyLines,
  status: ReadStatus.Mapping,
});

const readOf = (read: FrontMatterRead): ReturnType<typeof readFrontMatter> =>
  readFrontMatter({
    parser: createFakeFrontMatterParser(read),
    path: PATH,
    text: TEXT,
  });

describe('readFrontMatter', () => {
  it('should return the typed front matter and the body when every field keeps its rule', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        governs: [
          '**/ui/**',
        ],
        languages: [
          'typescript',
        ],
        requires: [
          'remote-data',
        ],
      },
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded).toStrictEqual({
      body: BODY,
      findings: [],
      frontMatter: FrontMatter.create({
        abstract: false,
        governs: [
          Glob.create('**/ui/**'),
        ],
        id: BlockId.create('ui'),
        languages: [
          BlockId.create('typescript'),
        ],
        requires: [
          BlockId.create('remote-data'),
        ],
        summary: 'The ui block.',
      }),
    });
  });

  it('should keep the base a block extends when it names one', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        abstract: true,
        extends: '_store',
        id: '_redux-like',
      },
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded.frontMatter?.extends).toBe(BlockId.create('_store'));
  });

  it.each([
    {
      name: 'the opening delimiter never closes',
      text: '---\nid: ui\n# UI\n',
    },
    {
      name: 'the text does not open with a delimiter',
      text: '# UI\n---\n',
    },
  ])(
    'should report the missing front matter and keep the whole text as the body when $name',
    ({ text }) => {
      // Arrange
      const parser = createFakeFrontMatterParser(mappingOf({}));

      // Act
      const loaded = readFrontMatter({
        parser,
        path: PATH,
        text,
      });

      // Assert
      expect(loaded).toStrictEqual({
        body: text,
        findings: [
          {
            code: FrontMatterReadCode.Missing,
            details: {},
            path: PATH,
          },
        ],
      });
    },
  );

  it('should accept a summary when it holds exactly 70 characters', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        summary: `${'A'.repeat(69)}.`,
      },
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded.findings).toStrictEqual([]);
  });

  it.each<{
    finding: FrontMatterReadFinding;
    lines: readonly string[];
    name: string;
    read: FrontMatterRead;
  }>([
    {
      lines: [
        'id: ui',
        'summary: Screens: states.',
        'requires: []',
      ],
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'summary',
            line: 3,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      name: 'a YAML error on the line of a field',
      read: {
        line: 2,
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      lines: [
        'id: ui',
        'summary : Screens.',
      ],
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'summary',
            line: 3,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      name: 'a YAML error on the line of a field with a space before its colon',
      read: {
        line: 2,
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      lines: [
        'id: ui',
        'governs:',
        '  - pattern: *.tsx',
      ],
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'governs',
            line: 4,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      name: 'a YAML error on a nested line under a field',
      read: {
        line: 3,
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      lines: [
        '- id',
        'summary: Screens.',
      ],
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            line: 2,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      name: 'a YAML error above every field',
      read: {
        line: 1,
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      lines: [
        'id: ui',
      ],
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          reason: 'broken',
        },
        path: PATH,
      },
      name: 'a YAML error at no known line',
      read: {
        line: undefined,
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      lines: [
        '- id',
      ],
      finding: {
        code: FrontMatterReadCode.NotMapping,
        details: {},
        path: PATH,
      },
      name: 'a list',
      read: {
        status: ReadStatus.NotMapping,
      },
    },
    {
      lines: [
        'abstract: "no"',
      ],
      finding: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: 'abstract',
          reason: 'expected boolean',
        },
        path: PATH,
      },
      name: 'a field of the wrong type',
      read: {
        fields: undefined,
        issues: [
          {
            field: 'abstract',
            message: 'expected boolean',
          },
        ],
        keys: keyLines,
        status: ReadStatus.Mapping,
      },
    },
    {
      lines: [
        'id: ui',
      ],
      finding: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: '',
          reason: 'expected object',
        },
        path: PATH,
      },
      name: 'an issue at the root',
      read: {
        fields: undefined,
        issues: [
          {
            field: '',
            message: 'expected object',
          },
        ],
        keys: keyLines,
        status: ReadStatus.Mapping,
      },
    },
  ])('should report $finding.code when the parser reads $name', ({ finding, lines, read }) => {
    // Arrange
    const parser = createFakeFrontMatterParser(read);
    const text = [
      '---',
      ...lines,
      '---',
      '# UI',
    ].join('\n');

    // Act
    const loaded = readFrontMatter({
      parser,
      path: PATH,
      text,
    });

    // Assert
    expect(loaded).toStrictEqual({
      body: '# UI',
      findings: [
        finding,
      ],
    });
  });

  it.each<{
    fields?: Partial<FrontMatterFields>;
    finding: FrontMatterReadFinding;
    keys?: readonly string[];
    name: string;
  }>([
    {
      finding: {
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field: FrontMatterField.Governs,
        },
        path: PATH,
      },
      keys: keyLines.filter((key) => key !== 'governs'),
      name: 'a missing field',
    },
    {
      finding: {
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key: 'brands',
        },
        path: PATH,
      },
      keys: [
        ...keyLines,
        'brands',
      ],
      name: 'an unknown field',
    },
    {
      finding: {
        code: FrontMatterReadCode.OutOfOrder,
        details: {
          order: fieldOrder,
        },
        path: PATH,
      },
      keys: [
        'summary',
        'id',
        ...keyLines.slice(2),
      ],
      name: 'its fields out of order',
    },
    {
      fields: {
        id: 'ui_kit',
      },
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.FrontMatterId,
          written: 'ui_kit',
        },
        path: PATH,
      },
      name: 'an id in snake case',
    },
    {
      fields: {
        summary: `${'A'.repeat(70)}.`,
      },
      finding: {
        code: FrontMatterReadCode.SummaryTooLong,
        details: {
          characters: 71,
          limit: 70,
        },
        path: PATH,
      },
      name: 'a summary of 71 characters',
    },
    {
      fields: {
        summary: 'Screens. And tokens',
      },
      finding: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
        path: PATH,
      },
      name: 'a summary with no full stop at its end',
    },
    {
      fields: {
        summary: 'Screens\nand tokens.',
      },
      finding: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
        path: PATH,
      },
      name: 'a summary over two lines',
    },
    {
      fields: {
        extends: 'Bad',
      },
      finding: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Extends,
        },
        path: PATH,
      },
      name: 'an extends that is no block id',
    },
    {
      fields: {
        requires: [
          'Bad',
        ],
      },
      finding: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Requires,
        },
        path: PATH,
      },
      name: 'a requires entry that is no block id',
    },
    {
      fields: {
        languages: [
          'Type Script',
        ],
      },
      finding: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Type Script',
          field: FrontMatterField.Languages,
        },
        path: PATH,
      },
      name: 'a languages entry that is no block id',
    },
    {
      fields: {
        languages: [
          'css',
          'css',
        ],
      },
      finding: {
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry: 'css',
          field: FrontMatterField.Languages,
        },
        path: PATH,
      },
      name: 'the same language in languages twice',
    },
    {
      fields: {
        governs: [
          '',
        ],
      },
      finding: {
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
        path: PATH,
      },
      name: 'an empty governs entry',
    },
    {
      fields: {
        governs: [
          'src/my ui/**',
        ],
      },
      finding: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/my ui/**',
        },
        path: PATH,
      },
      name: 'a governs glob with a space',
    },
    {
      fields: {
        governs: [
          'src/ui\t**',
        ],
      },
      finding: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/ui\t**',
        },
        path: PATH,
      },
      name: 'a governs glob with a tab',
    },
  ])('should report $finding.code when the front matter has $name', ({ fields, finding, keys }) => {
    // Arrange
    const read = mappingOf({
      fields,
      keys,
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded).toStrictEqual({
      body: BODY,
      findings: [
        finding,
      ],
    });
  });

  it('should report a governs entry of whitespace alone as empty and as holding whitespace', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        governs: [
          ' ',
        ],
      },
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded).toStrictEqual({
      body: BODY,
      findings: [
        {
          code: FrontMatterReadCode.EntryEmpty,
          details: {},
          path: PATH,
        },
        {
          code: ValueFailure.Glob,
          details: {
            site: ValueSite.Governs,
            written: ' ',
          },
          path: PATH,
        },
      ],
    });
  });

  it('should report a problem met at two entries once', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        requires: [
          'Bad',
          'Bad',
        ],
      },
    });

    // Act
    const loaded = readOf(read);

    // Assert
    expect(loaded).toStrictEqual({
      body: BODY,
      findings: [
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Requires,
          },
          path: PATH,
        },
        {
          code: FrontMatterReadCode.EntryRepeated,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Requires,
          },
          path: PATH,
        },
      ],
    });
  });
});
