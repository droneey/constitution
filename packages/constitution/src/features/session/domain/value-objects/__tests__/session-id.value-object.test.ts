import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { SessionId } from '../session-id.value-object';

describe('SessionId', () => {
  it.each([
    {
      condition: 'it holds letters, digits, a dash and an underscore',
      given: 'Session_1-a',
      isId: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isId: false,
    },
    {
      condition: 'it climbs to a parent folder',
      given: '../session',
      isId: false,
    },
    {
      condition: 'a plain name is followed by a slash',
      given: 'session/',
      isId: false,
    },
    {
      condition: 'a slash comes before a plain name',
      given: '/session',
      isId: false,
    },
    {
      condition: 'it is no text',
      given: 7,
      isId: false,
    },
  ])('should say $isId when $condition', ({ given, isId }) => {
    // Act
    const answer = SessionId.is(given);

    // Assert
    expect(answer).toBe(isId);
  });

  it('should make the id a plain name gives', () => {
    // Arrange
    const text = 'Session_1-a';

    // Act
    const id = SessionId.create(text);

    // Assert
    expect<string>(id).toBe(text);
  });

  it('should refuse a text that is no plain name', () => {
    // Arrange
    const text = '../session';

    // Act
    const create = (): SessionId => SessionId.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.SessionId,
        details: {
          text,
        },
      }),
    );
  });
});
