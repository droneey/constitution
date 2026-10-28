import type { Axis } from '#/kernel/constants';
import type { BlockId } from '#/kernel/value-objects';

enum BlockFileRole {
  Passport = 'passport',
  Chapter = 'chapter',
  Seam = 'seam',
}

interface BlockText {
  readonly axis: Axis;
  readonly body: string;
  readonly lines: number;
  readonly path: string;
}

type BlockFile = BlockText &
  (
    | {
        readonly role: BlockFileRole.Passport;
      }
    | {
        readonly role: BlockFileRole.Chapter;
      }
    | {
        readonly role: BlockFileRole.Seam;
        readonly seam: BlockId;
      }
  );

type PassportFile = Extract<
  BlockFile,
  {
    readonly role: BlockFileRole.Passport;
  }
>;

type PartFile = Exclude<BlockFile, PassportFile>;

const textOf = (input: BlockText): BlockText => ({
  axis: input.axis,
  body: input.body,
  lines: input.lines,
  path: input.path,
});

const chapter = (text: BlockText): PartFile => ({
  ...textOf(text),
  role: BlockFileRole.Chapter,
});

const passport = (text: BlockText): PassportFile => ({
  ...textOf(text),
  role: BlockFileRole.Passport,
});

const seam = (text: BlockText, other: BlockId): PartFile => ({
  ...textOf(text),
  role: BlockFileRole.Seam,
  seam: other,
});

const seamOf = (file: BlockFile): BlockId | undefined => {
  switch (file.role) {
    case BlockFileRole.Seam:
      return file.seam;
    case BlockFileRole.Passport:
    case BlockFileRole.Chapter:
      return undefined;
    // Stryker disable next-line ConditionalExpression: no role reaches the default, which only the compiler reads
    default:
      return file satisfies never;
  }
};

const isSeamWith = (file: BlockFile, other: BlockId): boolean => seamOf(file) === other;

const withPath = <TFile extends BlockFile>(file: TFile, path: string): TFile => ({
  ...file,
  path,
});

const BlockFile = {
  chapter,
  isSeamWith,
  passport,
  seam,
  seamOf,
  withPath,
} as const;

export type { PartFile, PassportFile };
export { BlockFile, BlockFileRole };
