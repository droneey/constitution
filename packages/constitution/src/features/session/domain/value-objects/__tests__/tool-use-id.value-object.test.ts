import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { SessionValueFailure } from '../../errors';
import { ToolUseId } from '../tool-use-id.value-object';

describe('ToolUseId', () => {
  it.each([
    {
      given: 'toolu_01AbC-9',
      isValue: true,
    },
    {
      given: 'toolu/1',
      isValue: false,
    },
    {
      given: '',
      isValue: false,
    },
    {
      given: 7,
      isValue: false,
    },
  ])('should say $isValue of $given', ({ given, isValue }) => {
    // Act
    const answer = ToolUseId.is(given);

    // Assert
    expect(answer).toBe(isValue);
  });

  it('should make the value its text gives', () => {
    // Act
    const id = ToolUseId.create('toolu_01AbC-9');

    // Assert
    expect<string>(id).toBe('toolu_01AbC-9');
  });

  it('should refuse a text of another form', () => {
    // Act
    const create = (): ToolUseId => ToolUseId.create('toolu/1');

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: SessionValueFailure.ToolUseId,
        details: {
          text: 'toolu/1',
        },
      }),
    );
  });
});
