import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../../shared/errors';
import { AgentId } from '../agent-id.value-object';

describe('AgentId', () => {
  it.each([
    {
      condition: 'it holds letters, digits, a dash and an underscore',
      given: 'a1b2-c3',
      isId: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isId: false,
    },
    {
      condition: 'it climbs to a parent folder',
      given: '../agent',
      isId: false,
    },
    {
      condition: 'a plain name is followed by a slash',
      given: 'agent/',
      isId: false,
    },
    {
      condition: 'a slash comes before a plain name',
      given: '/agent',
      isId: false,
    },
    {
      condition: 'it is no text',
      given: 7,
      isId: false,
    },
  ])('should say $isId when $condition', ({ given, isId }) => {
    // Act
    const answer = AgentId.is(given);

    // Assert
    expect(answer).toBe(isId);
  });

  it('should make the id a plain name gives', () => {
    // Arrange
    const text = 'a1b2-c3';

    // Act
    const id = AgentId.create(text);

    // Assert
    expect<string>(id).toBe(text);
  });

  it('should refuse a text that is no plain name', () => {
    // Arrange
    const text = '../agent';

    // Act
    const create = (): AgentId => AgentId.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.AgentId,
        details: {
          text,
        },
      }),
    );
  });
});
