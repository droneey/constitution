import { describe, expect, it } from 'bun:test';

import { ReadStatus } from '../../../domain/entities';
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
      status: ReadStatus.Parsed,
    });
  });

  it('should return the reason without its position when the text is not YAML', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('core: [\n');

    // Assert
    expect(read).toStrictEqual({
      reason: 'Flow sequence in block collection must be sufficiently indented and end with a ]',
      status: ReadStatus.NotYaml,
    });
  });

  it('should return every issue at its field when a part lists its settings without a rule and a setting is not text', () => {
    // Arrange
    const parser = createYamlBindingsParser();

    // Act
    const read = parser.parse('self: [noConsole]\ncore:\n  any-never-typed: [1]\n');

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: 'self',
          message: expect.stringContaining('record'),
        },
        {
          field: 'core.any-never-typed.0',
          message: expect.stringContaining('string'),
        },
      ],
      status: ReadStatus.Mismatched,
    });
  });
});
