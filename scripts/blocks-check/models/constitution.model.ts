import type { AssemblyManifest, BlockManifest } from './manifest.schema';

const KINDS = [
  'core',
  'language',
  'concern',
  'sphere',
  'framework',
  'stack',
] as const;

type Kind = (typeof KINDS)[number];

const KIND_FOLDERS: Readonly<Record<Kind, string>> = {
  concern: 'concerns',
  core: 'core',
  framework: 'frameworks',
  language: 'languages',
  sphere: 'spheres',
  stack: 'stacks',
};

const CHAPTER_LINE_BUDGET = 500;

interface Chapter {
  axis: string;
  path: string;
  text: string;
}

interface Block {
  chapters: readonly Chapter[];
  dir: string;
  id: string;
  kind: Kind;
  manifest: BlockManifest;
}

interface Assembly {
  fileName: string;
  manifest: AssemblyManifest;
  path: string;
}

interface Finding {
  message: string;
  path: string;
}

interface Constitution {
  assemblies: readonly Assembly[];
  blocks: readonly Block[];
  decisions: string | undefined;
  paths: ReadonlySet<string>;
  readme: string | undefined;
}

type Rule = (constitution: Constitution) => readonly Finding[];

const kindRank = (kind: Kind): number => KINDS.indexOf(kind);

const kindOfFolder = (folder: string): Kind | undefined =>
  KINDS.find((kind) => KIND_FOLDERS[kind] === folder);

const kindOfBlockId = (id: string): Kind | undefined =>
  id === 'core' ? 'core' : kindOfFolder(id.split('/')[0] ?? '');

export type { Assembly, Block, Chapter, Constitution, Finding, Kind, Rule };
export { CHAPTER_LINE_BUDGET, kindOfBlockId, kindOfFolder, kindRank };
