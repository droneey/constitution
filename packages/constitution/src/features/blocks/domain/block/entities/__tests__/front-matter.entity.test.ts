import { describe, expect, it } from 'bun:test';

import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import { BlockId, Glob } from '#/kernel/value-objects';

import { ReadStatus } from '../../../shared/entities';
import type {
  FrontMatterFields,
  FrontMatterProblem,
  FrontMatterRead,
} from '../front-matter.entity';
import {
  FrontMatter,
  FrontMatterField,
  FrontMatterReadCode,
  FrontMatterStatus,
} from '../front-matter.entity';

const FIELDS: FrontMatterFields = {
  abstract: false,
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
  keys: input.keys ?? keyLines,
  status: ReadStatus.Mapping,
});

describe('FrontMatter.parse', () => {
  it('should return the typed front matter when every field keeps its rule', () => {
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
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      frontMatter: {
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
      },
      status: FrontMatterStatus.Valid,
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
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      frontMatter: {
        abstract: true,
        extends: BlockId.create('_store'),
        governs: [],
        id: BlockId.create('_redux-like'),
        languages: [],
        requires: [],
        summary: 'The ui block.',
      },
      status: FrontMatterStatus.Valid,
    });
  });

  it('should accept a summary when it holds exactly 70 characters', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        summary: `${'A'.repeat(69)}.`,
      },
    });

    // Act
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed.status).toBe(FrontMatterStatus.Valid);
  });

  it.each<{
    problem: FrontMatterProblem;
    name: string;
    read: FrontMatterRead;
  }>([
    {
      problem: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'summary',
            line: 3,
          },
          reason: 'broken',
        },
      },
      name: 'a YAML error on the line of a field, counting the opening line of the file',
      read: {
        at: {
          key: 'summary',
          line: 2,
        },
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      problem: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          reason: 'broken',
        },
      },
      name: 'a YAML error at no known line',
      read: {
        reason: 'broken',
        status: ReadStatus.NotYaml,
      },
    },
    {
      problem: {
        code: FrontMatterReadCode.NotMapping,
        details: {},
      },
      name: 'a list',
      read: {
        status: ReadStatus.NotMapping,
      },
    },
    {
      problem: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: 'abstract',
          reason: 'expected boolean',
        },
      },
      name: 'a field of the wrong type',
      read: {
        issues: [
          {
            field: 'abstract',
            message: 'expected boolean',
          },
        ],
        keys: keyLines,
        status: ReadStatus.Mismatched,
      },
    },
    {
      problem: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: '',
          reason: 'expected object',
        },
      },
      name: 'an issue at the root',
      read: {
        issues: [
          {
            field: '',
            message: 'expected object',
          },
        ],
        keys: keyLines,
        status: ReadStatus.Mismatched,
      },
    },
    {
      problem: {
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field: FrontMatterField.Governs,
        },
      },
      name: 'a field of the wrong type beside a missing one, whose key comes first',
      read: {
        issues: [
          {
            field: 'abstract',
            message: 'expected boolean',
          },
        ],
        keys: keyLines.filter((key) => key !== 'governs'),
        status: ReadStatus.Mismatched,
      },
    },
  ])('should report $problem.code when the parser reads $name', ({ problem, read }) => {
    // Act
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      problems: [
        problem,
      ],
      status: FrontMatterStatus.Invalid,
    });
  });

  it.each<{
    fields?: Partial<FrontMatterFields>;
    problem: FrontMatterProblem;
    keys?: readonly string[];
    name: string;
  }>([
    {
      problem: {
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field: FrontMatterField.Governs,
        },
      },
      keys: keyLines.filter((key) => key !== 'governs'),
      name: 'a missing field',
    },
    {
      problem: {
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key: 'brands',
        },
      },
      keys: [
        ...keyLines,
        'brands',
      ],
      name: 'an unknown field',
    },
    {
      problem: {
        code: FrontMatterReadCode.OutOfOrder,
        details: {
          order: fieldOrder,
        },
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
      problem: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.FrontMatterId,
          written: 'ui_kit',
        },
      },
      name: 'an id in snake case',
    },
    {
      fields: {
        summary: `${'A'.repeat(70)}.`,
      },
      problem: {
        code: FrontMatterReadCode.SummaryTooLong,
        details: {
          characters: 71,
          limit: 70,
        },
      },
      name: 'a summary of 71 characters',
    },
    {
      fields: {
        summary: 'Screens. And tokens',
      },
      problem: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
      },
      name: 'a summary with no full stop at its end',
    },
    {
      fields: {
        summary: 'Screens\nand tokens.',
      },
      problem: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
      },
      name: 'a summary over two lines',
    },
    {
      fields: {
        extends: 'Bad',
      },
      problem: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Extends,
        },
      },
      name: 'an extends that is no block id',
    },
    {
      fields: {
        requires: [
          'Bad',
        ],
      },
      problem: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Requires,
        },
      },
      name: 'a requires entry that is no block id',
    },
    {
      fields: {
        languages: [
          'Type Script',
        ],
      },
      problem: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Type Script',
          field: FrontMatterField.Languages,
        },
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
      problem: {
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry: 'css',
          field: FrontMatterField.Languages,
        },
      },
      name: 'the same language in languages twice',
    },
    {
      fields: {
        governs: [
          '',
        ],
      },
      problem: {
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
      },
      name: 'an empty governs entry',
    },
    {
      fields: {
        governs: [
          'src/ui/**/*.{ts',
        ],
      },
      problem: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/ui/**/*.{ts',
        },
      },
      name: 'a governs glob with a brace left open',
    },
    {
      fields: {
        governs: [
          'src/ui}/**',
        ],
      },
      problem: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/ui}/**',
        },
      },
      name: 'a governs glob with a brace that closes none',
    },
  ])('should report $problem.code when the front matter has $name', ({ fields, keys, problem }) => {
    // Arrange
    const read = mappingOf({
      fields,
      keys,
    });

    // Act
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      problems: [
        problem,
      ],
      status: FrontMatterStatus.Invalid,
    });
  });

  it('should report a governs entry of whitespace alone as empty', () => {
    // Arrange
    const read = mappingOf({
      fields: {
        governs: [
          ' ',
        ],
      },
    });

    // Act
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      problems: [
        {
          code: FrontMatterReadCode.EntryEmpty,
          details: {},
        },
      ],
      status: FrontMatterStatus.Invalid,
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
    const parsed = FrontMatter.parse(read);

    // Assert
    expect(parsed).toStrictEqual({
      problems: [
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Requires,
          },
        },
        {
          code: FrontMatterReadCode.EntryRepeated,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Requires,
          },
        },
      ],
      status: FrontMatterStatus.Invalid,
    });
  });
});
