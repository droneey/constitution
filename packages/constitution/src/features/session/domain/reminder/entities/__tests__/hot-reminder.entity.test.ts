import { describe, expect, it } from 'bun:test';

import { HotReminder } from '../hot-reminder.entity';

describe('HotReminder.firstSentenceOf', () => {
  it.each([
    {
      condition: 'the statement has two sentences',
      firstSentence: 'A comment states what is left.',
      statement: 'A comment states what is left. One that states nothing is removed.',
    },
    {
      condition: 'the statement is one sentence with a dash and a semicolon',
      firstSentence: 'A name is never `data` — or `temp`; generic code may use one.',
      statement: 'A name is never `data` — or `temp`; generic code may use one.',
    },
    {
      condition: 'a full stop sits inside a word',
      firstSentence: 'Use e.g.the name.',
      statement: 'Use e.g.the name. Then more.',
    },
  ])('should give the first sentence when $condition', ({ firstSentence, statement }) => {
    // Act
    const given = HotReminder.firstSentenceOf(statement);

    // Assert
    expect(given).toBe(firstSentence);
  });
});
