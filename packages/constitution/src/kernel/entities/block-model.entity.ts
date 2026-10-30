import type { Axis, Layer, Level } from '../constants';
import { LAYER_RANK } from '../constants';
import type { BlockId, Glob, RuleSlug } from '../value-objects';
import { coreBlockId } from '../value-objects';
import type { RoleKind } from './term.entity';
import { Term } from './term.entity';

interface ModelBlock {
  readonly extends?: BlockId;
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly isAbstract: boolean;
  readonly languages: readonly BlockId[];
  readonly layer: Layer;
  readonly requires: readonly BlockId[];
}

interface ModelRule {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly level: Level;
  readonly seam?: BlockId;
  readonly slug: RuleSlug;
}

interface RoleTerm {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly id?: string;
  readonly kind: RoleKind;
  readonly seam?: BlockId;
  readonly term: string;
}

interface BlockText {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly body: string;
  readonly seam?: BlockId;
}

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

const extendedAndRequiredOf = (block: ModelBlock): readonly BlockId[] =>
  [
    block.extends,
    ...block.requires,
  ].filter((link) => link !== undefined);

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
      queue.push(...extendedAndRequiredOf(block));
    }
  }

  return reached;
};

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
  readonly readers: readonly BlockId[];
}

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

const definitionOf = (model: BlockModel, id: string): RoleTerm | undefined =>
  model.roles.find((role) => role.id === id);

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
