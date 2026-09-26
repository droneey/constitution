import { describe, expect, it } from 'bun:test';

import { createFakeFrontMatterParser } from '#/features/constitution/__tests__/fake-front-matter-parser';
import type { BlockFixture } from '#/features/constitution/__tests__/fixtures';
import { mainFile } from '#/features/constitution/__tests__/fixtures';
import { createYamlFrontMatterParser } from '#/features/constitution/adapters/yaml';

import { readFrontMatter } from '../front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';

const uiFile = (overrides: Partial<BlockFixture>): string =>
  mainFile({
    body: '# UI\n',
    id: 'ui',
    kind: 'domain',
    ...overrides,
  });

const messagesOf = (text: string): readonly string[] =>
  readFrontMatter({
    parser: createYamlFrontMatterParser(),
    path: PATH,
    text,
  }).findings.map((finding) => finding.message);

describe('readFrontMatter', () => {
  it('should return the typed front matter and the body when every field is sound', () => {
    // Arrange
    const text = uiFile({
      governs: [
        '**/ui/**',
      ],
    });

    // Act
    const read = readFrontMatter({
      parser: createYamlFrontMatterParser(),
      path: PATH,
      text,
    });

    // Assert
    expect(read).toStrictEqual({
      body: '\n# UI\n',
      findings: [],
      frontMatter: {
        abstract: false,
        chapters: [],
        checks: [],
        extends: null,
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        kind: 'domain',
        owns: [],
        requires: [],
        status: 'stable',
        summary: 'The ui block.',
      },
    });
  });

  it('should report the missing front matter at the file when the text opens with no delimiter', () => {
    // Arrange
    const text = '# UI\n';

    // Act
    const read = readFrontMatter({
      parser: createYamlFrontMatterParser(),
      path: PATH,
      text,
    });

    // Assert
    expect(read).toStrictEqual({
      body: '# UI\n',
      findings: [
        {
          message: 'has no front matter; a main file opens with it',
          path: PATH,
        },
      ],
    });
  });

  it.each([
    {
      expected: [
        'front matter line 4 (summary) is not valid YAML: Nested mappings are not allowed in compact mappings',
      ],
      name: 'an unquoted colon in the summary',
      text: uiFile({
        summary: 'Screens: states and tokens.',
      }),
    },
    {
      expected: [
        'front matter line 12 (governs) is not valid YAML: an unquoted value starts with "*", which YAML reads as an alias; quote it',
      ],
      name: 'an unquoted glob in a block list',
      text: uiFile({}).replace('governs: []', 'governs:\n  - *.tsx'),
    },
    {
      expected: [
        'front matter is not a mapping of fields',
      ],
      name: 'a list instead of a mapping',
      text: '---\n- id\n---\n',
    },
    {
      expected: [
        'front matter lacks "status"; every block declares every field',
        'front matter has "brands", which is not a field',
      ],
      name: 'a missing and an unknown field',
      text: uiFile({}).replace('status: stable', 'brands: []'),
    },
    {
      expected: [
        'front matter lists its fields out of order; the order is id, kind, summary, chapters, requires, extends, abstract, checks, owns, governs, status',
      ],
      name: 'the fields out of order',
      text: uiFile({}).replace('id: ui\nkind: domain', 'kind: domain\nid: ui'),
    },
    {
      expected: [
        'front matter: abstract: Invalid input: expected boolean, received string',
      ],
      name: 'a field of the wrong type',
      text: uiFile({}).replace('abstract: false', 'abstract: "no"'),
    },
  ])(
    'should report the messages when the front matter has $name',
    ({ expected, text }) => {
      // Arrange
      const input = text;

      // Act
      const messages = messagesOf(input);

      // Assert
      expect(messages).toStrictEqual(expected);
    },
  );

  it('should report the YAML reason alone when the parser knows no line', () => {
    // Arrange
    const parser = createFakeFrontMatterParser({
      line: undefined,
      reason: 'broken',
      status: 'not-yaml',
    });

    // Act
    const read = readFrontMatter({
      parser,
      path: PATH,
      text: '---\nid: ui\n---\n',
    });

    // Assert
    expect(read.findings).toStrictEqual([
      {
        message: 'front matter is not valid YAML: broken',
        path: PATH,
      },
    ]);
  });

  it.each([
    {
      expected: 'front matter: id "Bad_Id" is not a kebab-case block id',
      fixture: {
        id: 'Bad_Id',
      },
    },
    {
      expected:
        'front matter: kind "platform" is not one of core, domain, context, implementation',
      fixture: {
        kind: 'platform',
      },
    },
    {
      expected: 'front matter: summary has 71 characters; it holds at most 70',
      fixture: {
        summary: `${'A'.repeat(70)}.`,
      },
    },
    {
      expected:
        'front matter: summary is one sentence on one line, ending with a full stop',
      fixture: {
        summary: 'Screens for issue #42 and tokens.',
      },
    },
    {
      expected: 'front matter: extends "Bad", which is not a block id',
      fixture: {
        extends: 'Bad',
      },
    },
    {
      expected: 'front matter: status "done" is not one of stable, draft',
      fixture: {
        status: 'done',
      },
    },
    {
      expected:
        'front matter: chapters lists "Parts.md", which is not a kebab-case .md file name',
      fixture: {
        chapters: [
          'Parts.md',
        ],
      },
    },
    {
      expected:
        'front matter: chapters lists the main file ui.md; chapters are the files after it',
      fixture: {
        chapters: [
          'ui.md',
        ],
      },
    },
    {
      expected: 'front matter: requires "Bad", which is not a block id',
      fixture: {
        requires: [
          'Bad',
        ],
      },
    },
    {
      expected: 'front matter: checks "linting", which is not a role',
      fixture: {
        checks: [
          'linting',
        ],
      },
    },
    {
      expected: 'front matter: owns and governs hold no empty entry',
      fixture: {
        owns: [
          ' ',
        ],
      },
    },
    {
      expected:
        'front matter: governs lists "src/my ui/**", which holds whitespace; the index separates globs with spaces',
      fixture: {
        governs: [
          'src/my ui/**',
        ],
      },
    },
    {
      expected:
        'front matter: governs lists "src/ui\\t**", which holds whitespace; the index separates globs with spaces',
      fixture: {
        governs: [
          'src/ui\t**',
        ],
      },
    },
    {
      expected: 'front matter: requires lists "i18n" twice',
      fixture: {
        requires: [
          'i18n',
          'i18n',
        ],
      },
    },
  ])(
    'should report "$expected" when a field breaks its rule',
    ({ expected, fixture }) => {
      // Arrange
      const text = uiFile(fixture);

      // Act
      const messages = messagesOf(text);

      // Assert
      expect(messages).toStrictEqual([
        expected,
      ]);
    },
  );
});
