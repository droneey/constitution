import { Axis, Layer } from '#/kernel/constants';
import type { ModelRule } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';

import { EVERY, MAX_WITHS } from '../../../../constants';
import type { PresetSet, PresetsProblem } from '../../../../entities';
import { PresetEntry, PresetsCode } from '../../../../entities';
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
  /**
   * the blocks of its first definition, whose spelling readers that reach none fall back to: its
   * block and, in a seam, the seam's other block
   */
  readonly definers: readonly BlockId[];
  readonly id: string;
}

// The roles an entry names that some block defines.
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

// The blocks an entry needs beyond its reader's reach, in the order its path names them: the key
// block, the key rule's seam partner, then a block for each definer of the roles these two leave out
// of reach. A definer another such definer reaches is no need of its own: reach is transitive and
// runs through no cycle, so those left reach none of each other. A named block stands in for each
// definer it reaches: of the named blocks that reach one, the first in path order that no other named
// block reaches. So the blocks found, named as a path, are found again there.
const neededOf = (input: {
  entry: PresetEntry;
  model: BlockModel;
  roles: readonly DefinedRole[];
  rule: ModelRule | undefined;
}): readonly BlockId[] => {
  const { entry, model, roles, rule } = input;
  const { reader, withs } = entry.set.placeInPresets;

  const reachOf = (block: BlockId): ReadonlySet<BlockId> => BlockModel.reachOf(model, block);

  const reachesAnother = (block: BlockId, blocks: readonly BlockId[]): boolean =>
    blocks.some((other) => other !== block && reachOf(other).has(block));

  const readerReach = reachOf(reader);
  // A key block may be the partner of its own rule's seam.
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
  const keyedReach = new Set([
    ...readerReach,
    ...keyed.flatMap((block) => [
      ...reachOf(block),
    ]),
  ]);
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
  ].filter((block) => !keyedReach.has(block));
  const widestNamed = withs.filter((block) => !reachesAnother(block, withs));
  const standIns = definers
    .filter((block) => !reachesAnother(block, definers))
    .reduce<readonly BlockId[]>(
      (chosen, definer) =>
        chosen.some((block) => reachOf(block).has(definer))
          ? chosen
          : chosen.concat(widestNamed.find((block) => reachOf(block).has(definer)) ?? definer),
      [],
    );

  return [
    ...keyed.filter((block) => !readerReach.has(block)),
    ...standIns,
  ];
};

// A key the reader reaches may lie under any with/ path, which is then its condition.
const isPlaced = (input: { needed: readonly BlockId[]; withs: readonly BlockId[] }): boolean =>
  input.needed.length === 0 ||
  (input.needed.length === input.withs.length &&
    input.needed.every((block, at) => input.withs[at] === block));

// An entry that needs more blocks than a path names has no place at all. A misplaced one names as
// its reasons the roles its path leaves out of reach and the blocks its path names that it does not
// need.
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
    ...(rule.axis === entry.set.placeInPresets.axis || rule.axis === Axis.Foundation
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

// The problems of an entry whose block is known and whose rule, where it keys one, is the model's.
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
