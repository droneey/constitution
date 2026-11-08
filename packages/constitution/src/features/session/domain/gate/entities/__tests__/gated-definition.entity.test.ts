import { describe, expect, it } from 'bun:test';

import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { RuleHash } from '../../value-objects';
import { GatedDefinition } from '../gated-definition.entity';

const file = AbsolutePath.create('/work/names.md');
const hash = RuleHash.create('0123456789abcdef');
const TEXT = 'A **name** is what a thing is called.';

describe('GatedDefinition.create', () => {
  it('should give the definition of its file, hashed from its text alone', () => {
    // Arrange
    const texts: string[] = [];

    // Act
    const definition = GatedDefinition.create({
      file,
      hashOf: (hashed) => {
        texts.push(hashed);

        return '0123456789abcdef';
      },
      text: TEXT,
    });

    // Assert
    expect({
      definition,
      texts,
    }).toStrictEqual({
      definition: {
        file,
        hash,
        text: TEXT,
      },
      texts: [
        TEXT,
      ],
    });
  });
});

describe('GatedDefinition.isRead', () => {
  it.each([
    {
      condition: 'the agent read it at its hash',
      definitions: [
        hash,
      ],
      isRead: true,
    },
    {
      condition: 'the agent read only a rule at its hash',
      definitions: [],
      isRead: false,
    },
  ])('should say $isRead when $condition', ({ definitions, isRead }) => {
    // Act
    const answer = GatedDefinition.isRead(
      {
        file,
        hash,
        text: TEXT,
      },
      {
        definitions: new Set(definitions),
        rules: new Map([
          [
            RuleSlug.create('name-reveals-intent'),
            new Set([
              hash,
            ]),
          ],
        ]),
      },
    );

    // Assert
    expect(answer).toBe(isRead);
  });
});
