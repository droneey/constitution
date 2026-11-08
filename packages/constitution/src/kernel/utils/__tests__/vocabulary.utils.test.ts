import { describe, expect, it } from 'bun:test';

import { vocabularyOf } from '../vocabulary.utils';

describe('vocabularyOf', () => {
  it.each([
    {
      body: [
        '# Names',
        '',
        '> Governs every name.',
        '',
        '## Vocabulary',
        '',
        'A **name** is what a thing is called.',
        '',
        'An **outside system** is what the program reaches',
        'beyond its own code.',
        '',
        '## General',
        '',
        '### name-reveals-intent · MUST',
        '',
        'A name says what a thing is for.',
      ].join('\n'),
      condition: 'its paragraphs are split by blank lines and a section follows',
      expected: [
        'A **name** is what a thing is called.',
        'An **outside system** is what the program reaches\nbeyond its own code.',
      ],
    },
    {
      body: [
        '## Vocabulary',
        '',
        'The tree:',
        '',
        '```text',
        'src/',
        '',
        '## not a section',
        '```',
        '   ',
        'The **root** holds it.',
      ].join('\n'),
      condition: 'a code sample holds a blank line and a heading, and a blank line holds spaces',
      expected: [
        'The tree:',
        '```text\nsrc/\n\n## not a section\n```',
        'The **root** holds it.',
      ],
    },
    {
      body: [
        'Text before any heading.',
        '',
        '# Names',
        '',
        'Text before any section.',
        '',
        '### Vocabulary',
        '',
        'A **name** under a heading of a rule.',
        '',
        '## The vocabulary',
        '',
        'A **name** is what a thing is called.',
        '',
        '## General',
        '',
        'Text of another section.',
      ].join('\n'),
      condition:
        'no section of the second level is named Vocabulary, as in a chapter of the legacy tree',
      expected: [],
    },
    {
      body: [
        '## Vocabulary',
        'A **name** is what a thing is called.',
        '### a-rule · MUST',
        'A rule held by the vocabulary.',
        '## Vocabulary',
        'A **term** is a word a vocabulary defines.',
      ].join('\n'),
      condition: 'a heading of any level ends it and another Vocabulary section starts again',
      expected: [
        'A **name** is what a thing is called.',
        'A **term** is a word a vocabulary defines.',
      ],
    },
  ])(
    'should give each definition of the Vocabulary section when $condition',
    ({ body, expected }) => {
      // Act
      const definitions = vocabularyOf(body);

      // Assert
      expect(definitions).toStrictEqual(expected);
    },
  );
});
