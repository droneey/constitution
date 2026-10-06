import type { Axis, Layer } from '#/kernel';

interface FrontMatter {
  readonly abstract: boolean;
  readonly dictionary: readonly string[];
  readonly extends: string | undefined;
  readonly governs: readonly string[];
  readonly id: string;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
  readonly summary: string;
}

enum BlockFileRole {
  Main = 'main',
  Chapter = 'chapter',
  With = 'with',
}

interface BlockFile {
  readonly axis: Axis;
  readonly body: string;
  readonly lines: number;
  readonly path: string;
  readonly role: BlockFileRole;
  readonly with: string | undefined;
}

interface Block {
  readonly files: readonly BlockFile[];
  readonly frontMatter: FrontMatter;
  readonly id: string;
  readonly layer: Layer;
  readonly path: string;
}

export type { Block, BlockFile, FrontMatter };
export { BlockFileRole };
