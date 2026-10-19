import { describe, expect, it } from 'bun:test';

import { findingOf } from '../../../../../__tests__/constitution.fixtures';
import { createFakeFrontMatterParser } from '../../../../../__tests__/front-matter-parser.fake';
import type { FrontMatterFields, FrontMatterRead } from '../../../../contracts';
import { readFrontMatter } from '../front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';
const TEXT = '---\nid: ui\n---\n# UI\n';
const BODY = '# UI\n';
const FIELDS: FrontMatterFields = {
  abstract: false,
  dictionary: [],
  extends: undefined,
  governs: [],
  id: 'ui',
  languages: [],
  requires: [],
  summary: 'The ui block.',
};
// A message that interpolates a value it does not hold reads "undefined" or "NaN".
const UNFILLED = /undefined|NaN/;
const KEYS = [
  'id',
  'summary',
  'requires',
  'extends',
  'abstract',
  'languages',
  'dictionary',
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
  keys: input.keys ?? KEYS,
  status: 'mapping',
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
        dictionary: [
          'UI kit',
        ],
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
      frontMatter: {
        abstract: false,
        dictionary: [
          'UI kit',
        ],
        extends: undefined,
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        languages: [
          'typescript',
        ],
        requires: [
          'remote-data',
        ],
        summary: 'The ui block.',
      },
    });
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
          findingOf({
            code: 'front-matter-missing',
            path: PATH,
          }),
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
    code: string;
    lines: readonly string[];
    name: string;
    names: readonly string[];
    read: FrontMatterRead;
  }>([
    {
      lines: [
        'id: ui',
        'summary: Screens: states.',
        'requires: []',
      ],
      code: 'front-matter-not-yaml',
      names: [
        'line 3 (summary)',
        'broken',
      ],
      name: 'a YAML error on the line of a field',
      read: {
        line: 2,
        reason: 'broken',
        status: 'not-yaml',
      },
    },
    {
      lines: [
        'id: ui',
        'summary : Screens.',
      ],
      code: 'front-matter-not-yaml',
      names: [
        'line 3 (summary)',
        'broken',
      ],
      name: 'a YAML error on the line of a field with a space before its colon',
      read: {
        line: 2,
        reason: 'broken',
        status: 'not-yaml',
      },
    },
    {
      lines: [
        'id: ui',
        'governs:',
        '  - pattern: *.tsx',
      ],
      code: 'front-matter-not-yaml',
      names: [
        'line 4 (governs)',
        'broken',
      ],
      name: 'a YAML error on a nested line under a field',
      read: {
        line: 3,
        reason: 'broken',
        status: 'not-yaml',
      },
    },
    {
      lines: [
        '- id',
        'summary: Screens.',
      ],
      code: 'front-matter-not-yaml',
      names: [
        'line 2',
        'broken',
      ],
      name: 'a YAML error above every field',
      read: {
        line: 1,
        reason: 'broken',
        status: 'not-yaml',
      },
    },
    {
      lines: [
        'id: ui',
      ],
      code: 'front-matter-not-yaml',
      names: [
        'broken',
      ],
      name: 'a YAML error at no known line',
      read: {
        line: undefined,
        reason: 'broken',
        status: 'not-yaml',
      },
    },
    {
      lines: [
        '- id',
      ],
      code: 'front-matter-not-a-mapping',
      names: [],
      name: 'a list',
      read: {
        status: 'not-a-mapping',
      },
    },
    {
      lines: [
        'abstract: "no"',
      ],
      code: 'front-matter-off-schema',
      names: [
        'abstract',
        'expected a boolean',
      ],
      name: 'a field of the wrong type',
      read: {
        fields: undefined,
        issues: [
          {
            field: 'abstract',
            message: 'expected a boolean',
          },
        ],
        keys: KEYS,
        status: 'mapping',
      },
    },
    {
      lines: [
        'id: ui',
      ],
      code: 'front-matter-off-schema',
      names: [
        '<root>',
        'expected an object',
      ],
      name: 'an issue at the root',
      read: {
        fields: undefined,
        issues: [
          {
            field: '',
            message: 'expected an object',
          },
        ],
        keys: KEYS,
        status: 'mapping',
      },
    },
  ])('should report $code when the parser reads $name', ({ code, lines, names, read }) => {
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
        findingOf({
          code,
          names,
          path: PATH,
        }),
      ],
    });
    expect(loaded.findings[0]?.message).not.toMatch(UNFILLED);
  });

  it.each<{
    code: string;
    fields?: Partial<FrontMatterFields>;
    keys?: readonly string[];
    name: string;
    names: readonly string[];
  }>([
    {
      keys: KEYS.filter((key) => key !== 'governs'),
      code: 'front-matter-field-missing',
      names: [
        'governs',
      ],
      name: 'a missing field',
    },
    {
      keys: [
        ...KEYS,
        'brands',
      ],
      code: 'front-matter-field-unknown',
      names: [
        'brands',
      ],
      name: 'an unknown field',
    },
    {
      keys: [
        'summary',
        'id',
        ...KEYS.slice(2),
      ],
      code: 'front-matter-out-of-order',
      names: [],
      name: 'its fields out of order',
    },
    {
      fields: {
        id: 'ui_kit',
      },
      code: 'id-not-kebab-case',
      names: [
        'ui_kit',
      ],
      name: 'an id in snake case',
    },
    {
      fields: {
        summary: `${'A'.repeat(70)}.`,
      },
      code: 'summary-too-long',
      names: [
        '71',
      ],
      name: 'a summary of 71 characters',
    },
    {
      fields: {
        summary: 'Screens. And tokens',
      },
      code: 'summary-not-one-sentence',
      names: [],
      name: 'a summary with no full stop at its end',
    },
    {
      fields: {
        summary: 'Screens\nand tokens.',
      },
      code: 'summary-not-one-sentence',
      names: [],
      name: 'a summary over two lines',
    },
    {
      fields: {
        extends: 'Bad',
      },
      code: 'entry-not-block-id',
      names: [
        'extends',
        'Bad',
      ],
      name: 'an extends that is no block id',
    },
    {
      fields: {
        requires: [
          'Bad',
        ],
      },
      code: 'entry-not-block-id',
      names: [
        'requires',
        'Bad',
      ],
      name: 'a requires entry that is no block id',
    },
    {
      fields: {
        languages: [
          'Type Script',
        ],
      },
      code: 'entry-not-block-id',
      names: [
        'languages',
        'Type Script',
      ],
      name: 'a languages entry that is no block id',
    },
    {
      fields: {
        languages: [
          'css',
          'css',
        ],
      },
      code: 'entry-repeated',
      names: [
        'languages',
        'css',
      ],
      name: 'the same language in languages twice',
    },
    {
      fields: {
        dictionary: [
          ' ',
          '  ',
        ],
      },
      code: 'entry-empty',
      names: [],
      name: 'dictionary entries of whitespace only',
    },
    {
      fields: {
        governs: [
          '',
        ],
      },
      code: 'entry-empty',
      names: [],
      name: 'an empty governs entry',
    },
    {
      fields: {
        governs: [
          'src/my ui/**',
        ],
      },
      code: 'glob-holds-whitespace',
      names: [
        '"src/my ui/**"',
      ],
      name: 'a governs glob with a space',
    },
    {
      fields: {
        governs: [
          'src/ui\t**',
        ],
      },
      code: 'glob-holds-whitespace',
      names: [
        '"src/ui\\t**"',
      ],
      name: 'a governs glob with a tab',
    },
  ])('should report $code when the front matter has $name', ({ code, fields, keys, names }) => {
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
        findingOf({
          code,
          names,
          path: PATH,
        }),
      ],
    });
  });
});
