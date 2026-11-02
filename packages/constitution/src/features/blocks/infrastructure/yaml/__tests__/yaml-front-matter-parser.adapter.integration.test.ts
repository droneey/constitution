import { describe, expect, it } from 'bun:test';

import { ReadStatus } from '../../../domain/shared/entities';
import { createYamlFrontMatterParser } from '../yaml-front-matter-parser.adapter';

const fieldTable = [
  'id: ui',
  'summary: Screens.',
  'requires: []',
  'extends: null',
  'abstract: false',
  'languages: [css]',
  'governs: ["**/ui/**"]',
].join('\n');

const keyLines = [
  'id',
  'summary',
  'requires',
  'extends',
  'abstract',
  'languages',
  'governs',
];

describe('createYamlFrontMatterParser', () => {
  it('should return the keys in order and the typed fields when the front matter is a complete mapping', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.parse(fieldTable);

    // Assert
    expect(read).toStrictEqual({
      fields: {
        abstract: false,
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        languages: [
          'css',
        ],
        requires: [],
        summary: 'Screens.',
      },
      keys: keyLines,
      status: ReadStatus.Mapping,
    });
  });

  it('should keep the base when the block extends one', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = fieldTable.replace('extends: null', 'extends: screens');

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      fields: {
        abstract: false,
        extends: 'screens',
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        languages: [
          'css',
        ],
        requires: [],
        summary: 'Screens.',
      },
      keys: keyLines,
      status: ReadStatus.Mapping,
    });
  });

  it('should return every wire issue at its dotted field when values have the wrong type', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = fieldTable
      .replace('abstract: false', 'abstract: "no"')
      .replace('governs: ["**/ui/**"]', 'governs: ["**/ui/**", 19]');

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: 'abstract',
          message: expect.stringContaining('boolean'),
        },
        {
          field: 'governs.1',
          message: expect.stringContaining('string'),
        },
      ],
      keys: keyLines,
      status: ReadStatus.Mismatched,
    });
  });

  it('should report the line, its field and the reason without its position when the text is not YAML', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = fieldTable.replace('governs: ["**/ui/**"]', 'governs: ["**/ui/**" "**/web/**"]');

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      at: {
        key: 'governs',
        line: 7,
      },
      reason: 'Missing , or : between flow sequence items',
      status: ReadStatus.NotYaml,
    });
  });

  it('should report the line of an unquoted star and the field above it when a value reads as an alias', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = 'id: ui\ngoverns:\n  - *.tsx\nlanguages: []';

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      at: {
        key: 'governs',
        line: 3,
      },
      reason: 'an unquoted value starts with "*", which YAML reads as an alias; quote it',
      status: ReadStatus.NotYaml,
    });
  });

  it.each([
    {
      at: {
        key: 'summary',
        line: 2,
      },
      name: 'on the line of a field',
      yaml: 'id: ui\nsummary: Screens: states.\nrequires: []',
    },
    {
      at: {
        key: 'summary',
        line: 2,
      },
      name: 'on the line of a field with a space before its colon',
      yaml: 'id: ui\nsummary : Screens: states.',
    },
    {
      at: {
        key: 'governs',
        line: 3,
      },
      name: 'on a nested line that names a key of its own',
      yaml: 'id: ui\ngoverns:\n  - pattern: *.tsx',
    },
    {
      at: {
        line: 2,
      },
      name: 'below no field',
      yaml: '- id\n- "a',
    },
  ])('should place a YAML error $name', ({ at, yaml }) => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      at,
      reason: expect.any(String),
      status: ReadStatus.NotYaml,
    });
  });

  it.each([
    {
      name: 'a list',
      yaml: '- id\n- summary',
    },
    {
      name: 'a plain text',
      yaml: 'A block of screens.',
    },
    {
      name: 'empty',
      yaml: '',
    },
  ])('should say it is not a mapping when the front matter is $name', ({ yaml }) => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      status: ReadStatus.NotMapping,
    });
  });

  it.each([
    {
      expected: {
        description: 'Writes constitution.yaml and PROJECT.md.',
        name: 'ratify',
      },
      name: 'both fields are text',
      yaml: 'name: ratify\ndescription: Writes constitution.yaml and PROJECT.md.\ndisable-model-invocation: true',
    },
    {
      expected: {
        name: 'amend',
      },
      name: 'the description is blank',
      yaml: 'name: amend\ndescription: "  "',
    },
    {
      expected: {},
      name: 'the fields are not text',
      yaml: 'name: [ratify]\ndescription: 7',
    },
    {
      expected: {},
      name: 'the front matter is a list',
      yaml: '- name\n- description',
    },
    {
      expected: {},
      name: 'the front matter is empty',
      yaml: '',
    },
  ])("should read a skill's name and description as text when $name", ({ expected, yaml }) => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.skill(yaml);

    // Assert
    expect(read).toStrictEqual({
      ...expected,
      status: ReadStatus.Parsed,
    });
  });

  it.each([
    {
      condition: 'without its anchor',
      yaml: 'name: ratify\ndescription: *bold',
    },
    {
      condition: 'with its anchor',
      yaml: 'name: &name ratify\ndescription: *name',
    },
  ])(
    "should report the reason when a skill's front matter names an alias $condition",
    ({ yaml }) => {
      // Arrange
      const parser = createYamlFrontMatterParser();

      // Act
      const read = parser.skill(yaml);

      // Assert
      expect(read).toStrictEqual({
        reason: 'an unquoted value starts with "*", which YAML reads as an alias; quote it',
        status: ReadStatus.NotYaml,
      });
    },
  );

  it("should report the reason when a skill's front matter is not YAML", () => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.skill('name: ratify\ndescription: [a');

    // Assert
    expect(read).toStrictEqual({
      reason: 'Flow sequence in block collection must be sufficiently indented and end with a ]',
      status: ReadStatus.NotYaml,
    });
  });
});
