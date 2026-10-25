import { describe, expect, it } from 'bun:test';

import { ReadStatus } from '../../../domain/entities';
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
        extends: undefined,
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
      issues: [],
      keys: keyLines,
      status: ReadStatus.Mapping,
    });
  });

  it('should return every wire issue at its dotted field and no fields when values have the wrong type', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = fieldTable
      .replace('abstract: false', 'abstract: "no"')
      .replace('governs: ["**/ui/**"]', 'governs: ["**/ui/**", 19]');

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      fields: undefined,
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
      status: ReadStatus.Mapping,
    });
  });

  it('should report the line and the reason without its position when the text is not YAML', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = fieldTable.replace('governs: ["**/ui/**"]', 'governs: ["**/ui/**" "**/web/**"]');

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      line: 7,
      reason: 'Missing , or : between flow sequence items',
      status: ReadStatus.NotYaml,
    });
  });

  it('should report the line of an unquoted star when a value reads as an alias', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = 'id: ui\ngoverns:\n  - *.tsx\nlanguages: []';

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      line: 3,
      reason: 'an unquoted value starts with "*", which YAML reads as an alias; quote it',
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
        description: undefined,
        name: 'amend',
      },
      name: 'the description is blank',
      yaml: 'name: amend\ndescription: "  "',
    },
    {
      expected: {
        description: undefined,
        name: undefined,
      },
      name: 'the fields are not text',
      yaml: 'name: [ratify]\ndescription: 7',
    },
    {
      expected: {
        description: undefined,
        name: undefined,
      },
      name: 'the front matter is a list',
      yaml: '- name\n- description',
    },
    {
      expected: {
        description: undefined,
        name: undefined,
      },
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
