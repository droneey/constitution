import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
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
    // Arrange
    const candidate: unknown = given;

    // Act
    const answer = AgentId.is(candidate);

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

  it.each([
    {
      condition: 'both name one agent',
      isEqual: true,
      right: 'a1b2-c3',
    },
    {
      condition: 'they name two',
      isEqual: false,
      right: 'a1b2-c3x',
    },
  ])('should say $isEqual when $condition', ({ isEqual, right }) => {
    // Arrange
    const ids = [
      AgentId.create('a1b2-c3'),
      AgentId.create(right),
    ] as const;

    // Act
    const isSame = AgentId.equals(...ids);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
