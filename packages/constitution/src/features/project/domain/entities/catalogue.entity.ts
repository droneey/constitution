import type { Axis, Layer, Level } from '#/kernel/constants';
import type { Met } from '#/kernel/entities';
import type { BlockId, BlockSource, Glob, RuleSlug } from '#/kernel/value-objects';

// A chapter of a block, <axis>/<name>.md.
interface ChapterPlace {
  readonly axis: Axis;
  readonly name: string;
}

// A seam of a block, <axis>/with/<other>.md.
interface SeamPlace {
  readonly axis: Axis;
  readonly other: BlockId;
}

// A block of the Constitution or of a pack as a project reads it, its chapters and seams in the
// order the blocks are read; a card without front matter leaves its fields empty or absent.
interface CatalogueBlock {
  readonly chapters: readonly ChapterPlace[];
  readonly extends?: BlockId;
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly isAbstract: boolean;
  readonly layer: Layer;
  readonly requires: readonly BlockId[];
  readonly seams: readonly SeamPlace[];
  readonly source: BlockSource;
  readonly summary?: string;
}

const CatalogueBlock = {
  create: (input: CatalogueBlock): CatalogueBlock => ({
    chapters: input.chapters,
    ...(input.extends === undefined
      ? {}
      : {
          extends: input.extends,
        }),
    governs: input.governs,
    id: input.id,
    isAbstract: input.isAbstract,
    layer: input.layer,
    requires: input.requires,
    seams: input.seams,
    source: input.source,
    ...(input.summary === undefined
      ? {}
      : {
          summary: input.summary,
        }),
  }),
} as const;

interface CatalogueRule {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly isLevelStated: boolean;
  readonly level: Level;
  readonly seam?: BlockId;
  readonly slug: RuleSlug;
  readonly tightens?: RuleSlug;
}

const CatalogueRule = {
  create: (input: CatalogueRule): CatalogueRule => ({
    axis: input.axis,
    block: input.block,
    isLevelStated: input.isLevelStated,
    level: input.level,
    ...(input.seam === undefined
      ? {}
      : {
          seam: input.seam,
        }),
    slug: input.slug,
    ...(input.tightens === undefined
      ? {}
      : {
          tightens: input.tightens,
        }),
  }),
} as const;

interface CatalogueAnswer {
  readonly block: BlockId;
  readonly met?: Met;
  readonly requirement: RuleSlug;
}

const CatalogueAnswer = {
  create: (input: CatalogueAnswer): CatalogueAnswer => ({
    block: input.block,
    ...(input.met === undefined
      ? {}
      : {
          met: input.met,
        }),
    requirement: input.requirement,
  }),
} as const;

interface Catalogue {
  readonly answers: readonly CatalogueAnswer[];
  readonly blocks: readonly CatalogueBlock[];
  readonly rules: readonly CatalogueRule[];
}

// A file of a source, its path from the source's folder: blocks/domains/ui/ui.md.
interface SourceFile {
  readonly path: string;
  // undefined when it cannot be read
  readonly text?: string;
}

interface CatalogueSource {
  // undefined when the pack is not installed
  readonly files?: readonly SourceFile[];
  readonly source: BlockSource;
  // the folder a warning names the source's files under
  readonly where: string;
}

export type { Catalogue, CatalogueSource, ChapterPlace, SeamPlace, SourceFile };
export { CatalogueAnswer, CatalogueBlock, CatalogueRule };
