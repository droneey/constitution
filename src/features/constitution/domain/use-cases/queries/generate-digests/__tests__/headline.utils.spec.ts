import { describe, expect, it } from 'bun:test';

import { headlineOf } from '../headline.utils';

describe('headlineOf', () => {
  it.each([
    {
      expected: 'Ask “why?”',
      name: 'a closing curly quote follows the question mark',
      statement: 'Ask “why?” Then answer.',
    },
    {
      expected: '(Ask the owner first!)',
      name: 'a closing bracket follows the exclamation mark',
      statement: '(Ask the owner first!) Then merge.',
    },
    {
      expected: 'Say "stop."',
      name: 'a closing straight double quote follows the full stop',
      statement: 'Say "stop." Then go.',
    },
    {
      expected: "Say 'stop.'",
      name: 'a closing straight single quote follows the full stop',
      statement: "Say 'stop.' Then go.",
    },
    {
      expected: 'Say ‘stop.’',
      name: 'a closing curly apostrophe follows the full stop',
      statement: 'Say ‘stop.’ Then go.',
    },
    {
      expected: 'Mark it [done.]',
      name: 'a closing square bracket follows the full stop',
      statement: 'Mark it [done.] Then go.',
    },
    {
      expected: '**Every data view shows four states.**',
      name: 'a bold lead closes after its full stop',
      statement:
        '**Every data view shows four states.** Loading, empty, error and content each have a screen.',
    },
    {
      expected: '_Never skip a check._',
      name: 'a closing underscore emphasis follows the full stop',
      statement: '_Never skip a check._ Fix the cause.',
    },
    {
      expected: 'Keep lines under 80.',
      name: 'a number that follows no list mark ends the sentence',
      statement: 'Keep lines under 80. Wrap the rest.',
    },
    {
      expected: 'Target one runtime: 3.12.',
      name: 'a version number follows a colon',
      statement: 'Target one runtime: 3.12. Then build.',
    },
  ])(
    'should end the headline after the first sentence when $name',
    ({ expected, statement }) => {
      // Arrange
      const input = statement;

      // Act
      const headline = headlineOf(input);

      // Assert
      expect(headline).toBe(expected);
    },
  );

  it.each([
    {
      expected: 'Print `Done. Bye` on exit.',
      name: 'a code span holds a full stop and a space',
      statement: 'Print `Done. Bye` on exit. Then stop.',
    },
    {
      expected: 'Write "i.e." with both dots.',
      name: 'i.e. follows an opening quote',
      statement: 'Write "i.e." with both dots. Then go.',
    },
    {
      expected: 'Cf. the core chapter first.',
      name: 'a capital Cf. opens the statement',
      statement: 'Cf. the core chapter first. Then go.',
    },
    {
      expected: 'Lint, format, etc. run in check.',
      name: 'etc. closes a list',
      statement: 'Lint, format, etc. run in check. Then ship.',
    },
    {
      expected: 'Weigh tabs vs. spaces once.',
      name: 'vs. compares two choices',
      statement: 'Weigh tabs vs. spaces once. Then move on.',
    },
    {
      expected: "Write 'e.g.' in full.",
      name: 'e.g. follows an opening straight single quote',
      statement: "Write 'e.g.' in full. Then go.",
    },
    {
      expected: 'Write “e.g.” in full.',
      name: 'e.g. follows an opening curly double quote',
      statement: 'Write “e.g.” in full. Then go.',
    },
    {
      expected: 'Write ‘e.g.’ in full.',
      name: 'e.g. follows an opening curly single quote',
      statement: 'Write ‘e.g.’ in full. Then go.',
    },
    {
      expected: 'Write [e.g.] in full.',
      name: 'e.g. follows an opening square bracket',
      statement: 'Write [e.g.] in full. Then go.',
    },
    {
      expected: 'Run the checks: 9. types, 10. tests.',
      name: 'steps numbered past 9 follow a colon and a comma',
      statement: 'Run the checks: 9. types, 10. tests. Then ship.',
    },
    {
      expected: 'Run the steps; 1. lint, 2. test.',
      name: 'a step is numbered after a semicolon',
      statement: 'Run the steps; 1. lint, 2. test. Then ship.',
    },
    {
      expected: 'Run (1. lint, 2. test) first.',
      name: 'a step number follows a bracket',
      statement: 'Run (1. lint, 2. test) first. Then ship.',
    },
    {
      expected: '**1.** Lint the code.',
      name: 'a bold step number opens the statement',
      statement: '**1.** Lint the code. **2.** Test it.',
    },
  ])(
    'should read past a dot that ends no sentence when $name',
    ({ expected, statement }) => {
      // Arrange
      const input = statement;

      // Act
      const headline = headlineOf(input);

      // Assert
      expect(headline).toBe(expected);
    },
  );

  it('should return the whole statement on one line when it has no stop and holds runs of whitespace, line breaks and whitespace at both ends', () => {
    // Arrange
    const statement = '\n\tKeep  the\r\nwhole line ';

    // Act
    const headline = headlineOf(statement);

    // Assert
    expect(headline).toBe('Keep the whole line');
  });
});
