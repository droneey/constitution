import { GrammarRefusal } from './errors';

// The scalars and flow lists of the fixed subset of YAML that constitution.yaml is written in. A
// text outside the subset throws a refusal, which the parser turns into the line it stops at.

const DOUBLE = '"';
const SINGLE = "'";
const DOUBLED_SINGLE = "''";
const BACKSLASH = '\\';
// A plain scalar never opens with one of these: they start an anchor, an alias, a tag, a block
// scalar, a flow collection or a reserved indicator.
const INDICATORS = '&*!|>{[@`%';
const OPENS_A_QUOTE_AFTER = ':[,-';
const BLANK = /[ \t]/;
const BLANKS_AROUND = /^[ \t]+|[ \t]+$/g;

const trimBlanks = (text: string): string => text.replace(BLANKS_AROUND, '');

// Tells one character, never more, for a blank.
const isBlank = (character: string): boolean => BLANK.test(character);

const isQuote = (character: string): boolean => character === DOUBLE || character === SINGLE;

// The last character that is no blank, which decides where a quote may open; none before the first.
const lastOf = <TLast extends string | undefined>(input: {
  character: string;
  last: TLast;
}): TLast | string => (isBlank(input.character) ? input.last : input.character);

// What a character does inside a quoted scalar: whether it closes the quote, and whether it escapes
// the character after it, which a double quote's backslash does.
const insideQuote = (input: {
  character: string;
  quote: string;
}): {
  isEscape: boolean;
  quote: string;
} => {
  if (input.quote === DOUBLE && input.character === BACKSLASH) {
    return {
      isEscape: true,
      quote: input.quote,
    };
  }

  return {
    isEscape: false,
    quote: input.character === input.quote ? '' : input.quote,
  };
};

// A "#" after a blank starts a comment unless it sits in a quoted scalar, and a quote opens a scalar
// only where a scalar can start: before any character but blanks, or after a key, a flow list's
// bracket or comma, or an item's dash.
const withoutComment = (line: string): string => {
  let quote = '';
  let last: string | undefined;
  let isEscaped = false;

  for (const [at, character] of line.split('').entries()) {
    if (isEscaped) {
      isEscaped = false;
    } else if (quote !== '') {
      const step = insideQuote({
        character,
        quote,
      });

      quote = step.quote;
      isEscaped = step.isEscape;
    } else if (character === '#' && (at === 0 || isBlank(line.charAt(at - 1)))) {
      return line.slice(0, at);
    } else if (isQuote(character) && (last === undefined || OPENS_A_QUOTE_AFTER.includes(last))) {
      quote = character;
    }

    last = lastOf({
      character,
      last,
    });
  }

  return line;
};

// A backslash keeps a quote or a backslash after it and is kept before any other character, a
// backslash that ends the scalar included.
const unescapedDouble = (inner: string): string => {
  let text = '';
  let isEscaped = false;

  for (const character of inner) {
    if (isEscaped) {
      isEscaped = false;
      text +=
        character === DOUBLE || character === BACKSLASH ? character : `${BACKSLASH}${character}`;
    } else if (character === BACKSLASH) {
      isEscaped = true;
    } else if (character === DOUBLE) {
      throw new GrammarRefusal();
    } else {
      text += character;
    }
  }

  return isEscaped ? `${text}${BACKSLASH}` : text;
};

// Two quotes write one; a quote alone leaves the grammar.
const unescapedSingle = (inner: string): string => {
  const pieces = inner.split(DOUBLED_SINGLE);

  if (pieces.some((piece) => piece.includes(SINGLE))) {
    throw new GrammarRefusal();
  }

  return pieces.join(SINGLE);
};

const scalarOf = (written: string): string => {
  const text = trimBlanks(written);
  const first = text.charAt(0);

  if (isQuote(first)) {
    if (text.length < 2 || !text.endsWith(first)) {
      throw new GrammarRefusal();
    }

    const inner = text.slice(1, -1);

    return first === DOUBLE ? unescapedDouble(inner) : unescapedSingle(inner);
  }

  if (text !== '' && INDICATORS.includes(first)) {
    throw new GrammarRefusal();
  }

  return text;
};

// Where the "]" that closes a flow list opening at the text's start sits, or -1 while it runs on;
// a nested collection leaves the grammar.
const closingBracketOf = (text: string): number => {
  let quote = '';
  let last = '[';
  let isEscaped = false;

  for (const [at, character] of text.slice(1).split('').entries()) {
    if (isEscaped) {
      isEscaped = false;
    } else if (quote !== '') {
      const step = insideQuote({
        character,
        quote,
      });

      quote = step.quote;
      isEscaped = step.isEscape;
    } else if (isQuote(character) && (last === '[' || last === ',')) {
      quote = character;
    } else if (character === ']') {
      return at + 1;
    } else if (character === '[' || character === '{') {
      throw new GrammarRefusal();
    }

    last = lastOf({
      character,
      last,
    });
  }

  return -1;
};

// A flow list's text between its brackets, split at each comma outside a quoted scalar.
const piecesOf = (inner: string): readonly string[] => {
  const pieces: string[] = [
    '',
  ];
  let quote = '';
  let last = ',';
  let isEscaped = false;

  for (const character of inner) {
    if (isEscaped) {
      isEscaped = false;
    } else if (quote !== '') {
      const step = insideQuote({
        character,
        quote,
      });

      quote = step.quote;
      isEscaped = step.isEscape;
    } else if (character === ',') {
      pieces.push('');
      last = ',';

      continue;
    } else if (isQuote(character) && last === ',') {
      quote = character;
    }

    pieces[pieces.length - 1] += character;
    last = lastOf({
      character,
      last,
    });
  }

  return pieces;
};

// The items of a whole flow list; "[a, b,]" ends with an empty piece, which YAML allows.
const flowItemsOf = (text: string): readonly string[] => {
  const end = closingBracketOf(text);

  if (trimBlanks(text.slice(end + 1)) !== '') {
    throw new GrammarRefusal();
  }

  const pieces = piecesOf(text.slice(1, end)).map(trimBlanks);

  return pieces.flatMap((piece, index) => {
    if (piece === '' && index < pieces.length - 1) {
      throw new GrammarRefusal();
    }

    return piece === ''
      ? []
      : [
          scalarOf(piece),
        ];
  });
};

export { closingBracketOf, flowItemsOf, scalarOf, trimBlanks, withoutComment };
