import type { ProjectUnit, Resolution } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';

import type { Parts } from './parts.entity';

interface WiringContext {
  readonly blocks: readonly BlockId[];
  /** per template path, the folders of the project that hold a file at it */
  readonly folders: ReadonlyMap<string, ReadonlySet<string>>;
  /** the packs that hold presets or templates, each by its path from the repository */
  readonly packs: ReadonlySet<string>;
  readonly parts: Parts;
  readonly resolution: Resolution;
  readonly rootBlocks: ReadonlySet<BlockId>;
  readonly unitAt: ReadonlyMap<string, ProjectUnit>;
}

const WiringContext = {
  create: (input: WiringContext): WiringContext => ({
    blocks: input.blocks,
    folders: input.folders,
    packs: input.packs,
    parts: input.parts,
    resolution: input.resolution,
    rootBlocks: input.rootBlocks,
    unitAt: input.unitAt,
  }),
  foldersAt: (context: WiringContext, path: string): readonly string[] => [
    ...(context.folders.get(path) ?? []),
  ],
  hasFolder: (
    context: WiringContext,
    place: {
      folder: string;
      path: string;
    },
  ): boolean => context.folders.get(place.path)?.has(place.folder) === true,
} as const;

export { WiringContext };
