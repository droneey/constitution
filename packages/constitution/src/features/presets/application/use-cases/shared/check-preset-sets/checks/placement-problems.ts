import { Layer } from '#/kernel/constants';
import type { ModelRule } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';
import { isDeepEqual } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import { EVERY, MAX_WITHS } from '../../../../../domain/constants';
import type { PresetSet, PresetsProblem } from '../../../../../domain/entities';
import { PresetEntry, PresetsCode } from '../../../../../domain/entities';
import type { ModelIndex } from './model-index';

interface SetProblemsInput {
  readonly index: ModelIndex;
  readonly set: PresetSet;
}

interface EntryProblemsInput {
  readonly entry: PresetEntry;
  readonly index: ModelIndex;
  readonly model: BlockModel;
}

const setProblems = (input: SetProblemsInput): readonly PresetsProblem[] => {
  const { placeInPresets } = input.set;

  return [
    ...(input.index.blocks.has(placeInPresets.reader)
      ? []
      : [
          {
            code: PresetsCode.UnknownReader,
            details: {
              reader: placeInPresets.reader,
            },
          } satisfies PresetsProblem,
        ]),
    ...placeInPresets.withs
      .filter((block) => !input.index.blocks.has(block))
      .map(
        (block) =>
          ({
            code: PresetsCode.UnknownBlock,
            details: {
              block,
            },
          }) satisfies PresetsProblem,
      ),
  ];
};

interface DefinedRole {
  readonly definers: readonly BlockId[];
  readonly id: string;
}

const definedRolesOf = (input: { entry: PresetEntry; model: BlockModel }): readonly DefinedRole[] =>
  PresetEntry.roleIdsOf(input.entry).flatMap((id) => {
    const definition = BlockModel.definitionOf(input.model, id);

    return definition === undefined
      ? []
      : [
          {
            definers: BlockModel.definersOf(definition),
            id,
          },
        ];
  });

const isReached = (input: {
  id: string;
  model: BlockModel;
  readers: readonly BlockId[];
}): boolean =>
  BlockModel.reachedRoleOf(input.model, {
    id: input.id,
    readers: input.readers,
  }) !== undefined;

const reachesAnother = (input: {
  block: BlockId;
  blocks: readonly BlockId[];
  model: BlockModel;
}): boolean =>
  input.blocks.some(
    (other) => other !== input.block && BlockModel.reachOf(input.model, other).has(input.block),
  );

// Why: reach is transitive and runs through no cycle, so the blocks kept reach none of each other,
// whatever order they are filtered in.
const widestOf = (input: { blocks: readonly BlockId[]; model: BlockModel }): readonly BlockId[] =>
  input.blocks.filter(
    (block) =>
      !reachesAnother({
        ...input,
        block,
      }),
  );

const withStandIns = (input: {
  blocks: readonly BlockId[];
  model: BlockModel;
  withs: readonly BlockId[];
}): readonly BlockId[] => {
  const { blocks, model, withs } = input;

  const reachOf = (block: BlockId): ReadonlySet<BlockId> => BlockModel.reachOf(model, block);

  const widestNamed = widestOf({
    blocks: withs,
    model,
  });

  return widestOf({
    blocks,
    model,
  }).reduce<readonly BlockId[]>(
    (chosen, block) =>
      chosen.some((standIn) => reachOf(standIn).has(block))
        ? chosen
        : chosen.concat(widestNamed.find((named) => reachOf(named).has(block)) ?? block),
    [],
  );
};

const neededOf = (input: {
  entry: PresetEntry;
  model: BlockModel;
  roles: readonly DefinedRole[];
  rule: ModelRule | undefined;
}): readonly BlockId[] => {
  const { entry, model, roles, rule } = input;
  const { reader, withs } = entry.set.placeInPresets;
  const readerReach = BlockModel.reachOf(model, reader);
  const keyed = [
    ...new Set([
      entry.block,
      ...(rule?.seam === undefined
        ? []
        : [
            rule.seam,
          ]),
    ]),
  ];
  const definers = [
    ...new Set(
      roles
        .filter(
          ({ id }) =>
            !isReached({
              id,
              model,
              readers: [
                reader,
                ...keyed,
              ],
            }),
        )
        .flatMap(({ definers: blocks }) => blocks),
    ),
  ].filter((block) => !readerReach.has(block));

  return withStandIns({
    blocks: [
      ...keyed.filter((block) => !readerReach.has(block)),
      ...definers,
    ],
    model,
    withs,
  });
};

const isPlaced = (input: { needed: readonly BlockId[]; withs: readonly BlockId[] }): boolean =>
  // Why: an entry its reader alone places may sit under any with/ path, which only conditions it.
  input.needed.length === 0 || isDeepEqual(input.needed, input.withs);

const placementProblems = (input: {
  entry: PresetEntry;
  model: BlockModel;
  needed: readonly BlockId[];
  roles: readonly DefinedRole[];
}): readonly PresetsProblem[] => {
  const { entry, model, needed } = input;
  const { reader, withs } = entry.set.placeInPresets;

  if (needed.length > MAX_WITHS) {
    return [
      {
        code: PresetsCode.EntryNeedsTooManyBlocks,
        details: {
          ...PresetEntry.namedOf(entry),
          needed,
        },
      },
    ];
  }

  return isPlaced({
    needed,
    withs,
  })
    ? []
    : [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            ...PresetEntry.namedOf(entry),
            belongs: {
              ...entry.set.placeInPresets,
              withs: needed,
            },
            unneededBlocks: withs.filter((block) => !needed.includes(block)),
            unreachedRoles: input.roles
              .filter(
                ({ id }) =>
                  !isReached({
                    id,
                    model,
                    readers: [
                      reader,
                      entry.block,
                      ...withs,
                    ],
                  }),
              )
              .map(({ definers, id }) => ({
                definers,
                role: id,
              })),
          },
        },
      ];
};

const ruleProblems = (input: {
  entry: PresetEntry;
  rule: ModelRule;
}): readonly PresetsProblem[] => {
  const { entry, rule } = input;
  const named = PresetEntry.namedOf(entry);

  return [
    ...(rule.block === entry.block
      ? []
      : [
          {
            code: PresetsCode.RuleOfAnotherBlock,
            details: {
              ...named,
              owner: rule.block,
            },
          } satisfies PresetsProblem,
        ]),
    ...(rule.axis === entry.set.placeInPresets.axis
      ? []
      : [
          {
            code: PresetsCode.EntryOffItsAxis,
            details: {
              ...named,
              ruleAxis: rule.axis,
            },
          } satisfies PresetsProblem,
        ]),
  ];
};

const keyedProblems = (
  input: EntryProblemsInput & {
    rule: ModelRule | undefined;
  },
): readonly PresetsProblem[] => {
  const { entry, index, model, rule } = input;
  const roles = definedRolesOf({
    entry,
    model,
  });
  const needed = neededOf({
    entry,
    model,
    roles,
    rule,
  });

  return [
    ...(entry.language === EVERY || index.blocks.get(entry.language)?.layer === Layer.Language
      ? []
      : [
          {
            code: PresetsCode.UnknownLanguage,
            details: {
              ...PresetEntry.namedOf(entry),
              language: entry.language,
            },
          } satisfies PresetsProblem,
        ]),
    ...placementProblems({
      entry,
      model,
      needed,
      roles,
    }),
    ...(rule === undefined
      ? []
      : ruleProblems({
          entry,
          rule,
        })),
  ];
};

const entryProblems = (input: EntryProblemsInput): readonly PresetsProblem[] => {
  const { entry, index } = input;

  if (!index.blocks.has(entry.block)) {
    return [
      {
        code: PresetsCode.UnknownBlock,
        details: {
          block: entry.block,
        },
      },
    ];
  }

  if (entry.rule === EVERY) {
    return keyedProblems({
      ...input,
      rule: undefined,
    });
  }

  const rule = index.rules.get(entry.rule);

  return rule === undefined
    ? [
        {
          code: PresetsCode.UnknownRule,
          details: PresetEntry.namedOf(entry),
        },
      ]
    : keyedProblems({
        ...input,
        rule,
      });
};

export { entryProblems, setProblems };
