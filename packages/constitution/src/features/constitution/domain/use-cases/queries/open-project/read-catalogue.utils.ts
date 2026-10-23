import type { FrontMatterParser } from '../../../contracts';
import type { Catalogue, CatalogueBlock, CatalogueRule, StatedRule } from '../../../entities';
import { WarningCode } from '../../../entities';
import { resolveRules } from '../load-constitution';
import type { BlockDraft, CatalogueSource, ReadState } from './catalogue.utils';
import { readFile } from './catalogue.utils';
import { inCatalogueOrder } from './catalogue-order.utils';
import type { WarningLog } from './warning-log.utils';

const MARKDOWN = '.md';

// A problem in the Constitution's own files, which its release checks, or in a pack's.
const warnFor = (input: { log: WarningLog; message: string; source: string | undefined }): void => {
  input.log.add({
    code: input.source === '' ? WarningCode.Constitution : WarningCode.Pack,
    message: input.message,
  });
};

// A base's own bases follow it, nearest first; a cycle of bases stops where it closes.
const ancestorsOf = (input: {
  drafts: ReadonlyMap<string, BlockDraft>;
  heirs: readonly string[];
}): ReadonlyMap<string, readonly string[]> => {
  const ancestors = new Map<string, readonly string[]>();
  const visiting = new Set<string>();
  const of = (id: string): readonly string[] => {
    if (visiting.has(id)) {
      return ancestors.get(id) ?? [];
    }

    visiting.add(id);

    const base = input.drafts.get(id)?.card.extends;
    const found =
      base === undefined
        ? []
        : [
            base,
            ...of(base),
          ];

    ancestors.set(id, found);

    return found;
  };

  for (const id of input.heirs) {
    of(id);
  }

  return ancestors;
};

// Whether the block extends a block, which it may only when that base is abstract.
const checkBase = (input: {
  draft: BlockDraft;
  drafts: ReadonlyMap<string, BlockDraft>;
  log: WarningLog;
}): boolean => {
  const { draft, log } = input;
  const base = draft.card.extends;

  if (base === undefined) {
    return false;
  }

  const baseDraft = input.drafts.get(base);

  if (baseDraft === undefined) {
    warnFor({
      log,
      message: `${draft.id} extends ${base}, which is not a block — fix its front matter`,
      source: draft.source,
    });

    return false;
  }

  if (!baseDraft.card.isAbstract) {
    warnFor({
      log,
      message: `${draft.id} extends ${base}, a concrete block; a block extends only an abstract base — require it instead`,
      source: draft.source,
    });
  }

  return true;
};

// The blocks that extend a block, in the order they were read.
const checkLinks = (input: {
  drafts: ReadonlyMap<string, BlockDraft>;
  log: WarningLog;
}): readonly string[] => {
  const { drafts, log } = input;
  const heirs: string[] = [];

  for (const draft of drafts.values()) {
    for (const required of draft.card.requires) {
      if (!drafts.has(required)) {
        warnFor({
          log,
          message: `${draft.id} requires ${required}, which is not a block — fix its front matter`,
          source: draft.source,
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
      heirs.push(draft.id);
    }
  }

  return heirs;
};

const checkParents = (input: {
  drafts: ReadonlyMap<string, BlockDraft>;
  log: WarningLog;
  rules: readonly StatedRule[];
}): void => {
  const slugs = new Set(input.rules.map((rule) => rule.slug));
  const sources = new Map(
    [
      ...input.drafts.values(),
    ].map((draft) => [
      draft.id,
      draft.source,
    ]),
  );

  for (const rule of input.rules) {
    if (rule.parent !== undefined && !slugs.has(rule.parent)) {
      warnFor({
        log: input.log,
        message: `${rule.slug} → ${rule.parent}: ${rule.parent} is an unknown rule — check the slug`,
        source: sources.get(rule.block),
      });
    }
  }
};

const blockOf = (draft: BlockDraft): CatalogueBlock => ({
  chapters: draft.chapters,
  ...(draft.card.extends === undefined
    ? {}
    : {
        extends: draft.card.extends,
      }),
  governs: draft.card.governs,
  id: draft.id,
  isAbstract: draft.card.isAbstract,
  layer: draft.layer,
  requires: draft.card.requires,
  seams: draft.seams,
  source: draft.source,
  summary: draft.card.summary,
});

const ruleOf = (
  rule: StatedRule & {
    level: CatalogueRule['level'];
  },
): CatalogueRule => ({
  axis: rule.axis,
  block: rule.block,
  isLevelStated: rule.statedLevel !== undefined,
  level: rule.level,
  ...(rule.parent === undefined
    ? {}
    : {
        parent: rule.parent,
      }),
  slug: rule.slug,
  ...(rule.with === undefined
    ? {}
    : {
        with: rule.with,
      }),
});

// Reads the blocks of the Constitution, then of each pack in the order constitution.yaml lists
// them; a block read first keeps its id, and a rule read first its slug.
const readCatalogue = (input: {
  log: WarningLog;
  parser: FrontMatterParser;
  sources: readonly CatalogueSource[];
}): Catalogue & {
  ancestors: ReadonlyMap<string, readonly string[]>;
} => {
  const state: ReadState = {
    answers: [],
    drafts: new Map(),
    log: input.log,
    parser: input.parser,
    rules: [],
    skipped: new Set(),
    slugs: new Set(),
  };

  for (const source of input.sources) {
    if (source.files === undefined) {
      input.log.add({
        code: WarningCode.Pack,
        message: `${source.source} is not installed — run mise install, or check the path`,
      });
      continue;
    }

    for (const file of inCatalogueOrder(
      source.files.filter((listed) => listed.path.endsWith(MARKDOWN)),
    )) {
      readFile({
        file,
        source,
        state,
      });
    }
  }

  const heirs = checkLinks({
    drafts: state.drafts,
    log: input.log,
  });
  checkParents({
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
    rules: resolveRules(state.rules).map(ruleOf),
  };
};

export { readCatalogue };
