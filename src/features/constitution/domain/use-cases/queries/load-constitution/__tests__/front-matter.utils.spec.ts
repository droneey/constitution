import { describe, expect, it } from 'bun:test';

import { createFakeFrontMatterParser } from '../../../../../__tests__/front-matter-parser.fake';
import type { FrontMatterFields, FrontMatterRead } from '../../../../contracts';
import { readFrontMatter } from '../front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';
const TEXT = '---\nid: ui\n---\n# UI\n';
const BODY = '# UI\n';
const FIELDS: FrontMatterFields = {
  abstract: false,
  chapters: [],
  checks: [],
  extends: null,
  governs: [],
  id: 'ui',
  kind: 'domain',
  owns: [],
  requires: [],
  status: 'stable',
  summary: 'The ui block.',
};
const KEYS = [
  'id',
  'kind',
  'summary',
  'chapters',
  'requires',
  'extends',
  'abstract',
  'checks',
  'owns',
  'governs',
  'status',
];

const mappingOf = (input: {
  fields?: Partial<FrontMatterFields>;
  keys?: readonly string[];
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
        chapters: [
          'data-states.md',
        ],
        checks: [
          'lint',
        ],
        governs: [
          '**/ui/**',
        ],
        owns: [
          'UI kit',
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
        chapters: [
          'data-states.md',
        ],
        checks: [
          'lint',
        ],
        extends: null,
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        kind: 'domain',
        owns: [
          'UI kit',
        ],
        requires: [
          'remote-data',
        ],
        status: 'stable',
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
        'kind: domain',
        'summary: Screens: states.',
      ],
      message: 'front matter line 4 (summary) is not valid YAML: broken',
      name: 'a YAML error on the line of a field',
      read: {
        line: 3,
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
        'kind: domain',
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
      keys: KEYS.filter((key) => key !== 'status'),
      message: 'front matter lacks "status"; every block declares every field',
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
        'kind',
        'id',
        ...KEYS.slice(2),
      ],
      message:
        'front matter lists its fields out of order; the order is id, kind, summary, chapters, requires, extends, abstract, checks, owns, governs, status',
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
        kind: 'platform',
      },
      message:
        'front matter: kind "platform" is not one of core, domain, context, implementation',
      name: 'an unknown kind',
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
        status: 'done',
      },
      message: 'front matter: status "done" is not one of stable, draft',
      name: 'an unknown status',
    },
    {
      fields: {
        chapters: [
          'Parts.md',
        ],
      },
      message:
        'front matter: chapters lists "Parts.md", which is not a kebab-case .md file name',
      name: 'a chapter name with a capital letter',
    },
    {
      fields: {
        chapters: [
          'parts.mdx',
        ],
      },
      message:
        'front matter: chapters lists "parts.mdx", which is not a kebab-case .md file name',
      name: 'a chapter that is no .md file',
    },
    {
      fields: {
        chapters: [
          'ui.md',
        ],
      },
      message:
        'front matter: chapters lists the main file ui.md; chapters are the files after it',
      name: 'the main file among its chapters',
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
        owns: [
          ' ',
          '  ',
        ],
      },
      message: 'front matter: owns and governs hold no empty entry',
      name: 'owns entries of whitespace only',
    },
    {
      fields: {
        governs: [
          '',
        ],
      },
      message: 'front matter: owns and governs hold no empty entry',
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
