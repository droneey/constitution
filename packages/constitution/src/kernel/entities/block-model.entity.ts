import type { Axis, Layer, Level } from '../constants';
import { LAYER_RANK } from '../constants';
import type { BlockId, Glob, RuleSlug } from '../value-objects';
import { coreBlockId } from '../value-objects';
import type { RoleKind } from './term.entity';
import { Term } from './term.entity';

interface ModelBlock {
  readonly extends?: BlockId;
  /** the files it governs, as its card lists them */
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  /** whether other blocks may extend it, and only they may be listed */
  readonly isAbstract: boolean;
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
  /** the other block of the seam that defines it, which its definition needs as well */
  readonly seam?: BlockId;
  readonly term: string;
}

/** The text of a block's file, its front matter left out. */
interface BlockText {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly body: string;
  /** the other block, where the file is a seam */
  readonly seam?: BlockId;
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

  for (const { axis, block, body, seam } of texts) {
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
          ...(seam === undefined
            ? {}
            : {
                seam,
              }),
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

/** The blocks a role's definition needs: its block and, where a seam defines it, the seam's other block. */
const definersOf = (role: RoleTerm): readonly BlockId[] =>
  role.seam === undefined
    ? [
        role.block,
      ]
    : [
        role.block,
        role.seam,
      ];

interface RoleAsked {
  readonly id: string;
  /** the blocks that read it; one the model does not know reaches nothing */
  readonly readers: readonly BlockId[];
}

/**
 * The term of a role id for readers: of the blocks they reach that define it, the most specific, as a
 * language spells a folder its own way; none where they reach none. A role a seam defines is reached
 * only with the seam's other block.
 */
const reachedRoleOf = (model: BlockModel, input: RoleAsked): RoleTerm | undefined => {
  const reached = new Set(
    model.blocks
      .filter((block) => input.readers.includes(block.id))
      .flatMap((block) => [
        ...reachOf(model, block.id),
      ]),
  );
  const [specific] = model.blocks
    .toSorted((left, right) => LAYER_RANK[right.layer] - LAYER_RANK[left.layer])
    .flatMap((block) =>
      model.roles.filter(
        (role) =>
          role.id === input.id &&
          role.block === block.id &&
          definersOf(role).every((definer) => reached.has(definer)),
      ),
    );

  return specific;
};

/** The first definition of a role id; none where no block gives one. */
const definitionOf = (model: BlockModel, id: string): RoleTerm | undefined =>
  model.roles.find((role) => role.id === id);

/** The term of a role id for readers, as they reach it; the first defined where they reach none. */
const roleOf = (model: BlockModel, input: RoleAsked): RoleTerm | undefined =>
  reachedRoleOf(model, input) ?? definitionOf(model, input.id);

const blockOf = (model: BlockModel, id: string): ModelBlock | undefined =>
  model.blocks.find((block) => block.id === id);

const isExtensible = (model: BlockModel, id: string): boolean =>
  blockOf(model, id)?.isAbstract === true;

const BlockModel = {
  blockOf,
  create,
  definersOf,
  definitionOf,
  isExtensible,
  reachedRoleOf,
  reachOf,
  roleOf,
  rolesIn,
} as const;

export type { BlockText, ModelBlock, ModelRule, RoleTerm };
export { BlockModel };
