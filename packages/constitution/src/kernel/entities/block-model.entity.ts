import type { Axis, Layer, Level } from '../constants';
import type { BlockId, Glob, RuleSlug } from '../value-objects';
import { coreBlockId } from '../value-objects';
import type { RoleKind } from './term.entity';
import { Term } from './term.entity';

interface ModelBlock {
  readonly extends?: BlockId;
  /** the files it governs, as its card lists them */
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  /** the languages an implementation serves, as its card lists them */
  readonly languages: readonly BlockId[];
  readonly layer: Layer;
  readonly requires: readonly BlockId[];
}

interface ModelRule {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly level: Level;
  /** the other block of the seam the rule is written in */
  readonly seam?: BlockId;
  readonly slug: RuleSlug;
}

/** A folder or a suffix a block defines, by the spelling and the id its definition gives. */
interface RoleTerm {
  /** the axis of the file that defines it */
  readonly axis: Axis;
  readonly block: BlockId;
  /** none where the definition gives none, which the blocks' check refuses */
  readonly id?: string;
  readonly kind: RoleKind;
  readonly term: string;
}

/** The text of a block's file, its front matter left out. */
interface BlockText {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly body: string;
}

/** The blocks of a release and its packs, their rules at every level and their role terms. */
interface BlockModel {
  readonly blocks: readonly ModelBlock[];
  readonly roles: readonly RoleTerm[];
  readonly rules: readonly ModelRule[];
}

const create = (input: BlockModel): BlockModel => ({
  blocks: input.blocks,
  roles: input.roles,
  rules: input.rules,
});

/** The folders and suffixes block files define; a spelling defined twice keeps its first. */
const rolesIn = (texts: readonly BlockText[]): readonly RoleTerm[] => {
  const roles = new Map<string, RoleTerm>();

  for (const { axis, block, body } of texts) {
    for (const { id, kind, term } of Term.allIn(body).terms) {
      if (Term.isRoleKind(kind) && !roles.has(term)) {
        roles.set(term, {
          axis,
          block,
          ...(id === undefined
            ? {}
            : {
                id,
              }),
          kind,
          term,
        });
      }
    }
  }

  return [
    ...roles.values(),
  ];
};

const linksOf = (block: ModelBlock): readonly BlockId[] =>
  [
    block.extends,
    ...block.requires,
  ].filter((link) => link !== undefined);

/**
 * The blocks a reader reaches: itself, the blocks it extends and requires and theirs in turn, and
 * core; only blocks of the model, none for a reader that is none.
 */
const reachOf = (model: BlockModel, reader: BlockId): ReadonlySet<BlockId> => {
  const byId = new Map(
    model.blocks.map((block) => [
      block.id,
      block,
    ]),
  );
  const reached = new Set<BlockId>();

  if (!byId.has(reader)) {
    return reached;
  }

  const queue = [
    reader,
    coreBlockId,
  ];

  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    const block = byId.get(next);

    if (block !== undefined && !reached.has(next)) {
      reached.add(next);
      queue.push(...linksOf(block));
    }
  }

  return reached;
};

const BlockModel = {
  create,
  reachOf,
  rolesIn,
} as const;

export type { BlockText, ModelBlock, ModelRule, RoleTerm };
export { BlockModel };
