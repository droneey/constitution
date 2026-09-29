import { describe, expect, it } from 'bun:test';

import { Role } from '#/kernel';

import { createFakeFrontMatterParser } from '../../../../../__tests__/front-matter-parser.fake';
import type { FrontMatterFields, FrontMatterRead } from '../../../../contracts';
import { readFrontMatter } from '../front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';
const TEXT = '---\nid: ui\n---\n# UI\n';
const BODY = '# UI\n';
const FIELDS: FrontMatterFields = {
  abstract: false,
  checks: [],
  dictionary: [],
  extends: undefined,
  governs: [],
  id: 'ui',
  languages: [],
  requires: [],
  roles: [],
  summary: 'The ui block.',
};
const KEYS = [
  'id',
  'summary',
  'requires',
  'extends',
  'abstract',
  'checks',
  'languages',
  'roles',
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
        checks: [
          'lint',
        ],
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
        roles: [
          'format',
          'names',
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
        checks: [
          Role.Lint,
        ],
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
        roles: [
          Role.Format,
          Role.Names,
        ],
        summary: 'The ui block.',
      },
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
    const loaded = readOf(read);

    // Assert
    expect(loaded.findings).toStrictEqual([]);
  });

  it.each<{
    lines: readonly string[];
    message: string;
    name: string;
    read: FrontMatterRead;
  }>([
    {
      lines: [
        'id: ui',
        'summary: Screens: states.',
        'requires: []',
      ],
      message: 'front matter line 3 (summary) is not valid YAML: broken',
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
      message: 'front matter line 3 (summary) is not valid YAML: broken',
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
      message: 'front matter line 4 (governs) is not valid YAML: broken',
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
      message: 'front matter line 2 is not valid YAML: broken',
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
      message: 'front matter is not valid YAML: broken',
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
      message: 'front matter is not a mapping of fields',
      name: 'a list',
      read: {
        status: 'not-a-mapping',
      },
    },
    {
      lines: [
        'abstract: "no"',
      ],
      message: 'front matter: abstract: expected a boolean',
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
      message: 'front matter: <root>: expected an object',
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
  ])(
    'should report "$message" when the parser reads $name',
    ({ lines, message, read }) => {
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
          {
            message,
            path: PATH,
          },
        ],
      });
    },
  );

  it.each<{
    fields?: Partial<FrontMatterFields>;
    keys?: readonly string[];
    message: string;
    name: string;
  }>([
    {
      keys: KEYS.filter((key) => key !== 'governs'),
      message: 'front matter lacks "governs"; every block declares every field',
      name: 'a missing field',
    },
    {
      keys: [
        ...KEYS,
        'brands',
      ],
      message: 'front matter has "brands", which is not a field',
      name: 'an unknown field',
    },
    {
      keys: [
        'summary',
        'id',
        ...KEYS.slice(2),
      ],
      message:
        'front matter lists its fields out of order; the order is id, summary, requires, extends, abstract, checks, languages, roles, dictionary, governs',
      name: 'its fields out of order',
    },
    {
      fields: {
        id: 'ui_kit',
      },
      message: 'front matter: id "ui_kit" is not a kebab-case block id',
      name: 'an id in snake case',
    },
    {
      fields: {
        summary: `${'A'.repeat(70)}.`,
      },
      message: 'front matter: summary has 71 characters; it holds at most 70',
      name: 'a summary of 71 characters',
    },
    {
      fields: {
        summary: 'Screens. And tokens',
      },
      message:
        'front matter: summary is one sentence on one line, ending with a full stop',
      name: 'a summary with no full stop at its end',
    },
    {
      fields: {
        summary: 'Screens\nand tokens.',
      },
      message:
        'front matter: summary is one sentence on one line, ending with a full stop',
      name: 'a summary over two lines',
    },
    {
      fields: {
        extends: 'Bad',
      },
      message: 'front matter: extends "Bad", which is not a block id',
      name: 'an extends that is no block id',
    },
    {
      fields: {
        requires: [
          'Bad',
        ],
      },
      message: 'front matter: requires "Bad", which is not a block id',
      name: 'a requires entry that is no block id',
    },
    {
      fields: {
        checks: [
          'linting',
        ],
      },
      message: 'front matter: checks "linting", which is not a role',
      name: 'a checks entry that is no role',
    },
    {
      fields: {
        languages: [
          'Type Script',
        ],
      },
      message: 'front matter: languages "Type Script", which is not a block id',
      name: 'a languages entry that is no block id',
    },
    {
      fields: {
        roles: [
          'style',
        ],
      },
      message: 'front matter: roles "style", which is not a role',
      name: 'a roles entry that is no role',
    },
    {
      fields: {
        languages: [
          'css',
          'css',
        ],
      },
      message: 'front matter: languages lists "css" twice',
      name: 'the same language in languages twice',
    },
    {
      fields: {
        roles: [
          'lint',
          'lint',
        ],
      },
      message: 'front matter: roles lists "lint" twice',
      name: 'the same role in roles twice',
    },
    {
      fields: {
        dictionary: [
          ' ',
          '  ',
        ],
      },
      message: 'front matter: dictionary and governs hold no empty entry',
      name: 'dictionary entries of whitespace only',
    },
    {
      fields: {
        governs: [
          '',
        ],
      },
      message: 'front matter: dictionary and governs hold no empty entry',
      name: 'an empty governs entry',
    },
    {
      fields: {
        governs: [
          'src/my ui/**',
        ],
      },
      message:
        'front matter: governs lists "src/my ui/**", which holds whitespace; the index separates globs with spaces',
      name: 'a governs glob with a space',
    },
    {
      fields: {
        governs: [
          'src/ui\t**',
        ],
      },
      message:
        'front matter: governs lists "src/ui\\t**", which holds whitespace; the index separates globs with spaces',
      name: 'a governs glob with a tab',
    },
    {
      fields: {
        requires: [
          'i18n',
          'i18n',
        ],
      },
      message: 'front matter: requires lists "i18n" twice',
      name: 'the same block in requires twice',
    },
  ])(
    'should report "$message" when the front matter has $name',
    ({ fields, keys, message }) => {
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
          {
            message,
            path: PATH,
          },
        ],
      });
    },
  );
});
