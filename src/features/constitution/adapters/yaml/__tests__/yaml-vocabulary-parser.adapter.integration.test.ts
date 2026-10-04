import { describe, expect, it } from 'bun:test';

import { createYamlVocabularyParser } from '../yaml-vocabulary-parser.adapter';

describe('createYamlVocabularyParser', () => {
  it('should return the typed vocabulary when the file lists every kind of word', () => {
    // Arrange
    const parser = createYamlVocabularyParser();

    // Act
    const read = parser.parse(
      'architecture:\n  concepts: [port, binding unit]\n  folders: [adapters/]\n  suffixes: [.port]\nworkflow:\n  concepts: [squash merge]\n  folders: [feature/]\n  suffixes: []\n',
    );

    // Assert
    expect(read).toStrictEqual({
      status: 'parsed',
      vocabulary: {
        architecture: {
          concepts: [
            'port',
            'binding unit',
          ],
          folders: [
            'adapters/',
          ],
          suffixes: [
            '.port',
          ],
        },
        workflow: {
          concepts: [
            'squash merge',
          ],
          folders: [
            'feature/',
          ],
          suffixes: [],
        },
      },
    });
  });

  it.each([
    {
      issues: [
        {
          field: '',
          message: 'Unrecognized key: "domain"',
        },
      ],
      name: 'the root holds an unknown key',
      yaml: 'architecture:\n  concepts: []\n  folders: []\n  suffixes: []\nworkflow:\n  concepts: []\n  folders: []\n  suffixes: []\ndomain: {}\n',
    },
    {
      issues: [
        {
          field: 'architecture',
          message: 'Unrecognized key: "layers"',
        },
      ],
      name: 'the architecture holds an unknown key',
      yaml: 'architecture:\n  concepts: []\n  folders: []\n  suffixes: []\n  layers: []\nworkflow:\n  concepts: []\n  folders: []\n  suffixes: []\n',
    },
    {
      issues: [
        {
          field: 'architecture.concepts',
          message: 'Invalid input: expected array, received string',
        },
        {
          field: 'architecture.suffixes',
          message: 'Invalid input: expected array, received undefined',
        },
        {
          field: 'workflow',
          message: 'Invalid input: expected object, received undefined',
        },
      ],
      name: 'a list is text or missing, and so is the workflow',
      yaml: 'architecture:\n  concepts: port\n  folders: []\n',
    },
  ])('should return every issue at its dotted field when $name', ({ issues, yaml }) => {
    // Arrange
    const parser = createYamlVocabularyParser();

    // Act
    const read = parser.parse(yaml);

    // Assert
    expect(read).toStrictEqual({
      issues,
      status: 'mismatched',
    });
  });

  it('should report the reason when the vocabulary is not YAML', () => {
    // Arrange
    const parser = createYamlVocabularyParser();

    // Act
    const read = parser.parse('architecture:\n  concepts: [port\n');

    // Assert
    expect(read).toStrictEqual({
      reason: 'Flow sequence in block collection must be sufficiently indented and end with a ]',
      status: 'not-yaml',
    });
  });
});
