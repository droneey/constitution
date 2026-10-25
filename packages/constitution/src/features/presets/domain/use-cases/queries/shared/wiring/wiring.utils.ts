import { TEMPLATES_FOLDER } from '#/kernel/constants';
import type { ProjectFiles, WorkingTree } from '#/kernel/contracts';
import type { FileRead, Resolution } from '#/kernel/entities';
import { FileReadStatus, ProjectUnit } from '#/kernel/entities';
import { compareText, withoutDotSlash } from '#/kernel/utils';
import { BlockSource, PackPath, SourceKind, UnitPath } from '#/kernel/value-objects';

import type { SourceFile } from '../../../../entities';
import { Parts, WiringContext } from '../../../../entities';
import { presetsPrefix } from './named.utils';
import type { WiringReads } from './wiring-context.utils';

const HIDDEN_OR_TEMPLATE = /\/\.|\/templates\/project\//;
const templatesPrefix = `${TEMPLATES_FOLDER}/`;

interface WiringInput {
  readonly files: ProjectFiles;
  /** the packs the project's units list, each once */
  readonly packs: readonly PackPath[];
  readonly project: string;
  readonly releaseFolder: string;
  readonly resolution: Resolution;
  readonly workingTree: WorkingTree;
}

interface Listing {
  readonly presets: readonly SourceFile[];
  readonly templates: readonly SourceFile[];
}

interface PackListing extends Listing {
  readonly pack: PackPath;
}

// A file as it was read, its lines without their carriage returns.
const readOf = (wiring: WiringInput, path: string): FileRead => {
  const read = wiring.files.read(path);

  return read.status === FileReadStatus.Read
    ? {
        ...read,
        text: read.text
          .split('\n')
          .map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line))
          .join('\n'),
      }
    : read;
};

// The files a folder of the release or of a pack holds under one of its folders, in order.
const filesUnder = (input: {
  files: ProjectFiles;
  folder: string;
  source: BlockSource;
  under: string;
}): readonly SourceFile[] =>
  (input.files.listFiles(`${input.folder}/${input.under.slice(0, -1)}`) ?? [])
    .map((path) => `${input.under}${path}`)
    .toSorted(compareText)
    .map((path) => ({
      path,
      source: input.source,
    }));

const listingOf = (input: {
  files: ProjectFiles;
  folder: string;
  source: BlockSource;
}): Listing => ({
  presets: filesUnder({
    ...input,
    under: presetsPrefix,
  }),
  templates: filesUnder({
    ...input,
    under: templatesPrefix,
  }),
});

// The packs the units list that hold parts or templates, each with them.
const packsOf = (wiring: WiringInput): readonly PackListing[] =>
  wiring.packs
    .map((pack) => ({
      ...listingOf({
        files: wiring.files,
        folder: `${wiring.project}/${withoutDotSlash(pack)}`,
        source: BlockSource.create(pack),
      }),
      pack,
    }))
    .filter((pack) => pack.presets.length + pack.templates.length > 0);

const sourceReaderOf =
  (wiring: WiringInput) =>
  (file: SourceFile): FileRead =>
    readOf(
      wiring,
      `${file.source.kind === SourceKind.Release ? wiring.releaseFolder : `${wiring.project}/${withoutDotSlash(file.source.pack)}`}/${file.path}`,
    );

const projectReaderOf = (wiring: WiringInput): ((path: string) => FileRead) => {
  const contents = new Map<string, FileRead>();

  const readOnce = (path: string): FileRead => {
    const read = readOf(wiring, `${wiring.project}/${path}`);

    // Stryker disable next-line CallExpression: the cache only spares a second read
    contents.set(path, read);

    return read;
  };

  return (path: string): FileRead => contents.get(path) ?? readOnce(path);
};

// The folders of the project that hold a file at each template's path: a tracked file of that
// name in a folder that is neither hidden nor a template, then a unit's own file, read or not.
const foldersOf = (input: {
  configs: readonly string[];
  parts: Parts;
  wiring: WiringInput;
}): ReadonlyMap<string, ReadonlySet<string>> => {
  const { parts, wiring } = input;
  const tracked = input.configs.flatMap((file) =>
    parts.paths
      .filter((path) => file === path || file.endsWith(`/${path}`))
      .map((path) => ({
        folder: file === path ? '' : file.slice(0, file.length - path.length - 1),
        path,
      }))
      .filter((place) => !HIDDEN_OR_TEMPLATE.test(`/${place.folder}/`)),
  );
  const owned = parts.paths.flatMap((path) =>
    wiring.resolution.units
      .filter(
        (unit) =>
          wiring.files.read(`${wiring.project}/${UnitPath.pathOf(unit.path, path)}`).status !==
          FileReadStatus.Missing,
      )
      .map((unit) => ({
        folder: unit.path,
        path,
      })),
  );
  const folders = new Map<string, Set<string>>();

  for (const place of [
    ...tracked,
    ...owned,
  ]) {
    folders.set(place.path, (folders.get(place.path) ?? new Set()).add(place.folder));
  }

  return folders;
};

const readsOf = (wiring: WiringInput): WiringReads => ({
  content: projectReaderOf(wiring),
});

const contextOf = (wiring: WiringInput): WiringContext => {
  const packs = packsOf(wiring);
  const listings = [
    listingOf({
      files: wiring.files,
      folder: wiring.releaseFolder,
      source: BlockSource.create(),
    }),
    ...packs,
  ];
  const templates = listings.flatMap((listing) => listing.templates);
  const parts = Parts.create({
    presets: listings.flatMap((listing) => listing.presets),
    read: sourceReaderOf(wiring),
    templates,
  });

  return WiringContext.create({
    blocks: wiring.resolution.blocks.map((block) => block.id),
    folders: foldersOf({
      configs: wiring.workingTree.trackedFiles({
        names: [
          ...new Set(templates.map((file) => file.path.slice(file.path.lastIndexOf('/') + 1))),
        ],
        project: wiring.project,
      }),
      parts,
      wiring,
    }),
    packs: new Set(packs.map((pack) => PackPath.normalOf(pack.pack))),
    parts,
    resolution: wiring.resolution,
    rootBlocks: new Set(
      wiring.resolution.units.filter(ProjectUnit.isRepository).flatMap((unit) => [
        ...unit.blocks,
      ]),
    ),
    unitAt: new Map(
      wiring.resolution.units.map((unit) => [
        unit.path,
        unit,
      ]),
    ),
  });
};

export type { WiringInput };
export { contextOf, readsOf };
