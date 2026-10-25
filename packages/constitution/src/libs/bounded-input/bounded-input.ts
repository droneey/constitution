interface TextWithinInput {
  readonly maxBytes: number;
  readonly stream: AsyncIterable<Uint8Array> | Iterable<Uint8Array>;
}

/** The stream's text, decoded as UTF-8, or undefined as soon as it runs past maxBytes, read no further. */
const readTextWithin = async (input: TextWithinInput): Promise<string | undefined> => {
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;

  for await (const chunk of input.stream) {
    bytes += chunk.byteLength;

    if (bytes > input.maxBytes) {
      return undefined;
    }

    text += decoder.decode(chunk, {
      stream: true,
    });
  }

  return `${text}${decoder.decode()}`;
};

interface NestingInput {
  readonly maxDepth: number;
  readonly text: string;
}

const openings: ReadonlySet<string> = new Set([
  '[',
  '{',
]);
const closings: ReadonlySet<string> = new Set([
  ']',
  '}',
]);

/**
 * Whether JSON text nests its arrays and objects at most maxDepth deep, brackets inside strings
 * aside; a text that is no JSON is read the same way, for its parser to refuse.
 */
const isNestedWithin = (input: NestingInput): boolean => {
  let depth = 0;
  let isInString = false;
  let isEscaped = false;

  for (const character of input.text) {
    if (isInString) {
      isInString = isEscaped || character !== '"';
      isEscaped = !isEscaped && character === '\\';

      continue;
    }

    isInString = character === '"';
    depth += openings.has(character) ? 1 : 0;
    depth -= closings.has(character) ? 1 : 0;

    if (depth > input.maxDepth) {
      return false;
    }
  }

  return true;
};

export { isNestedWithin, readTextWithin };
