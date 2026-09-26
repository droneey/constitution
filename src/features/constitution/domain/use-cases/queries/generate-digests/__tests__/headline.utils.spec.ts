import { describe, expect, it } from 'bun:test';

import { headlineOf } from '../headline.utils';

describe('headlineOf', () => {
  it.each([
    {
      expected: 'Every view shows four states.',
      name: 'a full stop ends it',
      statement: 'Every view shows four states. It also retries.',
    },
    {
      expected: 'Is it cached?',
      name: 'a question mark ends it',
      statement: 'Is it cached?\nThen reuse it.',
    },
    {
      expected: 'Never skip a check!',
      name: 'an exclamation mark ends it',
      statement: 'Never skip a check! Fix the cause.',
    },
    {
      expected: 'Say "stop."',
      name: 'a closing quote follows the full stop',
      statement: 'Say "stop." Then go.',
    },
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
      expected: 'Keep lines under 80.',
      name: 'a number ends the sentence',
      statement: 'Keep lines under 80. Wrap the rest.',
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
      expected: '**X.**',
      name: 'a closing double-asterisk emphasis follows the full stop',
      statement: '**X.** Y.',
    },
    {
      expected: '*X.*',
      name: 'a closing single-asterisk emphasis follows the full stop',
      statement: '*X.* Y.',
    },
    {
      expected: '_X._',
      name: 'a closing underscore emphasis follows the full stop',
      statement: '_X._ Y.',
    },
    {
      expected: '**Every data view shows four states.**',
      name: 'a real bold-lead statement ends after its emphasis',
      statement:
        '**Every data view shows four states.** Loading, empty, error and content each have a screen.',
    },
    {
      expected: 'Write \\` then stop.',
      name: 'an escaped backtick does not open a code span',
      statement: 'Write \\` then stop. Next.',
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
      expected: 'Version 1.2 ships now.',
      name: 'a version number holds a dot',
      statement: 'Version 1.2 ships now.',
    },
    {
      expected: 'Use `a.b` here.',
      name: 'a code span holds a dot',
      statement: 'Use `a.b` here. Then more.',
    },
    {
      expected: 'Print `Done. Bye` on exit.',
      name: 'a code span holds a full stop and a space',
      statement: 'Print `Done. Bye` on exit. Then stop.',
    },
    {
      expected: 'Name a tool (e.g. Biome) here.',
      name: 'e.g. follows an opening bracket',
      statement: 'Name a tool (e.g. Biome) here. Next.',
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
      expected: 'Run the steps: 1. lint, 2. test.',
      name: 'a step is numbered',
      statement: 'Run the steps: 1. lint, 2. test. Then ship.',
    },
    {
      expected: '1. Lint the code.',
      name: 'a step number opens the statement',
      statement: '1. Lint the code. 2. Test it.',
    },
    {
      expected: 'Run (1. lint, 2. test) first.',
      name: 'a step number follows a bracket',
      statement: 'Run (1. lint, 2. test) first. Then ship.',
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
      expected: 'Name a tool (*e.g.* Biome) here.',
      name: 'e.g. wrapped in star emphasis is still an abbreviation',
      statement: 'Name a tool (*e.g.* Biome) here. Next.',
    },
    {
      expected: 'Run the steps; 1. lint, 2. test.',
      name: 'a step is numbered after a semicolon',
      statement: 'Run the steps; 1. lint, 2. test. Then ship.',
    },
    {
      expected: '**1.** Lint the code.',
      name: 'a bold step number opens the statement',
      statement: '**1.** Lint the code. **2.** Test it.',
    },
    {
      expected: 'Print ``a. b`` now.',
      name: 'a double-backtick code span holds a dot',
      statement: 'Print ``a. b`` now. Then stop.',
    },
    {
      expected: 'Target one runtime: 3.12.',
      name: 'a version-like number after a colon still ends the sentence',
      statement: 'Target one runtime: 3.12. Then build.',
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

  it.each([
    {
      expected: 'Use one line',
      name: 'runs of spaces and a newline',
      statement: 'Use   one\nline',
    },
    {
      expected: 'Keep the whole line',
      name: 'tabs, a CRLF and whitespace at both ends',
      statement: '\n\tKeep  the\r\nwhole line ',
    },
  ])(
    'should return the whole statement on one line when it has no stop and holds $name',
    ({ expected, statement }) => {
      // Arrange
      const input = statement;

      // Act
      const headline = headlineOf(input);

      // Assert
      expect(headline).toBe(expected);
    },
  );
});
