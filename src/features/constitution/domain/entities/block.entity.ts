import type { Axis, Layer, Role } from '#/kernel';

interface FrontMatter {
  abstract: boolean;
  checks: readonly Role[];
  dictionary: readonly string[];
  extends: string | undefined;
  governs: readonly string[];
  id: string;
  requires: readonly string[];
  summary: string;
}

enum BlockFileRole {
  Main = 'main',
  Chapter = 'chapter',
  With = 'with',
}

interface BlockFile {
  axis: Axis | undefined;
  body: string;
  lines: number;
  path: string;
  role: BlockFileRole;
  with: string | undefined;
}

interface Block {
  files: readonly BlockFile[];
  frontMatter: FrontMatter;
  id: string;
  layer: Layer;
  path: string;
}

export type { Block, BlockFile, FrontMatter };
export { BlockFileRole };
