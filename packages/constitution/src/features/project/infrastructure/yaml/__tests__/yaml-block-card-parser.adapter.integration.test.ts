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
      },
      condition: 'scalars stand for text and a single pattern for a list',
      yaml: 'summary: 12\nextends: 7\nabstract: "true"\nrequires: [3, true, "", null, {a: b}, [c]]\nlanguages: python\ngoverns: "**/api/**"',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the fields are of another form or empty',
      yaml: 'summary: {text: Screens.}\nextends: ""\nabstract: yes\nrequires: ""\ngoverns: {a: b}',
    },
    {
      card: {
        governs: [
          '**/package.json',
        ],
        languages: [],
        requires: [
          'task-runner',
        ],
      },
      condition:
        'a nested passport names its id by its path and states neither extends nor abstract',
      yaml: 'id: js-runtime/bun\nsummary: Bun.\nrequires: [task-runner]\nlanguages: []\ngoverns: ["**/package.json"]',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'every field the card reads is left out',
      yaml: 'id: ui\nsummary: Screens.',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the front matter is no YAML',
      yaml: 'summary: Screens.\ngoverns: ["**/ui/**" "**/web/**"]',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the front matter is a list',
      yaml: '- summary\n- governs',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the front matter is null',
      yaml: '~',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the front matter holds an alias',
      yaml: 'summary: &s Screens.\nextends: *s',
    },
    {
      card: {
        governs: [],
        languages: [],
        requires: [],
      },
      condition: 'the front matter holds an alias without its anchor',
      yaml: 'requires: [*ui]',
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
