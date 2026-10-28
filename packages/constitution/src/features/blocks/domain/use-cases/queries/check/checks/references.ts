import { PATH_SEPARATOR } from '#/kernel/constants';
import { Rule } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { inlineCodeSpans, withoutCodeFences } from '#/kernel/utils';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../entities';
import { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { directoryOf, linkTargetsOf, resolveLink } from '../utils';

enum ReferencesCode {
  LinkIntoOtherBlock = 'link-into-other-block',
  NamesOtherRule = 'names-rule-of-other-block',
  CitesDecision = 'cites-decision',
}

interface ReferencesDetails {
  readonly [ReferencesCode.LinkIntoOtherBlock]: {
    /** the block whose file the link reaches */
    readonly owner: BlockId;
    /** the link's target as written */
    readonly target: string;
  };
  readonly [ReferencesCode.NamesOtherRule]: {
    /** the block of the rule named */
    readonly owner: BlockId;
    readonly slug: RuleSlug;
  };
  readonly [ReferencesCode.CitesDecision]: {
    /** the decision as cited, ADR-<number> */
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

const linkFindings = (input: {
  block: Block;
  blocks: readonly Block[];
  file: BlockFile;
}): readonly ReferencesFinding[] =>
  linkTargetsOf(input.file.body).flatMap((target) => {
    const owner = ownerOf({
      blocks: input.blocks,
      target: resolveLink({
        path: input.file.path,
        target,
      }),
    });

    return owner === undefined || Block.sameAs(owner, input.block)
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

const slugFindings = (input: {
  block: Block;
  file: BlockFile;
  slugs: ReadonlyMap<RuleSlug, Rule>;
}): readonly ReferencesFinding[] => {
  const prose = withoutCodeFences(input.file.body)
    .split('\n')
    .filter((line) => !TABLE_ROW.test(line))
    .join('\n');

  return [
    ...new Set(inlineCodeSpans(prose)),
  ].flatMap((span) => {
    const rule = RuleSlug.is(span) ? input.slugs.get(span) : undefined;

    return rule === undefined || BlockId.equals(rule.block, input.block.id)
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
}: CheckInput): readonly ReferencesFinding[] => {
  const slugs = Rule.bySlug(constitution.rules);

  return constitution.blocks.flatMap((block) =>
    Block.filesOf(block).flatMap((file) => [
      ...linkFindings({
        block,
        blocks: constitution.blocks,
        file,
      }),
      ...slugFindings({
        block,
        file,
        slugs,
      }),
      ...decisionFindings(file),
    ]),
  );
};

export type { ReferencesDetails };
export { ReferencesCode, referencesCheck };
