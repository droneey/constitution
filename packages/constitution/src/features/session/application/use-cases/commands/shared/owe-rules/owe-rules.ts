import { CONFIG_FILE_NAME, releaseFolderInProject } from '#/kernel/constants';
import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import { memoised } from '#/kernel/utils';
import type { UnitPath } from '#/kernel/value-objects';
import { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type {
  GateCause,
  GateTarget,
  OwedReading,
  RuleLowered,
  RuleStanding,
} from '../../../../../domain/gate/entities';
import {
  ActiveRules,
  GateCauseKind,
  GatedDefinition,
  GatedRule,
  TargetKind,
} from '../../../../../domain/gate/entities';
import { ActiveBlocks } from '../../../../../domain/session/entities';
import type {
  ActiveRead,
  ActiveRulesSource,
  ChapterRules,
  TextHasher,
  WorkingTree,
} from '../../../../contracts';
import { ActiveReadStatus } from '../../../../contracts';

interface ProjectRules extends OwedReading {
  readonly folderPath: AbsolutePath;
}

interface TargetRules {
  readonly causes: readonly GateCause[];
  readonly project?: ProjectRules;
  readonly realPath: AbsolutePath;
}

type RulesOwedFor = (target: GateTarget) => TargetRules;

interface OweRulesInput {
  readonly hasher: TextHasher;
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

interface FoundRules extends OwedReading {
  readonly causes: readonly GateCause[];
}

interface RuleReaders {
  readonly activeOf: (place: ProjectPlace) => ActiveRead;
  readonly chapterOf: (file: AbsolutePath) => ChapterRules | undefined;
  readonly hasher: TextHasher;
}

// Stryker disable next-line StringLiteral: the repository's own folder lies in no member unit, and any path no member holds is given the same rules
const repositoryFolder = RepositoryRelativePath.create('');

const loweredOf = (input: {
  rules: ActiveRules;
  slug: RuleWording['slug'];
  unit: UnitPath;
}): RuleLowered | undefined => {
  const lowering = ActiveRules.loweringOf(input.rules, input);

  return lowering === undefined
    ? undefined
    : {
        level: lowering.level,
        reason: lowering.reason,
        ...(lowering.via === undefined
          ? {}
          : {
              via: lowering.via,
            }),
      };
};

const standingOf = (input: {
  rules: ActiveRules;
  unit: UnitPath;
  wording: RuleWording;
}): RuleStanding => {
  const { wording } = input;
  const lowered = loweredOf({
    rules: input.rules,
    slug: wording.slug,
    unit: input.unit,
  });

  return {
    level: GatedRule.levelOf({
      declared: input.rules.levels.get(wording.slug),
      wording,
    }),
    ...(lowered === undefined
      ? {}
      : {
          lowered,
        }),
  };
};

const pathInProjectOf = (input: {
  place: ProjectPlace;
  realPath: AbsolutePath;
}): RepositoryRelativePath | undefined =>
  input.realPath === input.place.repositoryFolderPath
    ? repositoryFolder
    : RepositoryRelativePath.fromAbsolute(input.place.repositoryFolderPath, input.realPath);

const activeReadOf = (input: {
  place: ProjectPlace;
  source: ActiveRulesSource;
  workingTree: WorkingTree;
}): ActiveRead => {
  const { place } = input;
  const read = input.source.readActive(place);

  if (read.status !== ActiveReadStatus.NoRelease) {
    return read;
  }

  const mainCheckout = input.workingTree.mainCheckoutOf(place.repositoryFolderPath);

  return mainCheckout === undefined || mainCheckout === place.repositoryFolderPath
    ? read
    : input.source.readActive({
        ...place,
        releaseFolderPath: AbsolutePath.join(mainCheckout, releaseFolderInProject),
      });
};

type UnreadActive = Exclude<
  ActiveRead,
  {
    readonly status: ActiveReadStatus.Read;
  }
>;

const causeOf = (input: { place: ProjectPlace; read: UnreadActive }): GateCause => {
  const { place, read } = input;

  switch (read.status) {
    case ActiveReadStatus.Unparsed:
      return {
        config: AbsolutePath.join(place.repositoryFolderPath, CONFIG_FILE_NAME),
        kind: GateCauseKind.Unparsed,
        lines: read.lines,
      };
    case ActiveReadStatus.NoRelease:
      return {
        kind: GateCauseKind.NoRelease,
        releaseFolderPath: place.releaseFolderPath,
      };
    case ActiveReadStatus.Failed:
      return {
        kind: GateCauseKind.Failed,
        reason: read.reason,
      };
  }
};

const rulesOf = (input: {
  place: ProjectPlace;
  readers: RuleReaders;
  realPath: AbsolutePath;
  target: GateTarget;
}): FoundRules => {
  const { readers } = input;
  const read = readers.activeOf(input.place);

  if (read.status !== ActiveReadStatus.Read) {
    return {
      causes: [
        causeOf({
          place: input.place,
          read,
        }),
      ],
      definitions: [],
      rules: [],
    };
  }

  const path = pathInProjectOf(input);

  if (path === undefined) {
    return {
      causes: [],
      definitions: [],
      rules: [],
    };
  }

  const { rules } = read;
  const unit = ActiveBlocks.unitHolding(rules, path);
  const files = ActiveRules.ruleFilesOf(rules, {
    kind: input.target.kind,
    path,
  }).map((file) => ({
    chapter: readers.chapterOf(file),
    file,
  }));

  return {
    causes: files.flatMap(({ chapter, file }): readonly GateCause[] =>
      chapter === undefined
        ? [
            {
              file,
              kind: GateCauseKind.Unreadable,
            },
          ]
        : [],
    ),
    definitions: files.flatMap(({ chapter, file }) =>
      (chapter?.definitions ?? []).map((text) =>
        GatedDefinition.create({
          file,
          hashOf: readers.hasher.hashOf,
          text,
        }),
      ),
    ),
    rules: files.flatMap(({ chapter, file }) =>
      (chapter?.wordings ?? []).map((wording) =>
        GatedRule.create({
          file,
          hashOf: readers.hasher.hashOf,
          standing: standingOf({
            rules,
            unit,
            wording,
          }),
          wording,
        }),
      ),
    ),
  };
};

const rulesOwedBy = (input: OweRulesInput): RulesOwedFor => {
  const { source } = input;
  const placeOf = memoised((folder: AbsolutePath) => source.findProjectAround(folder));
  const readers: RuleReaders = {
    activeOf: memoised(
      (place: ProjectPlace): ActiveRead =>
        activeReadOf({
          place,
          source,
          workingTree: input.workingTree,
        }),
      (place) => place.repositoryFolderPath,
    ),
    chapterOf: memoised((file: AbsolutePath) => source.rulesIn(file)),
    hasher: input.hasher,
  };

  return (target: GateTarget): TargetRules => {
    const realPath = source.realPathOf(target.path);
    const place = placeOf(
      target.kind === TargetKind.File ? AbsolutePath.parentOf(realPath) : realPath,
    );

    if (place === undefined) {
      return {
        causes: [],
        realPath,
      };
    }

    const { causes, ...reading } = rulesOf({
      place,
      readers,
      realPath,
      target,
    });

    return {
      causes,
      project: {
        ...reading,
        folderPath: place.repositoryFolderPath,
      },
      realPath,
    };
  };
};

export type { ProjectRules, RulesOwedFor, TargetRules };
export { rulesOwedBy };
