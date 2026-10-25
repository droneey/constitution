// The JSON a hook writes, escaped byte for byte as the hooks always have: a control character as
// \u00XX, save a tab and a line break, a carriage return dropped, and DEL escaped too.
const escapes: ReadonlyMap<string, string> = new Map([
  [
    '\t',
    '\\t',
  ],
  [
    '\n',
    '\\n',
  ],
  [
    '\r',
    '',
  ],
  [
    '\\',
    '\\\\',
  ],
  [
    '"',
    '\\"',
  ],
]);
const LAST_CONTROL = 0x1f;
const DELETE = 0x7f;
const HEX_DIGITS = 4;
const HEX = 16;

const escapedOf = (character: string): string => {
  const known = escapes.get(character);
  const code = character.charCodeAt(0);

  if (known !== undefined) {
    return known;
  }

  return code <= LAST_CONTROL || code === DELETE
    ? `\\u${code.toString(HEX).padStart(HEX_DIGITS, '0')}`
    : character;
};

const jsonTextOf = (text: string): string =>
  [
    ...text,
  ]
    .map(escapedOf)
    .join('');

interface ContextOutputInput {
  readonly event: string;
  readonly text: string;
}

const contextOutputOf = (input: ContextOutputInput): string =>
  `{"hookSpecificOutput":{"hookEventName":"${jsonTextOf(input.event)}","additionalContext":"${jsonTextOf(input.text)}"}}\n`;

export { contextOutputOf, jsonTextOf };
