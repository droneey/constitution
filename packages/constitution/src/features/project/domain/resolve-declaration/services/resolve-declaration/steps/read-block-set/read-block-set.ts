import type { Layer } from '#/kernel/constants';
import { BlockFormat } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { BlockModel, Rule, StatedRule, WarningKind } from '#/kernel/entities';
import { firstBy } from '#/kernel/utils';
import type { BlockSource, RuleSlug } from '#/kernel/value-objects';
import { BlockId, Glob } from '#/kernel/value-objects';

import type {
  BlockCard,
  BlockCards,
  BlockSet,
  BlockSetBlock,
  BlockSetRule,
  BlockSetSource,
  ChapterPlace,
  SeamPlace,
} from '../../../../../block-set/entities';
import { EMPTY_CARD, SourceStatus } from '../../../../../block-set/entities';
import type { FileInFolder, KeptFile, PassedFile } from './steps/place-files';
import { FileFate, placeFiles } from './steps/place-files';
import type { BlockFileRead } from './steps/read-block-file';
import { PartKind, readBlockFile } from './steps/read-block-file';

interface BlockDraft {
  readonly card: BlockCard;
  readonly chapters: readonly ChapterPlace[];
  readonly format: BlockFormat;
  readonly id: BlockId;
  readonly layer: Layer;
  readonly seams: readonly SeamPlace[];
  readonly source: BlockSource;
}

type FileReading = KeptFile & {
  readonly read: BlockFileRead;
};

const draftOf = (input: { first: FileInFolder; own: readonly FileReading[] }): BlockDraft => {
  const reads = input.own.map((reading) => reading.read);

  return {
    // Stryker disable next-line ConditionalExpression: a passport reads first in its folder, and any other part holds no card, so the first part gives the same
    card: reads.find((read) => read.part === PartKind.Card)?.card ?? EMPTY_CARD,
    chapters: reads.flatMap((read) =>
      read.part === PartKind.Chapter
        ? [
            read.chapter,
          ]
        : [],
    ),
    format: input.first.format,
    id: input.first.block,
    layer: input.first.layer,
    seams: reads.flatMap((read) =>
      read.part === PartKind.Seam
        ? [
            read.seam,
          ]
        : [],
    ),
    source: input.first.source,
  };
};

const draftsOf = (readings: readonly FileReading[]): ReadonlyMap<BlockId, BlockDraft> =>
  new Map(
    [
      ...Map.groupBy(readings, (reading) => reading.first),
    ].map(([first, own]) => [
      first.block,
      draftOf({
        first,
        own,
      }),
    ]),
  );

const repeatedWarningsOf = (input: {
  firsts: ReadonlyMap<RuleSlug, StatedRule>;
  reading: FileReading;
}): readonly ProjectWarning[] =>
  input.reading.read.rules
    .filter((rule) => input.firsts.get(rule.slug) !== rule)
    .map((rule) => ({
      details: {
        ...input.reading.file.named,
        rule: rule.slug,
      },
      kind: WarningKind.RuleRepeated,
    }));

const draftNamed = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  name: string | undefined;
}): BlockDraft | undefined => (BlockId.is(input.name) ? input.drafts.get(input.name) : undefined);

const folderParentOf = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  id: BlockId;
}): BlockDraft | undefined => {
  const above = BlockId.parentOf(input.id);

  if (above === undefined) {
    return undefined;
  }

  return (
    input.drafts.get(above) ??
    folderParentOf({
      drafts: input.drafts,
      id: above,
    })
  );
};

const parentOf = (input: {
  draft: BlockDraft;
  drafts: ReadonlyMap<BlockId, BlockDraft>;
}): BlockDraft | undefined =>
  input.draft.format === BlockFormat.Legacy
    ? draftNamed({
        drafts: input.drafts,
        name: input.draft.card.extends,
      })
    : folderParentOf({
        drafts: input.drafts,
        id: input.draft.id,
      });

const ancestorsOf = (
  drafts: ReadonlyMap<BlockId, BlockDraft>,
): ReadonlyMap<BlockId, readonly BlockId[]> => {
  const ancestors = new Map<BlockId, readonly BlockId[]>();
  const visiting = new Set<BlockId>();

  const of = (draft: BlockDraft): readonly BlockId[] => {
    if (visiting.has(draft.id)) {
      return ancestors.get(draft.id) ?? [];
    }

    visiting.add(draft.id);

    const parent = parentOf({
      draft,
      drafts,
    });
    const found =
      parent === undefined
        ? []
        : [
            parent.id,
            ...of(parent),
          ];

    ancestors.set(draft.id, found);

    return found;
  };

  for (const draft of drafts.values()) {
    of(draft);
  }

  return new Map(
    [
      ...ancestors,
    ].filter(([, found]) => found.length > 0),
  );
};

const baseWarningsOf = (input: {
  draft: BlockDraft;
  model: BlockModel;
}): readonly ProjectWarning[] => {
  const { draft, model } = input;
  const base = draft.card.extends;

  if (
    draft.format === BlockFormat.Nested ||
    base === undefined ||
    BlockModel.isExtensible(model, base)
  ) {
    return [];
  }

  return [
    {
      details: {
        base,
        block: draft.id,
        source: draft.source.kind,
      },
      kind:
        BlockModel.blockOf(model, base) === undefined
          ? WarningKind.BaseNoBlock
          : WarningKind.BaseConcrete,
    },
  ];
};

const linkWarningsOf = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  model: BlockModel;
}): readonly ProjectWarning[] =>
  [
    ...input.drafts.values(),
  ].flatMap((draft) => [
    ...draft.card.requires
      .filter((required) => BlockModel.blockOf(input.model, required) === undefined)
      .map(
        (required): ProjectWarning => ({
          details: {
            block: draft.id,
            required,
            source: draft.source.kind,
          },
          kind: WarningKind.RequiredNoBlock,
        }),
      ),
    ...baseWarningsOf({
      draft,
      model: input.model,
    }),
  ]);

const tightenedWarningsOf = (input: {
  drafts: ReadonlyMap<BlockId, BlockDraft>;
  rules: readonly StatedRule[];
}): readonly ProjectWarning[] => {
  const slugs = Rule.bySlug(input.rules);

  return [
    ...input.drafts.values(),
  ].flatMap((draft) =>
    input.rules.flatMap((rule): readonly ProjectWarning[] =>
      BlockId.equals(rule.block, draft.id) &&
      rule.tightens !== undefined &&
      Rule.tightenedIn(rule, slugs) === undefined
        ? [
            {
              details: {
                rule: rule.slug,
                source: draft.source.kind,
                tightens: rule.tightens,
              },
              kind: WarningKind.TightensUnknownRule,
            },
          ]
        : [],
    ),
  );
};

const blockOf = (draft: BlockDraft): BlockSetBlock => {
  const isLegacy = draft.format === BlockFormat.Legacy;
  const base = isLegacy ? draft.card.extends : undefined;

  return {
    chapters: draft.chapters,
    ...(BlockId.is(base)
      ? {
          extends: base,
        }
      : {}),
    format: draft.format,
    governs: draft.card.governs.filter(Glob.is),
    id: draft.id,
    isAbstract: isLegacy && draft.card.isAbstract === true,
    languages: draft.card.languages.filter(BlockId.is),
    layer: draft.layer,
    requires: draft.card.requires.filter(BlockId.is),
    seams: draft.seams,
    source: draft.source,
  };
};

const ruleOf = (rule: Rule): BlockSetRule => ({
  axis: rule.axis,
  block: rule.block,
  isLevelStated: rule.isLevelStated,
  level: rule.level,
  ...(rule.seam === undefined
    ? {}
    : {
        seam: rule.seam,
      }),
  slug: rule.slug,
  ...(rule.tightens === undefined
    ? {}
    : {
        tightens: rule.tightens,
      }),
});

interface ReadBlockSetInput {
  readonly cards: BlockCards;
  readonly sources: readonly BlockSetSource[];
}

interface BlockSetRead {
  readonly blockSet: BlockSet & {
    readonly ancestors: ReadonlyMap<BlockId, readonly BlockId[]>;
  };
  readonly model: BlockModel;
  readonly warnings: readonly ProjectWarning[];
}

const readBlockSet = (input: ReadBlockSetInput): BlockSetRead => {
  const outcomes = placeFiles(input.sources).map((place): FileReading | PassedFile =>
    place.fate === FileFate.Kept
      ? {
          ...place,
          read: readBlockFile({
            cards: input.cards,
            file: place.file,
          }),
        }
      : place,
  );
  const readings = outcomes.filter((outcome) => outcome.fate === FileFate.Kept);
  const stated = readings.flatMap(({ read }) => read.rules);
  const firsts = firstBy(stated, (rule) => rule.slug);
  const kept = [
    ...firsts.values(),
  ];
  const drafts = draftsOf(readings);
  const blocks = [
    ...drafts.values(),
  ].map(blockOf);
  const rules = StatedRule.inheritLevels(kept).map(ruleOf);
  const roles = BlockModel.rolesIn(readings.flatMap(({ read }) => read.texts));
  const model = BlockModel.create({
    blocks,
    roles,
    rules,
  });

  return {
    blockSet: {
      ancestors: ancestorsOf(drafts),
      blocks,
      roles,
      rules,
    },
    model,
    warnings: [
      ...input.sources.flatMap((source): readonly ProjectWarning[] =>
        source.status === SourceStatus.Unlisted
          ? [
              {
                details: {
                  where: source.shownFolderPath,
                },
                kind: WarningKind.PackNotInstalled,
              },
            ]
          : [],
      ),
      ...outcomes.flatMap((outcome) =>
        outcome.fate === FileFate.Kept
          ? [
              ...outcome.read.warnings,
              ...repeatedWarningsOf({
                firsts,
                reading: outcome,
              }),
            ]
          : outcome.warnings,
      ),
      ...linkWarningsOf({
        drafts,
        model,
      }),
      ...tightenedWarningsOf({
        drafts,
        rules: kept,
      }),
    ],
  };
};

export { readBlockSet };
