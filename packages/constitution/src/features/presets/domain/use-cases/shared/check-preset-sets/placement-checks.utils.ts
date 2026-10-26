import { Axis, Layer } from '#/kernel/constants';
import type { BlockModel, ModelBlock, ModelRule } from '#/kernel/entities';
import { BlockModel as Model } from '#/kernel/entities';

import { EVERY } from '../../../constants';
import type { PresetEntry, PresetSet, PresetsProblem } from '../../../entities';
import { PresetsCode } from '../../../entities';
import { CataloguePath } from '../../../value-objects';

interface ModelIndex {
  readonly blocks: ReadonlyMap<string, ModelBlock>;
  readonly reachOf: (reader: string) => ReadonlySet<string>;
  readonly rules: ReadonlyMap<string, ModelRule>;
}

const indexOf = (model: BlockModel): ModelIndex => {
  const blocks = new Map<string, ModelBlock>(
    model.blocks.map((block) => [
      block.id,
      block,
    ]),
  );

  return {
    blocks,
    reachOf: (reader: string): ReadonlySet<string> => {
      const block = blocks.get(reader);

      return block === undefined ? new Set<string>() : Model.reachOf(model, block.id);
    },
    rules: new Map<string, ModelRule>(
      model.rules.map((rule) => [
        rule.slug,
        rule,
      ]),
    ),
  };
};

interface SetProblemsInput {
  readonly index: ModelIndex;
  readonly set: PresetSet;
}

interface EntryProblemsInput {
  readonly entry: PresetEntry;
  readonly index: ModelIndex;
}

const setProblems = (input: SetProblemsInput): readonly PresetsProblem[] => {
  const { path } = input.set;

  return [
    ...(input.index.blocks.has(path.reader)
      ? []
      : [
          {
            code: PresetsCode.UnknownReader,
            details: {
              reader: path.reader,
            },
          } satisfies PresetsProblem,
        ]),
    ...path.withs
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

// The blocks an entry needs beyond its reader's reach, in the order its path names them: the key
// block, then the key rule's seam partner.
const neededOf = (input: {
  entry: PresetEntry;
  reach: ReadonlySet<string>;
  rule: ModelRule | undefined;
}): readonly string[] =>
  [
    input.entry.block,
    ...(input.rule?.seam === undefined
      ? []
      : [
          input.rule.seam,
        ]),
  ].filter((block, at, all) => !input.reach.has(block) && all.indexOf(block) === at);

// A key the reader reaches may lie under any with/ path, which is then its condition.
const isPlaced = (input: { needed: readonly string[]; withs: readonly string[] }): boolean =>
  input.needed.length === 0 ||
  (input.needed.length === input.withs.length &&
    input.needed.every((block, at) => input.withs[at] === block));

const ruleProblems = (input: {
  entry: PresetEntry;
  index: ModelIndex;
  rule: ModelRule;
}): readonly PresetsProblem[] => {
  const { entry, rule } = input;
  const named = {
    block: entry.block,
    rule: entry.rule,
  };

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
    ...(rule.axis === entry.set.path.axis || rule.axis === Axis.Foundation
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

const entryProblems = (input: EntryProblemsInput): readonly PresetsProblem[] => {
  const { entry, index } = input;
  const named = {
    block: entry.block,
    rule: entry.rule,
  };
  // Stryker disable next-line ConditionalExpression: no rule is named "*"
  const rule = entry.rule === EVERY ? undefined : index.rules.get(entry.rule);

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

  if (entry.rule !== EVERY && rule === undefined) {
    return [
      {
        code: PresetsCode.UnknownRule,
        details: named,
      },
    ];
  }

  const needed = neededOf({
    entry,
    reach: index.reachOf(entry.set.path.reader),
    rule,
  });

  return [
    ...(entry.language === EVERY || index.blocks.get(entry.language)?.layer === Layer.Language
      ? []
      : [
          {
            code: PresetsCode.UnknownLanguage,
            details: {
              ...named,
              language: entry.language,
            },
          } satisfies PresetsProblem,
        ]),
    ...(isPlaced({
      needed,
      withs: entry.set.path.withs,
    })
      ? []
      : [
          {
            code: PresetsCode.EntryMisplaced,
            details: {
              ...named,
              belongs: CataloguePath.textOf({
                ...entry.set.path,
                withs: needed,
              }),
            },
          } satisfies PresetsProblem,
        ]),
    ...(rule === undefined
      ? []
      : ruleProblems({
          entry,
          index,
          rule,
        })),
  ];
};

export { entryProblems, indexOf, setProblems };
