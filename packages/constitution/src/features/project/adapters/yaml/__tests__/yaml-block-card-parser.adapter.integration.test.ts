import { describe, expect, it } from 'bun:test';

import { createYamlBlockCardParser } from '../yaml-block-card-parser.adapter';

describe('createYamlBlockCardParser', () => {
  it.each([
    {
      card: {
        extends: 'web',
        governs: [
          '**/ui/**',
          '**/web/**',
        ],
        isAbstract: true,
        languages: [
          'typescript',
          'css',
        ],
        requires: [
          'ui',
        ],
        summary: 'Screens.',
      },
      condition: 'every field is given in its own form',
      yaml: 'summary: Screens.\nextends: web\nabstract: true\nrequires: [ui]\nlanguages: [typescript, css]\ngoverns: ["**/ui/**", "**/web/**"]',
    },
    {
      card: {
        extends: '7',
        governs: [
          '**/api/**',
        ],
        isAbstract: true,
        languages: [
          'python',
        ],
        requires: [
          '3',
          'true',
        ],
        summary: '12',
      },
      condition: 'scalars stand for text and a single pattern for a list',
      yaml: 'summary: 12\nextends: 7\nabstract: "true"\nrequires: [3, true, "", null, {a: b}, [c]]\nlanguages: python\ngoverns: "**/api/**"',
    },
    {
      card: {
        governs: [],
        isAbstract: false,
        languages: [],
        requires: [],
      },
      condition: 'the fields are of another form or empty',
      yaml: 'summary: {text: Screens.}\nextends: ""\nabstract: yes\nrequires: ""\ngoverns: {a: b}',
    },
    {
      card: {
        governs: [],
        isAbstract: false,
        languages: [],
        requires: [],
      },
      condition: 'the fields are left out',
      yaml: 'id: ui',
    },
    {
      card: {
        governs: [],
        isAbstract: false,
        languages: [],
        requires: [],
      },
      condition: 'the front matter is no YAML',
      yaml: 'summary: Screens.\ngoverns: ["**/ui/**" "**/web/**"]',
    },
    {
      card: {
        governs: [],
        isAbstract: false,
        languages: [],
        requires: [],
      },
      condition: 'the front matter is a list',
      yaml: '- summary\n- governs',
    },
    {
      card: {
        governs: [],
        isAbstract: false,
        languages: [],
        requires: [],
      },
      condition: 'the front matter is null',
      yaml: '~',
    },
  ])('should read the card a project can read when $condition', ({ card, yaml }) => {
    // Arrange
    const parser = createYamlBlockCardParser();

    // Act
    const read = parser.card(yaml);

    // Assert
    expect(read).toStrictEqual(card);
  });
});
