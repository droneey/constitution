import { MARKDOWN_EXTENSION } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { BlockModel, StatedRule, WarningKind } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId, Glob } from '#/kernel/value-objects';

import type { BlockCardParser } from '../../../../../../../contracts';
import type { BlockSet, BlockSetSource } from '../../../../../../../entities';
import { BlockSetBlock, BlockSetRule } from '../../../../../../../entities';
import type { WarningLog } from '../../shared/warning-log';
import type { BlockDraft, ReadState } from './block-set.utils';
import { readFile } from './block-set.utils';
import { inBlockSetOrder } from './block-set-order.utils';

const draftNamed = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  name: string | undefined;
}): BlockDraft | undefined => (BlockId.is(input.name) ? input.drafts.get(input.name) : undefined);

// A base's own bases follow it, nearest first, as far as each is a block; a cycle of bases stops
// where it closes.
const ancestorsOf = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  heirs: readonly BlockDraft[];
}): ReadonlyMap<BlockId, readonly BlockId[]> => {
  const ancestors = new Map<BlockId, readonly BlockId[]>();
  const visiting = new Set<BlockId>();

  const of = (draft: BlockDraft): readonly BlockId[] => {
    if (visiting.has(draft.id)) {
      return ancestors.get(draft.id) ?? [];
    }

    visiting.add(draft.id);

    const base = draftNamed({
      drafts: input.drafts,
      name: draft.card.extends,
    });
    const found =
      base === undefined
        ? []
        : [
            base.id,
            ...of(base),
          ];

    ancestors.set(draft.id, found);

    return found;
  };

  for (const heir of input.heirs) {
    of(heir);
  }

  return ancestors;
};

// A block may extend only a block, and only an abstract one.
const baseWarningsOf = (input: {
  draft: BlockDraft;
  drafts: ReadonlyMap<BlockId, BlockDraft>;
}): readonly ProjectWarning[] => {
  const { draft } = input;
  const base = draft.card.extends;

  if (base === undefined) {
    return [];
  }

  const baseDraft = draftNamed({
    drafts: input.drafts,
    name: base,
  });
  const details = {
    base,
    block: draft.id,
    source: draft.source.kind,
  };

  if (baseDraft === undefined) {
    return [
      {
        details,
        kind: WarningKind.BaseNoBlock,
      },
    ];
  }

  return baseDraft.card.isAbstract
    ? []
    : [
        {
          details,
          kind: WarningKind.BaseConcrete,
        },
      ];
};

// What a block requires and extends must be blocks.
const linkWarningsOf = (drafts: ReadonlyMap<BlockId, BlockDraft>): readonly ProjectWarning[] =>
  [
    ...drafts.values(),
  ].flatMap((draft) => [
    ...draft.card.requires
      .filter(
        (required) =>
          draftNamed({
            drafts,
            name: required,
          }) === undefined,
      )
      .map(
        (required): ProjectWarning => ({
          details: {
            block: draft.id,
            required,
            source: draft.source.kind,
          },
          kind: WarningKind.RequiredNoBlock,
        }),
      ),
    ...baseWarningsOf({
      draft,
      drafts,
    }),
  ]);

// The blocks that extend a block, in the order they were read.
const heirsOf = (drafts: ReadonlyMap<BlockId, BlockDraft>): readonly BlockDraft[] =>
  [
    ...drafts.values(),
  ].filter(
    (draft) =>
      draftNamed({
        drafts,
        name: draft.card.extends,
      }) !== undefined,
  );

// A rule that tightens a slug no rule has.
const checkTightened = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  log: WarningLog;
  rules: readonly StatedRule[];
}): void => {
  const slugs = new Set<RuleSlug>(input.rules.map((rule) => rule.slug));

  for (const draft of input.drafts.values()) {
    for (const rule of input.rules.filter((stated) => BlockId.equals(stated.block, draft.id))) {
      if (rule.tightens !== undefined && !slugs.has(rule.tightens)) {
        input.log.add({
          details: {
            rule: rule.slug,
            source: draft.source.kind,
            tightens: rule.tightens,
          },
          kind: WarningKind.TightensUnknownRule,
        });
      }
    }
  }
};

const blockOf = (draft: BlockDraft): BlockSetBlock => {
  const base = draft.card.extends;

  return BlockSetBlock.create({
    chapters: draft.chapters,
    ...(BlockId.is(base)
      ? {
          extends: base,
        }
      : {}),
    governs: draft.card.governs.filter(Glob.is),
    id: draft.id,
    isAbstract: draft.card.isAbstract,
    languages: draft.card.languages.filter(BlockId.is),
    layer: draft.layer,
    requires: draft.card.requires.filter(BlockId.is),
    seams: draft.seams,
    source: draft.source,
    // Stryker disable next-line ConditionalExpression: create leaves an absent summary out
    ...(draft.card.summary === undefined
      ? {}
      : {
          summary: draft.card.summary,
        }),
  });
};

interface ReadBlockSetInput {
  readonly log: WarningLog;
  readonly parser: BlockCardParser;
  readonly sources: readonly BlockSetSource[];
}

// Reads the blocks of the Constitution, then of each pack in the order constitution.yaml lists
// them; a block read first keeps its id, and a rule read first its slug.
const readBlockSet = (
  input: ReadBlockSetInput,
): BlockSet & {
  readonly ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
} => {
  const state: ReadState = {
    answers: [],
    drafts: new Map(),
    log: input.log,
    parser: input.parser,
    rules: [],
    // Stryker disable next-line ArrayDeclaration: an entry with no id matches no block
    skipped: [],
    slugs: new Set(),
    texts: [],
  };

  for (const source of input.sources) {
    if (source.files === undefined) {
      input.log.add({
        details: {
          where: source.where,
        },
        kind: WarningKind.PackNotInstalled,
      });

      continue;
    }

    for (const file of inBlockSetOrder(
      source.files.filter((listed) => listed.path.endsWith(MARKDOWN_EXTENSION)),
    )) {
      readFile({
        source,
        sourceFile: file,
        state,
      });
    }
  }

  for (const warning of linkWarningsOf(state.drafts)) {
    input.log.add(warning);
  }

  checkTightened({
    drafts: state.drafts,
    log: input.log,
    rules: state.rules,
  });

  return {
    ancestors: ancestorsOf({
      drafts: state.drafts,
      heirs: heirsOf(state.drafts),
    }),
    answers: state.answers,
    blocks: [
      ...state.drafts.values(),
    ].map(blockOf),
    roles: BlockModel.rolesIn(state.texts),
    rules: StatedRule.inheritLevels(state.rules).map((rule) => BlockSetRule.create(rule)),
  };
};

export { readBlockSet };
