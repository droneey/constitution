import { describe, expect, it } from 'bun:test';

import { contextOutputOf, jsonTextOf } from '../hook-output.utils';

describe('jsonTextOf', () => {
  it.each([
    {
      condition: 'a tab',
      escaped: 'a\\tb',
      text: 'a\tb',
    },
    {
      condition: 'a line break',
      escaped: 'a\\nb',
      text: 'a\nb',
    },
    {
      condition: 'a carriage return, which is dropped',
      escaped: 'ab',
      text: 'a\rb',
    },
    {
      condition: 'a backslash',
      escaped: 'a\\\\b',
      text: 'a\\b',
    },
    {
      condition: 'a double quote',
      escaped: 'a\\"b',
      text: 'a"b',
    },
    {
      condition: 'the first control byte',
      escaped: 'a\\u0000b',
      text: 'a\u0000b',
    },
    {
      condition: 'the last control byte',
      escaped: 'a\\u001fb',
      text: 'a\u001fb',
    },
    {
      condition: 'DEL',
      escaped: 'a\\u007fb',
      text: 'a\u007fb',
    },
    {
      condition: 'a space, a tilde, a letter past ASCII and an emoji, kept as they are',
      escaped: 'a ~é😀\u0080b',
      text: 'a ~é😀\u0080b',
    },
  ])('should escape the text byte for byte when it holds $condition', ({ escaped, text }) => {
    // Arrange
    const input = text;

    // Act
    const json = jsonTextOf(input);

    // Assert
    expect(json).toBe(escaped);
  });
});

describe('contextOutputOf', () => {
  it('should give the hook-specific output of the event with both fields escaped when a hook answers it', () => {
    // Arrange
    const input = {
      event: 'Session"Start',
      text: 'line one\nline "two"\n',
    };

    // Act
    const output = contextOutputOf(input);

    // Assert
    expect(output).toBe(
      '{"hookSpecificOutput":{"hookEventName":"Session\\"Start","additionalContext":"line one\\nline \\"two\\"\\n"}}\n',
    );
  });
});
