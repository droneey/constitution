import type { Kind, Layer, Role, Status } from '#/kernel';

interface FrontMatter {
  abstract: boolean;
  chapters: readonly string[];
  checks: readonly Role[];
  extends: string | null;
  governs: readonly string[];
  id: string;
  kind: Kind;
  owns: readonly string[];
  requires: readonly string[];
  status: Status;
  summary: string;
}

type BlockFileRole = 'main' | 'chapter' | 'with';

interface BlockFile {
  path: string;
  role: BlockFileRole;
  text: string;
  with: string | null;
}

interface Block {
  dir: string;
  files: readonly BlockFile[];
  frontMatter: FrontMatter;
  id: string;
  layer: Layer;
}

export type { Block, BlockFile, BlockFileRole, FrontMatter };
