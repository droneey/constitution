import { Layer, MARKDOWN_EXTENSION } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { stemOf } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../../domain/entities';
import { BlockFile, BlockFileRole, BlockGraph, pairableBy } from '../../../../../domain/entities';
import type { Check, CheckInput } from '../check.types';
import { findingsAt } from '../utils';

enum SeamsCode {
  NamedAfterOwnBlock = 'seam-named-after-own-block',
  BlockPairsWithNone = 'seam-of-unpairing-block',
  NotPair = 'seam-names-no-pair',
  OutOfLayer = 'seam-out-of-layer',
  AlongDependency = 'seam-along-a-dependency',
  TitleMismatch = 'seam-title-mismatch',
  ChapterNamedAfterBlock = 'chapter-named-after-block',
}

interface SeamsDetails {
  readonly [SeamsCode.NamedAfterOwnBlock]: object;
  readonly [SeamsCode.BlockPairsWithNone]: {
    readonly block: BlockId;
  };
  readonly [SeamsCode.NotPair]: {
    readonly other: BlockId;
  };
  readonly [SeamsCode.OutOfLayer]: {
    readonly allowed: readonly Layer[];
    readonly layer: Layer;
    readonly other: BlockId;
    readonly otherLayer: Layer;
  };
  readonly [SeamsCode.AlongDependency]: {
    readonly block: BlockId;
    readonly other: BlockId;
  };
  readonly [SeamsCode.TitleMismatch]: object;
  readonly [SeamsCode.ChapterNamedAfterBlock]: {
    readonly block: BlockId;
  };
}

type SeamsFinding = FindingOf<SeamsDetails>;

type SeamsProblem = ProblemOf<SeamsDetails>;

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
}

const TITLE = '# ';

const titleOf = (body: string): string | undefined =>
  body.split('\n').find((line) => line.startsWith(TITLE));

enum PairingKind {
  Paired = 'paired',
  Refused = 'refused',
}

type Pairing =
  | {
      readonly kind: PairingKind.Paired;
      readonly other: Block;
    }
  | {
      readonly kind: PairingKind.Refused;
      readonly problem: SeamsProblem;
    };

const refused = (problem: SeamsProblem): Pairing => ({
  kind: PairingKind.Refused,
  problem,
});

const pairingOf = (
  input: Subject & {
    other: BlockId;
  },
): Pairing => {
  const target = input.graph.get(input.other);
  const allowed = pairableBy(input.block.layer);

  if (BlockId.equals(input.other, input.block.id)) {
    return refused({
      code: SeamsCode.NamedAfterOwnBlock,
      details: {},
    });
  }

  if (allowed.length === 0) {
    return refused({
      code: SeamsCode.BlockPairsWithNone,
      details: {
        block: input.block.id,
      },
    });
  }

  if (target === undefined || target.layer === Layer.Core) {
    return refused({
      code: SeamsCode.NotPair,
      details: {
        other: input.other,
      },
    });
  }

  if (!allowed.includes(target.layer)) {
    return refused({
      code: SeamsCode.OutOfLayer,
      details: {
        allowed,
        layer: input.block.layer,
        other: input.other,
        otherLayer: target.layer,
      },
    });
  }

  const linked =
    BlockGraph.closureOf(input.graph, input.block.id).has(input.other) ||
    BlockGraph.closureOf(input.graph, input.other).has(input.block.id);

  return linked
    ? refused({
        code: SeamsCode.AlongDependency,
        details: {
          block: input.block.id,
          other: input.other,
        },
      })
    : {
        kind: PairingKind.Paired,
        other: target,
      };
};

const titleProblem = (input: { file: BlockFile; other: Block }): SeamsProblem | undefined =>
  titleOf(input.file.body) === titleOf(input.other.passport.body)
    ? undefined
    : {
        code: SeamsCode.TitleMismatch,
        details: {},
      };

const seamFindings = (subject: Subject): readonly SeamsFinding[] =>
  subject.block.parts.flatMap((file) => {
    const other = BlockFile.seamOf(file);

    if (other === undefined) {
      return [];
    }

    const pairing = pairingOf({
      ...subject,
      other,
    });
    const problem =
      pairing.kind === PairingKind.Refused
        ? pairing.problem
        : titleProblem({
            file,
            other: pairing.other,
          });

    return findingsAt(file.path, [
      problem,
    ]);
  });

const chapterFindings = (subject: Subject): readonly SeamsFinding[] =>
  subject.block.parts
    .filter((file) => file.role === BlockFileRole.Chapter)
    .flatMap((file) => {
      const name = stemOf({
        extension: MARKDOWN_EXTENSION,
        path: file.path,
      });

      const block = BlockGraph.named(subject.graph, name);

      return block === undefined
        ? []
        : [
            {
              code: SeamsCode.ChapterNamedAfterBlock,
              details: {
                block: block.id,
              },
              path: file.path,
            },
          ];
    });

const seamsCheck: Check<SeamsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly SeamsFinding[] =>
  constitution.blocks.flatMap((block) => [
    ...seamFindings({
      block,
      graph,
    }),
    ...chapterFindings({
      block,
      graph,
    }),
  ]);

export type { SeamsDetails };
export { SeamsCode, seamsCheck };
