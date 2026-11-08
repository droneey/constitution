import { Layer, PATH_SEPARATOR } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { inlineCodeSpans, withoutCodeFences } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';
import { RuleSlug } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../block/entities';
import { Block } from '../../../../block/entities';
import { BlockGraph } from '../../../../block-graph/entities';
import { directoryOf, linkTargetsOf, resolveLink } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum ReferencesCode {
  LinkIntoOtherBlock = 'link-into-other-block',
  NamesOtherRule = 'names-rule-of-other-block',
  CitesDecision = 'cites-decision',
}

interface ReferencesDetails {
  readonly [ReferencesCode.LinkIntoOtherBlock]: {
    readonly owner: BlockId;
    readonly target: string;
  };
  readonly [ReferencesCode.NamesOtherRule]: {
    readonly owner: BlockId;
    readonly slug: RuleSlug;
  };
  readonly [ReferencesCode.CitesDecision]: {
    readonly decision: string;
  };
}

type ReferencesFinding = FindingOf<ReferencesDetails>;

const TABLE_ROW = /^\s*\|/;
const DECISION = /\bADR-\d{4}\b/g;

const ownerOf = (input: { blocks: readonly Block[]; target: string }): Block | undefined =>
  input.blocks.find((block) => {
    const folder = directoryOf(block.passport.path);

    return input.target === folder || input.target.startsWith(`${folder}${PATH_SEPARATOR}`);
  });

interface Place {
  readonly block: Block;
  readonly file: BlockFile;
  readonly reached: ReadonlySet<BlockId>;
}

const placeOf = (input: { block: Block; file: BlockFile; graph: BlockGraph }): Place => ({
  block: input.block,
  file: input.file,
  reached: BlockGraph.reachableFrom(input.graph, Block.placeOf(input.block, input.file)),
});

const isReached = (input: { owner: BlockId; place: Place; graph: BlockGraph }): boolean =>
  // Stryker disable next-line OptionalChaining: every rule's block and every link's owner is in the graph
  input.graph.get(input.owner)?.layer === Layer.Core || input.place.reached.has(input.owner);

const linkFindings = (
  input: Place & {
    blocks: readonly Block[];
    graph: BlockGraph;
  },
): readonly ReferencesFinding[] =>
  linkTargetsOf(input.file.body).flatMap((target) => {
    const owner = ownerOf({
      blocks: input.blocks,
      target: resolveLink({
        path: input.file.path,
        target,
      }),
    });

    return owner === undefined ||
      isReached({
        graph: input.graph,
        owner: owner.id,
        place: input,
      })
      ? []
      : [
          {
            code: ReferencesCode.LinkIntoOtherBlock,
            details: {
              owner: owner.id,
              target,
            },
            path: input.file.path,
          },
        ];
  });

const slugFindings = (
  input: Place & {
    graph: BlockGraph;
    slugs: ReadonlyMap<RuleSlug, Rule>;
  },
): readonly ReferencesFinding[] => {
  const prose = withoutCodeFences(input.file.body)
    .split('\n')
    .filter((line) => !TABLE_ROW.test(line))
    .join('\n');

  return [
    ...new Set(inlineCodeSpans(prose)),
  ].flatMap((span) => {
    const rule = RuleSlug.is(span) ? input.slugs.get(span) : undefined;

    return rule === undefined ||
      isReached({
        graph: input.graph,
        owner: rule.block,
        place: input,
      })
      ? []
      : [
          {
            code: ReferencesCode.NamesOtherRule,
            details: {
              owner: rule.block,
              slug: rule.slug,
            },
            path: input.file.path,
          },
        ];
  });
};

const decisionFindings = (file: BlockFile): readonly ReferencesFinding[] =>
  [
    ...new Set(withoutCodeFences(file.body).match(DECISION)),
  ].map((decision) => ({
    code: ReferencesCode.CitesDecision,
    details: {
      decision,
    },
    path: file.path,
  }));

const referencesCheck: Check<ReferencesFinding> = ({
  constitution,
  graph,
}: CheckInput): readonly ReferencesFinding[] => {
  const slugs = Rule.bySlug(constitution.rules);

  return constitution.blocks.flatMap((block) =>
    Block.filesOf(block).flatMap((file) => {
      const place = placeOf({
        block,
        file,
        graph,
      });

      return [
        ...linkFindings({
          ...place,
          blocks: constitution.blocks,
          graph,
        }),
        ...slugFindings({
          ...place,
          graph,
          slugs,
        }),
        ...decisionFindings(file),
      ];
    }),
  );
};

export type { ReferencesDetails };
export { ReferencesCode, referencesCheck };
