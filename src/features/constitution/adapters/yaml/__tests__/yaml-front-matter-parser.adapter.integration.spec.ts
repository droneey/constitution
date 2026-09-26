import { describe, expect, it } from 'bun:test';

import { createYamlFrontMatterParser } from '../yaml-front-matter-parser.adapter';

const FIELDS = [
  'id: ui',
  'kind: domain',
  'summary: Screens.',
  'chapters: []',
  'requires: []',
  'extends: null',
  'abstract: false',
  'checks: []',
  'owns: []',
  'governs: ["**/ui/**"]',
  'status: stable',
].join('\n');

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

describe('createYamlFrontMatterParser', () => {
  it('should return the keys in order and the typed fields when the front matter is a complete mapping', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();

    // Act
    const read = parser.parse(FIELDS);

    // Assert
    expect(read).toStrictEqual({
      fields: {
        abstract: false,
        chapters: [],
        checks: [],
        extends: undefined,
        governs: [
          '**/ui/**',
        ],
        id: 'ui',
        kind: 'domain',
        owns: [],
        requires: [],
        status: 'stable',
        summary: 'Screens.',
      },
      issues: [],
      keys: KEYS,
      status: 'mapping',
    });
  });

  it('should return every wire issue at its dotted field and no fields when values have the wrong type', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = FIELDS.replace('abstract: false', 'abstract: "no"').replace(
      'owns: []',
      'owns: [React, 19]',
    );

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      fields: undefined,
      issues: [
        {
          field: 'abstract',
          message: 'Invalid input: expected boolean, received string',
        },
        {
          field: 'owns.1',
          message: 'Invalid input: expected string, received number',
        },
      ],
      keys: KEYS,
      status: 'mapping',
    });
  });

  it('should report the line and the reason without its position when the text is not YAML', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = FIELDS.replace(
      'governs: ["**/ui/**"]',
      'governs: ["**/ui/**" "**/web/**"]',
    );

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      line: 10,
      reason: 'Missing , or : between flow sequence items',
      status: 'not-yaml',
    });
  });

  it('should report the line of an unquoted star when a value reads as an alias', () => {
    // Arrange
    const parser = createYamlFrontMatterParser();
    const yaml = 'id: ui\ngoverns:\n  - *.tsx\nstatus: stable';

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      line: 3,
      reason:
        'an unquoted value starts with "*", which YAML reads as an alias; quote it',
      status: 'not-yaml',
    });
  });

  it.each([
    {
      name: 'a list',
      yaml: '- id\n- kind',
    },
    {
      name: 'a plain text',
      yaml: 'A block of screens.',
    },
    {
      name: 'empty',
      yaml: '',
    },
  ])(
    'should say it is not a mapping when the front matter is $name',
    ({ yaml }) => {
      // Arrange
      const parser = createYamlFrontMatterParser();

      // Act
      const read = parser.parse(yaml);

      // Assert
      expect(read).toStrictEqual({
        status: 'not-a-mapping',
      });
    },
  );
});
