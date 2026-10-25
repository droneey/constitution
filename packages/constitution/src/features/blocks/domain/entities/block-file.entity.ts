import type { Axis } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

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

const BlockFile = {
  chapter: (text: BlockText): PartFile => ({
    ...textOf(text),
    role: BlockFileRole.Chapter,
  }),
  isSeamWith: (file: BlockFile, other: BlockId): boolean =>
    file.role === BlockFileRole.Seam && BlockId.equals(file.seam, other),
  passport: (text: BlockText): PassportFile => ({
    ...textOf(text),
    role: BlockFileRole.Passport,
  }),
  seam: (text: BlockText, other: BlockId): PartFile => ({
    ...textOf(text),
    role: BlockFileRole.Seam,
    seam: other,
  }),
  seamOf: (file: BlockFile): BlockId | undefined =>
    file.role === BlockFileRole.Seam ? file.seam : undefined,
  withPath: <TFile extends BlockFile>(file: TFile, path: string): TFile => ({
    ...file,
    path,
  }),
} as const;

export type { PartFile, PassportFile };
export { BlockFile, BlockFileRole };
