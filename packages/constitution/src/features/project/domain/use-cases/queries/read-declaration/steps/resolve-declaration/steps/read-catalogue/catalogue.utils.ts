import { Axis, Layer } from '#/kernel/constants';
import { RequirementAnswer, StatedRule, WarningCode, WarningKind } from '#/kernel/entities';
import { splitFrontMatter, withoutCodeFences } from '#/kernel/utils';
import type { FileInBlock, RuleSlug } from '#/kernel/value-objects';
import {
  BlockFileKind,
  BlockFilePlace,
  BlockId,
  BlockSource,
  Placement,
  SourceKind,
} from '#/kernel/value-objects';

import type { BlockCard, BlockCardParser } from '../../../../../../../contracts';
import type {
  CatalogueSource,
  ChapterPlace,
  SeamPlace,
  SourceFile,
} from '../../../../../../../entities';
import { CatalogueAnswer } from '../../../../../../../entities';
import type { WarningLog } from '../../shared/warning-log';

interface BlockDraft {
  readonly card: BlockCard;
  readonly chapters: ChapterPlace[];
  readonly id: BlockId;
  readonly layer: Layer;
  readonly seams: SeamPlace[];
  readonly source: BlockSource;
}

// A block of one source passed over, since a source read before holds a block of its id.
interface SkippedBlock {
  readonly id: BlockId;
  readonly source: BlockSource;
}

interface ReadState {
  readonly answers: CatalogueAnswer[];
  readonly drafts: Map<BlockId, BlockDraft>;
  readonly log: WarningLog;
  readonly parser: BlockCardParser;
  readonly rules: StatedRule[];
  readonly skipped: SkippedBlock[];
  readonly slugs: Set<RuleSlug>;
}

interface FileInput {
  readonly source: CatalogueSource;
  readonly sourceFile: SourceFile;
  readonly state: ReadState;
}

const EMPTY_CARD: BlockCard = {
  extends: undefined,
  governs: [],
  isAbstract: false,
  requires: [],
  summary: '',
} as const;

// The code of a problem in a source's files: the Constitution's own, which its release checks, or a
// pack's.
const codeOfSource = (source: BlockSource): WarningCode =>
  source.kind === SourceKind.Release ? WarningCode.Constitution : WarningCode.Pack;

const whereOf = (input: { path: string; source: CatalogueSource }): string =>
  `${input.source.where}/${input.path}`;

// The text a rule or a requirement is read from: no front matter, no code sample.
const readRules = (
  input: FileInput & {
    axis: Axis;
    draft: BlockDraft;
    seam?: BlockId;
  },
): void => {
  const { sourceFile: file, source, state } = input;

  if (file.text === undefined) {
    state.log.add({
      code: codeOfSource(source.source),
      details: {
        file: whereOf({
          path: file.path,
          source,
        }),
      },
      kind: WarningKind.FileUnreadable,
    });

    return;
  }

  const read = {
    block: input.draft.id,
    file: file.path,
    // Stryker disable next-line ConditionalExpression: the rules and the answers leave an absent seam out
    ...(input.seam === undefined
      ? {}
      : {
          seam: input.seam,
        }),
    text: withoutCodeFences(splitFrontMatter(file.text).body),
  };

  for (const rule of StatedRule.parse({
    ...read,
    axis: input.axis,
  }).rules) {
    if (state.slugs.has(rule.slug)) {
      state.log.add({
        code: codeOfSource(source.source),
        details: {
          file: whereOf({
            path: file.path,
            source,
          }),
          rule: rule.slug,
        },
        kind: WarningKind.RuleRepeated,
      });
    } else {
      state.slugs.add(rule.slug);
      state.rules.push(rule);
    }
  }

  state.answers.push(
    ...RequirementAnswer.parse(read).answers.map((answer) => {
      const met = RequirementAnswer.metOf(answer);

      return CatalogueAnswer.create({
        block: answer.block,
        // Stryker disable next-line ConditionalExpression: create leaves an absent met out
        ...(met === undefined
          ? {}
          : {
              met,
            }),
        requirement: answer.requirement,
      });
    }),
  );
};

const readPassport = (
  input: FileInput & {
    draft: BlockDraft;
  },
): void => {
  const { sourceFile: file, source, state } = input;
  const where = whereOf({
    path: file.path,
    source,
  });

  if (file.text === undefined) {
    state.log.add({
      code: codeOfSource(source.source),
      details: {
        file: where,
      },
      kind: WarningKind.FileUnreadable,
    });

    return;
  }

  const { frontMatter } = splitFrontMatter(file.text);

  if (frontMatter === undefined) {
    state.log.add({
      code: codeOfSource(source.source),
      details: {
        file: where,
      },
      kind: WarningKind.FrontMatterMissing,
    });
  } else {
    state.drafts.set(input.draft.id, {
      ...input.draft,
      card: state.parser.card(frontMatter),
    });
  }

  readRules({
    ...input,
    axis: Axis.Foundation,
  });
};

const readPart = (
  input: FileInput & {
    draft: BlockDraft;
    file: FileInBlock;
  },
): void => {
  const { file } = input;

  if (file.kind === BlockFileKind.Seam) {
    input.draft.seams.push({
      axis: file.axis,
      other: file.other,
    });
    readRules({
      ...input,
      axis: file.axis,
      seam: file.other,
    });
  } else if (file.kind === BlockFileKind.Chapter) {
    input.draft.chapters.push({
      axis: file.axis,
      name: file.name,
    });
    readRules({
      ...input,
      axis: file.axis,
    });
  } else {
    input.state.log.add({
      code: codeOfSource(input.source.source),
      details: {
        file: whereOf({
          path: input.sourceFile.path,
          source: input.source,
        }),
      },
      kind: WarningKind.NotBlockFile,
    });
  }
};

// The draft a file adds to, or undefined when the block is another source's, which is read first.
const draftOf = (
  input: FileInput & {
    id: BlockId;
    layer: Layer;
  },
): BlockDraft | undefined => {
  const { id, source, state } = input;
  const draft = state.drafts.get(id);
  const isSkipped = state.skipped.some(
    (skipped) =>
      BlockId.equals(skipped.id, id) && BlockSource.equals(skipped.source, source.source),
  );

  if (isSkipped) {
    return undefined;
  }

  if (draft === undefined) {
    const created: BlockDraft = {
      card: EMPTY_CARD,
      chapters: [],
      id,
      layer: input.layer,
      seams: [],
      source: source.source,
    };

    state.drafts.set(id, created);

    return created;
  }

  if (BlockSource.equals(draft.source, source.source)) {
    return draft;
  }

  state.log.add({
    code: codeOfSource(source.source),
    details: {
      block: id,
      file: whereOf({
        path: input.sourceFile.path,
        source,
      }),
    },
    kind: WarningKind.BlockRepeated,
  });
  state.skipped.push({
    id,
    source: source.source,
  });

  return undefined;
};

const readFile = (input: FileInput): void => {
  const place = BlockFilePlace.parse(input.sourceFile.path);
  const where = whereOf({
    path: input.sourceFile.path,
    source: input.source,
  });

  if (
    place === undefined ||
    // Stryker disable next-line ConditionalExpression: the test only narrows the type
    (place.placement === Placement.InBlock &&
      place.folder.layer === Layer.Core &&
      input.source.source.kind !== SourceKind.Release)
  ) {
    input.state.log.add({
      code: codeOfSource(input.source.source),
      details: {
        file: where,
      },
      kind: WarningKind.OutsideBlockFolder,
    });

    return;
  }

  if (place.placement === Placement.MisnamedFolder) {
    input.state.log.add({
      code: codeOfSource(input.source.source),
      details: {
        file: where,
      },
      kind: WarningKind.FolderMisnamed,
    });

    return;
  }

  if (place.placement === Placement.Loose) {
    return;
  }

  const draft = draftOf({
    ...input,
    id: place.folder.id,
    layer: place.folder.layer,
  });

  if (draft === undefined) {
    return;
  }

  if (place.file.kind === BlockFileKind.Passport) {
    readPassport({
      ...input,
      draft,
    });
  } else {
    readPart({
      ...input,
      draft,
      file: place.file,
    });
  }
};

export type { BlockDraft, ReadState };
export { codeOfSource, readFile };
