import { describe, expect, it } from 'bun:test';

import { Level } from '../../constants';
import { RuleHeading } from '../rule-heading.entity';

describe('RuleHeading.of', () => {
  it.each<{
    condition: string;
    expected: RuleHeading | undefined;
    text: string;
  }>([
    {
      condition: 'it states a level',
      expected: {
        level: Level.Should,
        slug: 'four-data-states',
      },
      text: 'four-data-states · SHOULD',
    },
    {
      condition: 'it tightens a rule at a level of its own',
      expected: {
        level: Level.Should,
        slug: 'port-is-an-interface',
        tightens: 'behaviour-composed-not-inherited',
      },
      text: 'port-is-an-interface → behaviour-composed-not-inherited · SHOULD',
    },
    {
      condition: 'it tightens a rule and leaves its level to the chain',
      expected: {
        slug: 'a',
        tightens: 'b',
      },
      text: 'a → b',
    },
    {
      condition: 'it names neither a level nor a rule it tightens',
      expected: undefined,
      text: 'Wiring',
    },
    {
      condition: 'its level is no level',
      expected: undefined,
      text: 'a · MUSTN',
    },
    {
      condition: 'it holds words with spaces',
      expected: undefined,
      text: 'The root · MUST',
    },
  ])('should read the rule a heading names when $condition', ({ expected, text }) => {
    // Act
    const heading = RuleHeading.of(text);

    // Assert
    expect(heading).toStrictEqual(expected);
  });
});
