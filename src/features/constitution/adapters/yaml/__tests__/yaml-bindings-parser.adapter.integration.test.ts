import { describe, expect, it } from 'bun:test';

import { createYamlBindingsParser } from '../yaml-bindings-parser.adapter';

describe('createYamlBindingsParser', () => {
  it('should return the bindings by axis, part and rule when the file binds settings', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('foundation:\n  core:\n    no-empty-verbs: [no-empty-verbs.grit]\n');

    // Assert
    expect(read).toStrictEqual({
      document: {
        foundation: {
          core: {
            'no-empty-verbs': [
              'no-empty-verbs.grit',
            ],
          },
        },
      },
      status: 'parsed',
    });
  });

  it('should return the reason when the text is not YAML', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('foundation: [\n');

    // Assert
    expect(read.status).toBe('not-yaml');
  });

  it('should return every issue at its field when an axis is unknown and a setting is not text', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('base:\n  core: {}\nfoundation:\n  core:\n    no-any: [1]\n');

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: 'foundation.core.no-any.0',
          message: 'Invalid input: expected string, received number',
        },
        {
          field: '',
          message: 'Unrecognized key: "base"',
        },
      ],
      status: 'mismatched',
    });
  });
});
