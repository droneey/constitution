import { describe, expect, it } from 'bun:test';

import { createYamlBindingsParser } from '../yaml-bindings-parser.adapter';

describe('createYamlBindingsParser', () => {
  it('should return the bindings by part and rule when the file binds settings', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('core:\n  no-empty-verbs: [no-empty-verbs.grit]\n');

    // Assert
    expect(read).toStrictEqual({
      document: {
        core: {
          'no-empty-verbs': [
            'no-empty-verbs.grit',
          ],
        },
      },
      status: 'parsed',
    });
  });

  it('should return the reason when the text is not YAML', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('core: [\n');

    // Assert
    expect(read.status).toBe('not-yaml');
  });

  it('should return every issue at its field when a part lists its settings without a rule and a setting is not text', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('self: [noConsole]\ncore:\n  no-any: [1]\n');

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: 'self',
          message: 'Invalid input: expected record, received array',
        },
        {
          field: 'core.no-any.0',
          message: 'Invalid input: expected string, received number',
        },
      ],
      status: 'mismatched',
    });
  });
});
