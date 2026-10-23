import { Level } from '#/kernel/constants';

import type { ActiveBlock, CatalogueBlock, CatalogueRule, MustRule } from '../../../entities';
import { isActiveRule } from './needs.utils';
import type { Lowering } from './overrides.utils';
import type { ProjectModel, Scope } from './project-model.utils';
import { axisOf, basesOf, isAxisOn, LAYER_FOLDER, nameOf } from './project-model.utils';

const CORE = 'core';

// The MUST rules of the active blocks, core's aside, each with the note of the overrides that lower it.
const mustsOf = (input: {
  lowering: Lowering;
  model: ProjectModel;
  rules: readonly CatalogueRule[];
  scopes: readonly Scope[];
}): readonly MustRule[] =>
  input.rules.flatMap((rule) => {
    const isActive = input.scopes.some((scope) =>
      isActiveRule({
        rule,
        scope,
      }),
    );

    if (rule.level !== Level.Must || rule.block === CORE || !isActive) {
      return [];
    }

    const note = input.lowering.notes.get(rule.slug);

    return [
      {
        block: rule.block,
        rule: note === undefined ? rule.slug : `${rule.slug} (${note})`,
      },
    ];
  });

// What a block needs in a scope: what it requires, its bases, and the blocks its seams name on the
// axes the scope follows.
const neededOf = (input: {
  block: CatalogueBlock;
  model: ProjectModel;
  scope: Scope;
}): readonly string[] => [
  ...input.block.requires,
  ...basesOf({
    id: input.block.id,
    model: input.model,
  }),
  ...input.block.seams
    .filter((seam) =>
      isAxisOn({
        axis: axisOf(seam),
        scope: input.scope,
      }),
    )
    .map(nameOf),
];

// The block and every active block it needs, directly or through others, core aside.
const reachedFrom = (input: {
  from: CatalogueBlock;
  model: ProjectModel;
  scope: Scope;
}): ReadonlySet<string> => {
  const { model, scope } = input;
  const reached = new Set<string>();
  const pending = [
    input.from,
  ];

  for (let block = pending.pop(); block !== undefined; block = pending.pop()) {
    if (!reached.has(block.id)) {
      reached.add(block.id);
      pending.push(
        ...neededOf({
          block,
          model,
          scope,
        }).flatMap((id) => {
          const needed = model.byId.get(id);

          return needed === undefined || id === CORE || !scope.blocks.has(id)
            ? []
            : [
                needed,
              ];
        }),
      );
    }
  }

  return reached;
};

const filesOf = (input: { block: CatalogueBlock; scope: Scope }): readonly string[] => {
  const { block, scope } = input;
  const base = `${block.source === '' ? '' : `${block.source}/`}blocks/${LAYER_FOLDER[block.layer]}/${block.id}/`;

  return [
    `${base}${block.id}.md`,
    ...block.chapters
      .filter((chapter) =>
        isAxisOn({
          axis: axisOf(chapter),
          scope,
        }),
      )
      .map((chapter) => `${base}${chapter}`),
    ...block.seams
      .filter(
        (seam) =>
          isAxisOn({
            axis: axisOf(seam),
            scope,
          }) && scope.blocks.has(nameOf(seam)),
      )
      .map((seam) => `${base}${axisOf(seam)}/with/${nameOf(seam)}.md`),
  ];
};

// A block also governs what every active block that needs it, directly or through others, governs.
const activeOf = (input: {
  model: ProjectModel;
  scopes: readonly Scope[];
}): readonly ActiveBlock[] =>
  input.scopes.flatMap((scope) => {
    const blocks = input.model.blocks.filter(
      (block) => block.id !== CORE && scope.blocks.has(block.id),
    );
    const reach = blocks.map((from) => ({
      from,
      reached: reachedFrom({
        from,
        model: input.model,
        scope,
      }),
    }));

    return blocks.map((block) => ({
      app: scope.app,
      files: filesOf({
        block,
        scope,
      }),
      globs: [
        ...new Set(
          reach.filter(({ reached }) => reached.has(block.id)).flatMap(({ from }) => from.governs),
        ),
      ],
      id: block.id,
      scope: scope.index,
    }));
  });

export { activeOf, mustsOf };
