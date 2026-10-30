import { Axis } from '#/kernel/constants';
import type { BlockText, ProjectWarning } from '#/kernel/entities';
import { FileReadStatus, RequirementAnswer, StatedRule, WarningKind } from '#/kernel/entities';
import { splitFrontMatter, withoutCodeFences } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';
import { BlockFileKind } from '#/kernel/value-objects';

import type {
  BlockSetAnswer,
  ChapterPlace,
  SeamPlace,
} from '../../../../../../../../../../domain/entities';
import type { BlockCard, BlockCardParser } from '../../../../../../../../../contracts';
import type { FileInFolder } from '../place-files';

enum PartKind {
  Card = 'card',
  Chapter = 'chapter',
  Seam = 'seam',
  None = 'none',
}

interface Statements {
  readonly answers: readonly BlockSetAnswer[];
  readonly rules: readonly StatedRule[];
  readonly texts: readonly BlockText[];
}

type Stated = Statements & {
  readonly warnings: readonly ProjectWarning[];
};

type BlockFileRead = Stated &
  (
    | {
        readonly card: BlockCard;
        readonly part: PartKind.Card;
      }
    | {
        readonly chapter: ChapterPlace;
        readonly part: PartKind.Chapter;
      }
    | {
        readonly part: PartKind.Seam;
        readonly seam: SeamPlace;
      }
    | {
        readonly part: PartKind.None;
      }
  );

const NOTHING_STATED = {
  answers: [],
  rules: [],
  texts: [],
} as const satisfies Statements;

const answerOf = (answer: RequirementAnswer): BlockSetAnswer => {
  const met = RequirementAnswer.metOf(answer);

  return {
    block: answer.block,
    ...(met === undefined
      ? {}
      : {
          met,
        }),
    requirement: answer.requirement,
  };
};

const statementsOf = (input: {
  axis: Axis;
  block: BlockId;
  path: string;
  seam?: BlockId;
  text: string;
}): Statements => {
  const place = {
    block: input.block,
    // Stryker disable next-line ConditionalExpression: the rules, the answers and the role terms leave an absent seam out
    ...(input.seam === undefined
      ? {}
      : {
          seam: input.seam,
        }),
  };
  const read = {
    ...place,
    file: input.path,
    text: withoutCodeFences(splitFrontMatter(input.text).body),
  };

  return {
    answers: RequirementAnswer.parse(read).answers.map(answerOf),
    rules: StatedRule.parse({
      ...read,
      axis: input.axis,
    }).rules,
    texts: [
      {
        axis: input.axis,
        ...place,
        body: read.text,
      },
    ],
  };
};

const statedIn = (input: { axis: Axis; file: FileInFolder; seam?: BlockId }): Stated => {
  const { file } = input.file;

  if (file.status === FileReadStatus.Unreadable) {
    return {
      ...NOTHING_STATED,
      warnings: [
        {
          details: input.file.named,
          kind: WarningKind.FileUnreadable,
        },
      ],
    };
  }

  return {
    ...statementsOf({
      ...input,
      block: input.file.block,
      path: file.path,
      text: file.text,
    }),
    warnings: [],
  };
};

const passportRead = (input: { file: FileInFolder; parser: BlockCardParser }): BlockFileRead => {
  const { file } = input.file;

  if (file.status === FileReadStatus.Unreadable) {
    return {
      ...statedIn({
        axis: Axis.Foundation,
        file: input.file,
      }),
      part: PartKind.None,
    };
  }

  const { frontMatter } = splitFrontMatter(file.text);
  const statements = statementsOf({
    axis: Axis.Foundation,
    block: input.file.block,
    path: file.path,
    text: file.text,
  });

  if (frontMatter === undefined) {
    return {
      ...statements,
      part: PartKind.None,
      warnings: [
        {
          details: input.file.named,
          kind: WarningKind.FrontMatterMissing,
        },
      ],
    };
  }

  return {
    ...statements,
    card: input.parser.card(frontMatter),
    part: PartKind.Card,
    warnings: [],
  };
};

interface ReadBlockFileInput {
  readonly file: FileInFolder;
  readonly parser: BlockCardParser;
}

const readBlockFile = (input: ReadBlockFileInput): BlockFileRead => {
  const { file } = input;
  const { part } = file;

  if (part.kind === BlockFileKind.Passport) {
    return passportRead(input);
  }

  if (part.kind === BlockFileKind.Chapter) {
    return {
      ...statedIn({
        axis: part.axis,
        file,
      }),
      chapter: {
        axis: part.axis,
        name: part.name,
      },
      part: PartKind.Chapter,
    };
  }

  if (part.kind === BlockFileKind.Seam) {
    return {
      ...statedIn({
        axis: part.axis,
        file,
        seam: part.other,
      }),
      part: PartKind.Seam,
      seam: {
        axis: part.axis,
        other: part.other,
      },
    };
  }

  return {
    ...NOTHING_STATED,
    part: PartKind.None,
    warnings: [
      {
        details: file.named,
        kind: WarningKind.NotBlockFile,
      },
    ],
  };
};

export type { BlockFileRead };
export { PartKind, readBlockFile };
