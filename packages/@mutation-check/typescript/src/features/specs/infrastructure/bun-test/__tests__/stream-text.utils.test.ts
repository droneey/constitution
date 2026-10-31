import { describe, expect, it } from 'bun:test';

import { streamTextOf } from '../stream-text.utils.ts';

interface StreamRead {
  readonly isLetGo: boolean;
  readonly streamText: string;
}

const streamReadOf = async (texts: readonly string[]): Promise<StreamRead> => {
  const pending = [
    ...texts,
  ];
  let isLetGo = false;
  const stream = new ReadableStream<Uint8Array>(
    {
      cancel: () => {
        isLetGo = true;
      },
      pull: (controller) => {
        const text = pending.shift();

        if (text === undefined) {
          controller.close();
        } else {
          controller.enqueue(new TextEncoder().encode(text));
        }
      },
    },
    {
      highWaterMark: 0,
    },
  );
  const streamText = await streamTextOf({
    limitBytes: 17,
    stream,
  });

  return {
    isLetGo,
    streamText,
  };
};

describe('streamTextOf', () => {
  it.each([
    {
      condition: 'the stream ends on the limit',
      read: {
        isLetGo: false,
        streamText: 'expected 3, got 4',
      },
      texts: [
        'expected 3, ',
        'got 4',
      ],
    },
    {
      condition: 'the stream runs past the limit',
      read: {
        isLetGo: true,
        streamText: 'expected 3, got 4',
      },
      texts: [
        'expected 3, ',
        'got 4; then',
        ' more',
      ],
    },
  ])('should read the stream up to the limit when $condition', async ({ read, texts }) => {
    // Act
    const found = await streamReadOf(texts);

    // Assert
    expect(found).toStrictEqual(read);
  });
});
