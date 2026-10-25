// A glob read into its pieces: "**/" any folders or none, "**" anything, "*" and "?" within a
// folder, "{a,b}" either. Braces that do not pair, or nest deeper than the limit, read as no glob.
const MAX_NESTING = 32;
const SEPARATOR = '/';

enum PieceKind {
  Literal = 'literal',
  /** "?" */
  One = 'one',
  /** "*" */
  InFolder = 'in-folder',
  /** "**" */
  Anything = 'anything',
  /** "**\/" */
  AnyFolders = 'any-folders',
  /** "{a,b}" */
  Either = 'either',
}

type Piece =
  | {
      readonly character: string;
      readonly kind: PieceKind.Literal;
    }
  | {
      readonly kind: PieceKind.One | PieceKind.InFolder | PieceKind.Anything | PieceKind.AnyFolders;
    }
  | {
      readonly alternatives: readonly (readonly Piece[])[];
      readonly kind: PieceKind.Either;
    };

const ANY_FOLDERS = [
  '*',
  '*',
  SEPARATOR,
] as const;
const ANYTHING = [
  '*',
  '*',
] as const;

interface ReadInput {
  readonly at: number;
  readonly characters: readonly string[];
}

interface ReadPiece {
  readonly next: number;
  readonly piece: Piece;
}

const isAt = (
  input: ReadInput & {
    readonly token: readonly string[];
  },
): boolean =>
  input.token.every((character, index) => input.characters[input.at + index] === character);

// The piece a character other than a brace or a comma starts, and where the next one starts.
const pieceAt = (input: ReadInput): ReadPiece => {
  // Stryker disable next-line StringLiteral: its caller reads only below the glob's length, so a character is always there
  const character = input.characters[input.at] ?? '';

  if (
    isAt({
      ...input,
      token: ANY_FOLDERS,
    })
  ) {
    return {
      next: input.at + ANY_FOLDERS.length,
      piece: {
        kind: PieceKind.AnyFolders,
      },
    };
  }

  if (
    isAt({
      ...input,
      token: ANYTHING,
    })
  ) {
    return {
      next: input.at + ANYTHING.length,
      piece: {
        kind: PieceKind.Anything,
      },
    };
  }

  const next = input.at + 1;

  if (character === '*') {
    return {
      next,
      piece: {
        kind: PieceKind.InFolder,
      },
    };
  }

  return {
    next,
    piece:
      character === '?'
        ? {
            kind: PieceKind.One,
          }
        : {
            character,
            kind: PieceKind.Literal,
          },
  };
};

interface PiecesInput extends ReadInput {
  readonly depth: number;
}

interface ReadPieces {
  readonly next: number;
  readonly pieces: readonly Piece[];
}

// The pieces up to the end of the glob or, inside braces, of the alternative, which the comma or
// the closing brace after it ends; undefined when the braces do not pair or nest too deep.
const piecesOf = (input: PiecesInput): ReadPieces | undefined => {
  const pieces: Piece[] = [];
  let at = input.at;

  while (at < input.characters.length) {
    const character = input.characters[at];

    if (input.depth > 0 && (character === ',' || character === '}')) {
      return {
        next: at,
        pieces,
      };
    }

    if (character === '}') {
      return undefined;
    }

    const read =
      character === '{'
        ? eitherOf({
            ...input,
            at: at + 1,
            depth: input.depth + 1,
          })
        : pieceAt({
            ...input,
            at,
          });

    if (read === undefined) {
      return undefined;
    }

    pieces.push(read.piece);
    at = read.next;
  }

  return input.depth > 0
    ? undefined
    : {
        next: at,
        pieces,
      };
};

// The alternatives of a brace that opens just before at, up to its closing.
const eitherOf = (input: PiecesInput): ReadPiece | undefined => {
  const alternatives: (readonly Piece[])[] = [];
  let at = input.at;

  if (input.depth > MAX_NESTING) {
    return undefined;
  }

  for (;;) {
    const read = piecesOf({
      ...input,
      at,
    });

    if (read === undefined) {
      return undefined;
    }

    alternatives.push(read.pieces);
    at = read.next + 1;

    if (input.characters[read.next] === '}') {
      return {
        next: at,
        piece: {
          alternatives,
          kind: PieceKind.Either,
        },
      };
    }
  }
};

/** The pieces of a glob, or undefined when its braces do not pair or nest too deep. */
const globPiecesOf = (glob: string): readonly Piece[] | undefined =>
  piecesOf({
    at: 0,
    characters: [
      ...glob,
    ],
    depth: 0,
  })?.pieces;

export type { Piece };
export { globPiecesOf, PieceKind, SEPARATOR };
