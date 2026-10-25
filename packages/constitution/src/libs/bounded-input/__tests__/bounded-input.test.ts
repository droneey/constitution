import { describe, expect, it } from 'bun:test';

import { isNestedWithin, readTextWithin } from '../bounded-input';

const encoder = new TextEncoder();

// A stream of the chunks, one by one; past the last it ends, or, when it is endless, fails the read.
const streamOf = (input: {
  chunks: readonly Uint8Array[];
  isEndless: boolean;
}): AsyncIterable<Uint8Array> => ({
  [Symbol.asyncIterator]: (): AsyncIterator<Uint8Array> => {
    const pending = [
      ...input.chunks,
    ];

    return {
      next: async (): Promise<IteratorResult<Uint8Array>> => {
        const chunk = pending.shift();

        if (chunk !== undefined) {
          return await Promise.resolve({
            done: false,
            value: chunk,
          });
        }

        if (input.isEndless) {
          throw new Error('the stream was read past the limit');
        }

        return await Promise.resolve({
          done: true,
          value: undefined,
        });
      },
    };
  },
});

describe('readTextWithin', () => {
  it.each([
    {
      chunks: [
        encoder.encode('abc'),
        encoder.encode('def'),
      ],
      condition: 'it holds as many bytes as the limit',
      text: 'abcdef',
    },
    {
      chunks: [
        encoder.encode('é'),
        encoder.encode('😀'),
      ],
      condition: 'its characters take several bytes',
      text: 'é😀',
    },
    {
      chunks: [
        encoder.encode('é').slice(0, 1),
        encoder.encode('é').slice(1),
      ],
      condition: 'a character is split between two chunks',
      text: 'é',
    },
    {
      chunks: [],
      condition: 'it holds nothing',
      text: '',
    },
  ])('should give the text of the stream when $condition', async ({ chunks, text }) => {
    // Arrange
    const stream = streamOf({
      chunks,
      isEndless: false,
    });

    // Act
    const read = await readTextWithin({
      maxBytes: 6,
      stream,
    });

    // Assert
    expect(read).toBe(text);
  });

  it('should give no text, and read no further, when the stream runs past the limit', async () => {
    // Arrange
    const stream = streamOf({
      chunks: [
        encoder.encode('abc'),
        encoder.encode('de'),
      ],
      isEndless: true,
    });

    // Act
    const read = await readTextWithin({
      maxBytes: 4,
      stream,
    });

    // Assert
    expect(read).toBeUndefined();
  });
});

describe('isNestedWithin', () => {
  it.each([
    {
      condition: 'its arrays and objects nest as deep as the limit',
      isWithin: true,
      text: '{"a":[1,{"b":2}]}',
    },
    {
      condition: 'they nest one deeper than the limit',
      isWithin: false,
      text: '{"a":[1,{"b":[2]}]}',
    },
    {
      condition: 'they nest deep one after another, each within the limit',
      isWithin: true,
      text: '[{"a":[1]},{"b":[2]},{"c":[3]}]',
    },
    {
      condition: 'brackets stand inside a string',
      isWithin: true,
      text: '{"a":"[[[[{{{{"}',
    },
    {
      condition: 'an escaped quote stands inside a string',
      isWithin: true,
      text: '["\\"[[[["]',
    },
    {
      condition: 'an escaped backslash ends a string before its brackets',
      isWithin: false,
      text: '["\\\\",[[[[1]]]]]',
    },
  ])('should say $isWithin when $condition', ({ isWithin, text }) => {
    // Act
    const answer = isNestedWithin({
      maxDepth: 3,
      text,
    });

    // Assert
    expect(answer).toBe(isWithin);
  });
});
