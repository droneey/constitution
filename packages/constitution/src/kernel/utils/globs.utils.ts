import type { Piece } from './glob-pieces.utils';
import { globPiecesOf, PieceKind, SEPARATOR } from './glob-pieces.utils';

// A block's globs, as they match a path from the folder of its unit. A glob comes from a block
// file, a project's own among them, so it is never made a regular expression: it becomes an
// automaton whose states are all walked at once, in time linear in the path's length; a glob whose
// braces do not pair, or nest too deep, matches nothing.

enum NodeKind {
  /** takes one character it accepts, then goes on to next */
  Step = 'step',
  /** goes on to every one of next without taking a character */
  Split = 'split',
  Accept = 'accept',
}

type GlobNode =
  | {
      readonly isAccepted: (character: string) => boolean;
      readonly kind: NodeKind.Step;
      readonly next: number;
    }
  | {
      readonly kind: NodeKind.Split;
      readonly next: readonly number[];
    }
  | {
      readonly kind: NodeKind.Accept;
    };

const isInFolder = (character: string): boolean => character !== SEPARATOR;

const isAny = (): boolean => true;

const isSeparator = (character: string): boolean => character === SEPARATOR;

const PENDING = {
  kind: NodeKind.Accept,
} as const satisfies GlobNode;

const added = (input: { node: GlobNode; nodes: GlobNode[] }): number =>
  input.nodes.push(input.node) - 1;

interface LoopInput {
  readonly isAccepted: (character: string) => boolean;
  readonly next: number;
  readonly nodes: GlobNode[];
}

// Any number of the characters it accepts, then next.
const loopOf = (input: LoopInput): number => {
  const { nodes } = input;
  const loop = added({
    node: PENDING,
    nodes,
  });
  const step = added({
    node: {
      isAccepted: input.isAccepted,
      kind: NodeKind.Step,
      next: loop,
    },
    nodes,
  });

  nodes[loop] = {
    kind: NodeKind.Split,
    next: [
      step,
      input.next,
    ],
  };

  return loop;
};

interface NodeInput {
  readonly next: number;
  readonly nodes: GlobNode[];
}

// No folder, or any characters that end with a separator, then next.
const anyFoldersOf = (input: NodeInput): number => {
  const { nodes } = input;
  const inside = added({
    node: PENDING,
    nodes,
  });
  const any = added({
    node: {
      isAccepted: isAny,
      kind: NodeKind.Step,
      next: inside,
    },
    nodes,
  });
  const separator = added({
    node: {
      isAccepted: isSeparator,
      kind: NodeKind.Step,
      next: input.next,
    },
    nodes,
  });

  nodes[inside] = {
    kind: NodeKind.Split,
    next: [
      any,
      separator,
    ],
  };

  return added({
    node: {
      kind: NodeKind.Split,
      next: [
        inside,
        input.next,
      ],
    },
    nodes,
  });
};

// The first node of the pieces, each built before the one it leads to, so the last leads to next.
const compiled = (
  input: NodeInput & {
    readonly pieces: readonly Piece[];
  },
): number =>
  input.pieces.reduceRight(
    (next, piece) =>
      nodeOf({
        next,
        nodes: input.nodes,
        piece,
      }),
    input.next,
  );

const nodeOf = (
  input: NodeInput & {
    readonly piece: Piece;
  },
): number => {
  const { next, nodes, piece } = input;

  switch (piece.kind) {
    case PieceKind.Literal:
      return added({
        node: {
          isAccepted: (character: string): boolean => character === piece.character,
          kind: NodeKind.Step,
          next,
        },
        nodes,
      });
    case PieceKind.One:
      return added({
        node: {
          isAccepted: isInFolder,
          kind: NodeKind.Step,
          next,
        },
        nodes,
      });
    case PieceKind.InFolder:
      return loopOf({
        isAccepted: isInFolder,
        next,
        nodes,
      });
    case PieceKind.Anything:
      return loopOf({
        isAccepted: isAny,
        next,
        nodes,
      });
    case PieceKind.AnyFolders:
      return anyFoldersOf({
        next,
        nodes,
      });
    case PieceKind.Either:
      return added({
        node: {
          kind: NodeKind.Split,
          next: piece.alternatives.map((pieces) =>
            compiled({
              next,
              nodes,
              pieces,
            }),
          ),
        },
        nodes,
      });
    // Stryker disable next-line ConditionalExpression: no piece reaches the default, which only the compiler reads
    default:
      return piece satisfies never;
  }
};

// The states the given ones reach without taking a character.
const closureOf = (input: {
  nodes: readonly GlobNode[];
  starts: readonly number[];
}): ReadonlySet<number> => {
  const reached = new Set<number>();
  const pending = [
    ...input.starts,
  ];

  for (let index = pending.pop(); index !== undefined; index = pending.pop()) {
    const node = input.nodes[index];

    if (reached.has(index)) {
      continue;
    }

    reached.add(index);

    // Stryker disable next-line OptionalChaining: every index of the automaton names a node
    if (node?.kind === NodeKind.Split) {
      pending.push(...node.next);
    }
  }

  return reached;
};

const matches = (input: { glob: string; path: string }): boolean => {
  const pieces = globPiecesOf(input.glob);

  if (pieces === undefined) {
    return false;
  }

  const nodes: GlobNode[] = [
    // Stryker disable next-line ObjectLiteral: the accepting node is known by its index, never by its kind
    {
      kind: NodeKind.Accept,
    },
  ];
  let states = closureOf({
    nodes,
    starts: [
      compiled({
        next: 0,
        nodes,
        pieces,
      }),
    ],
  });

  for (const character of input.path) {
    states = closureOf({
      nodes,
      starts: [
        ...states,
      ].flatMap((index) => {
        const node = nodes[index];

        // Stryker disable next-line OptionalChaining: every index of the automaton names a node
        return node?.kind === NodeKind.Step && node.isAccepted(character)
          ? [
              node.next,
            ]
          : // Stryker disable next-line ArrayDeclaration: an index of no node reaches no state
            [];
      }),
    });
  }

  return states.has(0);
};

interface GovernedPathInput {
  readonly globs: readonly string[];
  readonly path: string;
}

const isGoverned = (input: GovernedPathInput): boolean =>
  input.globs.some((glob) =>
    matches({
      glob,
      path: input.path,
    }),
  );

export { isGoverned };
