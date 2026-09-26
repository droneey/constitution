import type { Kind, Layer, Role, Status } from '#/kernel';

interface FrontMatter {
  abstract: boolean;
  chapters: readonly string[];
  checks: readonly Role[];
  extends: string | undefined;
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

export type { Block, BlockFile, BlockFileRole, FrontMatter };
