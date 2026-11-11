import type { Axis, Layer, Level } from '../constants';
import { LAYER_RANK } from '../constants';
import type { Glob, RuleSlug } from '../value-objects';
import { BlockId, coreBlockId } from '../value-objects';
import type { SpelledKind } from './term.entity';
import { Term, TermKind } from './term.entity';

interface ModelBlock {
  readonly governs: readonly Glob[];
  readonly id: BlockId;
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
  readonly statement: string;
  readonly why: string;
}

interface RoleTerm {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly id?: string;
  readonly kind: SpelledKind;
  readonly seam?: BlockId;
  readonly term: string;
}

interface ListTerm {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly id: string;
  readonly members: readonly string[];
  readonly seam?: BlockId;
}

interface BlockText {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly body: string;
  readonly seam?: BlockId;
}

interface BlockModel {
  readonly blocks: readonly ModelBlock[];
  readonly lists: readonly ListTerm[];
  readonly roles: readonly RoleTerm[];
  readonly rules: readonly ModelRule[];
}

interface Defined {
  readonly block: BlockId;
  readonly id?: string;
  readonly seam?: BlockId;
}

interface TextTerm {
  readonly term: Term;
  readonly text: BlockText;
}

const create = (
  input: Omit<BlockModel, 'lists'> & {
    readonly lists?: readonly ListTerm[];
  },
): BlockModel => ({
  blocks: input.blocks,
  lists: input.lists ?? [],
  roles: input.roles,
  rules: input.rules,
});

const termsOf = (texts: readonly BlockText[]): readonly TextTerm[] =>
  texts.flatMap((text) =>
    Term.allIn(text.body).terms.map((term) => ({
      term,
      text,
    })),
  );

const placeOf = (text: BlockText): Pick<RoleTerm, 'axis' | 'block' | 'seam'> => ({
  axis: text.axis,
  block: text.block,
  ...(text.seam === undefined
    ? {}
    : {
        seam: text.seam,
      }),
});

// Why: a file is a role where a block spells it under an id, and a name such as `<entry>` stands
// for the file its language's block spells under the same id.
const roleKindOf = (
  term: Term,
  fileIds: ReadonlySet<string | undefined>,
): SpelledKind | undefined => {
  if (Term.isRoleKind(term.kind)) {
    return term.kind;
  }

  return term.id !== undefined && fileIds.has(term.id) ? TermKind.File : undefined;
};

const rolesIn = (texts: readonly BlockText[]): readonly RoleTerm[] => {
  const read = termsOf(texts);
  const fileIds = new Set(
    read.filter(({ term }) => term.kind === TermKind.File).map(({ term }) => term.id),
  );
  const roles = new Map<string, RoleTerm>();

  for (const { term, text } of read) {
    const kind = roleKindOf(term, fileIds);

    if (kind !== undefined && !roles.has(term.term)) {
      roles.set(term.term, {
        ...placeOf(text),
        ...(term.id === undefined
          ? {}
          : {
              id: term.id,
            }),
        kind,
        term: term.term,
      });
    }
  }

  return [
    ...roles.values(),
  ];
};

const listsIn = (texts: readonly BlockText[]): readonly ListTerm[] =>
  termsOf(texts).flatMap(({ term, text }) =>
    // Stryker disable next-line ConditionalExpression: a term lists its words only where it carries an id, so the test of its id only narrows the type
    term.id === undefined || term.members === undefined
      ? []
      : [
          {
            ...placeOf(text),
            id: term.id,
            members: term.members,
          },
        ],
  );

const linksOf = (block: ModelBlock): readonly BlockId[] =>
  [
    ...block.requires,
    BlockId.parentOf(block.id),
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
      queue.push(...linksOf(block));
    }
  }

  return reached;
};

const definersOf = (role: Defined): readonly BlockId[] =>
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

const reachedOf = <TDefined extends Defined>(
  model: BlockModel,
  input: RoleAsked & {
    defined: readonly TDefined[];
  },
): TDefined | undefined => {
  const reached = new Set(
    model.blocks
      .filter((block) => input.readers.includes(block.id))
      .flatMap((block) => [
        ...reachOf(model, block.id),
      ]),
  );
  // Why: of the few terms of this id the readers reach, the one of the most specific rank wins, the
  // first of one rank as the model lists them; ranking only those spares a pass over every block.
  const places = input.defined.flatMap((role) => {
    if (role.id !== input.id || !definersOf(role).every((definer) => reached.has(definer))) {
      return [];
    }

    return model.blocks
      .filter((block) => block.id === role.block)
      .map((owner) => ({
        rank: LAYER_RANK[owner.layer],
        role,
      }));
  });
  const topRank = Math.max(...places.map(({ rank }) => rank));
  const [specific] = places.filter(({ rank }) => rank === topRank);

  return specific?.role;
};

const reachedRoleOf = (model: BlockModel, input: RoleAsked): RoleTerm | undefined =>
  reachedOf(model, {
    ...input,
    defined: model.roles,
  });

const definitionOf = (model: BlockModel, id: string): RoleTerm | undefined =>
  model.roles.find((role) => role.id === id);

const roleOf = (model: BlockModel, input: RoleAsked): RoleTerm | undefined =>
  reachedRoleOf(model, input) ?? definitionOf(model, input.id);

const listOf = (model: BlockModel, input: RoleAsked): ListTerm | undefined =>
  reachedOf(model, {
    ...input,
    defined: model.lists,
  }) ?? model.lists.find((list) => list.id === input.id);

const blockOf = (model: BlockModel, id: string): ModelBlock | undefined =>
  model.blocks.find((block) => block.id === id);

const BlockModel = {
  blockOf,
  create,
  definersOf,
  definitionOf,
  listOf,
  listsIn,
  reachedRoleOf,
  reachOf,
  roleOf,
  rolesIn,
} as const;

export type { BlockText, ListTerm, ModelBlock, ModelRule, RoleTerm };
export { BlockModel };
