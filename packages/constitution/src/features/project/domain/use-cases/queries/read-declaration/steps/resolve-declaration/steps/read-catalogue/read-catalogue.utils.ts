import { StatedRule, WarningCode, WarningKind } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';
import { BlockId, Glob } from '#/kernel/value-objects';

import type { BlockCardParser } from '../../../../../../../contracts';
import type { Catalogue, CatalogueSource } from '../../../../../../../entities';
import { CatalogueBlock, CatalogueRule } from '../../../../../../../entities';
import type { WarningLog } from '../../shared/warning-log';
import type { BlockDraft, ReadState } from './catalogue.utils';
import { codeOfSource, readFile } from './catalogue.utils';
import { inCatalogueOrder } from './catalogue-order.utils';

const MARKDOWN = '.md';

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

// Whether the block extends a block, which it may only when that base is abstract.
const checkBase = (input: {
  draft: BlockDraft;
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  log: WarningLog;
}): boolean => {
  const { draft, log } = input;
  const base = draft.card.extends;

  if (base === undefined) {
    return false;
  }

  const baseDraft = draftNamed({
    drafts: input.drafts,
    name: base,
  });

  if (baseDraft === undefined) {
    log.add({
      code: codeOfSource(draft.source),
      details: {
        base,
        block: draft.id,
      },
      kind: WarningKind.BaseNoBlock,
    });

    return false;
  }

  if (!baseDraft.card.isAbstract) {
    log.add({
      code: codeOfSource(draft.source),
      details: {
        base,
        block: draft.id,
      },
      kind: WarningKind.BaseConcrete,
    });
  }

  return true;
};

// The blocks that extend a block, in the order they were read.
const checkLinks = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  log: WarningLog;
}): readonly BlockDraft[] => {
  const { drafts, log } = input;
  const heirs: BlockDraft[] = [];

  for (const draft of drafts.values()) {
    for (const required of draft.card.requires) {
      if (
        draftNamed({
          drafts,
          name: required,
        }) === undefined
      ) {
        log.add({
          code: codeOfSource(draft.source),
          details: {
            block: draft.id,
            required,
          },
          kind: WarningKind.RequiredNoBlock,
        });
      }
    }

    if (
      checkBase({
        draft,
        drafts,
        log,
      })
    ) {
      heirs.push(draft);
    }
  }

  return heirs;
};

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
          code: codeOfSource(draft.source),
          details: {
            rule: rule.slug,
            tightens: rule.tightens,
          },
          kind: WarningKind.TightensUnknownRule,
        });
      }
    }
  }
};

const blockOf = (draft: BlockDraft): CatalogueBlock => {
  const base = draft.card.extends;

  return CatalogueBlock.create({
    chapters: draft.chapters,
    ...(BlockId.is(base)
      ? {
          extends: base,
        }
      : {}),
    governs: draft.card.governs.filter(Glob.is),
    id: draft.id,
    isAbstract: draft.card.isAbstract,
    layer: draft.layer,
    requires: draft.card.requires.filter(BlockId.is),
    seams: draft.seams,
    source: draft.source,
    summary: draft.card.summary,
  });
};

// Reads the blocks of the Constitution, then of each pack in the order constitution.yaml lists
// them; a block read first keeps its id, and a rule read first its slug.
const readCatalogue = (input: {
  log: WarningLog;
  parser: BlockCardParser;
  sources: readonly CatalogueSource[];
}): Catalogue & {
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
  };

  for (const source of input.sources) {
    if (source.files === undefined) {
      input.log.add({
        code: WarningCode.Pack,
        details: {
          where: source.where,
        },
        kind: WarningKind.PackNotInstalled,
      });

      continue;
    }

    for (const file of inCatalogueOrder(
      source.files.filter((listed) => listed.path.endsWith(MARKDOWN)),
    )) {
      readFile({
        source,
        sourceFile: file,
        state,
      });
    }
  }

  const heirs = checkLinks({
    drafts: state.drafts,
    log: input.log,
  });

  checkTightened({
    drafts: state.drafts,
    log: input.log,
    rules: state.rules,
  });

  return {
    ancestors: ancestorsOf({
      drafts: state.drafts,
      heirs,
    }),
    answers: state.answers,
    blocks: [
      ...state.drafts.values(),
    ].map(blockOf),
    rules: StatedRule.inheritLevels(state.rules).map((rule) => CatalogueRule.create(rule)),
  };
};

export { readCatalogue };
