import { compareText } from '#/kernel/utils';

import type { ProjectFiles, WorkingTree } from '../../../contracts';
import type { ProjectConfig, ProjectWarning, Resolution } from '../../../entities';
import type { Parts, SourcePath } from './parts.utils';
import { PRESETS, readParts, TEMPLATES } from './parts.utils';
import { checkWiringOf } from './wiring-check.utils';
import type { WiringContext } from './wiring-context.utils';
import { planWiringOf } from './wiring-plan.utils';

const PACKS = 'packs';
const DOT_SLASH = './';
const HIDDEN_OR_TEMPLATE = /\/\.|\/templates\/project\//;

interface WiringInput {
  readonly archive: string;
  readonly config: ProjectConfig;
  readonly files: ProjectFiles;
  readonly project: string;
  readonly resolution: Resolution;
  readonly workingTree: WorkingTree;
}

// The presets and the templates of the release or of a pack.
interface Listing {
  readonly presets: readonly SourcePath[];
  readonly templates: readonly SourcePath[];
}

interface PackListing extends Listing {
  readonly pack: string;
}

const withoutDotSlash = (path: string): string =>
  path.startsWith(DOT_SLASH) ? path.slice(DOT_SLASH.length) : path;

// A file's lines without their carriage returns; a file that cannot be read is empty.
const textOf = (text: string | undefined): string =>
  (text ?? '')
    .split('\n')
    .map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line))
    .join('\n');

// The files a folder of the release or of a pack holds under one of its folders, in order.
const filesUnder = (input: {
  files: ProjectFiles;
  folder: string;
  source: string;
  under: string;
}): readonly SourcePath[] =>
  (input.files.listFiles(`${input.folder}/${input.under.slice(0, -1)}`) ?? [])
    .map((path) => `${input.under}${path}`)
    .toSorted(compareText)
    .map((path) => ({
      path,
      source: input.source,
    }));

const listingOf = (input: { files: ProjectFiles; folder: string; source: string }): Listing => ({
  presets: filesUnder({
    ...input,
    under: PRESETS,
  }),
  templates: filesUnder({
    ...input,
    under: TEMPLATES,
  }),
});

// The packs constitution.yaml lists that hold parts or templates, each with them.
const packsOf = (wiring: WiringInput): readonly PackListing[] =>
  wiring.config.items
    .filter((entry) => entry.app === '' && entry.key === PACKS)
    .map((entry) => ({
      ...listingOf({
        files: wiring.files,
        folder: `${wiring.project}/${withoutDotSlash(entry.text)}`,
        source: entry.text,
      }),
      pack: entry.text,
    }))
    .filter((pack) => pack.presets.length + pack.templates.length > 0);

const sourceReaderOf =
  (wiring: WiringInput) =>
  (file: SourcePath): string =>
    textOf(
      wiring.files.read(
        `${file.source === '' ? wiring.archive : `${wiring.project}/${withoutDotSlash(file.source)}`}/${file.path}`,
      ),
    );

// A file of the project, read once; one that cannot be read is empty.
const projectReaderOf = (wiring: WiringInput): ((path: string) => string) => {
  const contents = new Map<string, string>();
  const readOnce = (path: string): string => {
    const text = textOf(wiring.files.read(`${wiring.project}/${path}`));

    // Stryker disable next-line CallExpression: the cache only spares a second read
    contents.set(path, text);

    return text;
  };

  return (path: string): string => contents.get(path) ?? readOnce(path);
};

// The folders of the project that hold a file at each template's path: a tracked file of that
// name in a folder that is neither hidden nor a template, then a unit's own file.
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
          wiring.files.read(
            `${wiring.project}/${unit.path === '' ? '' : `${unit.path}/`}${path}`,
          ) !== undefined,
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

const contextOf = (wiring: WiringInput): WiringContext => {
  const packs = packsOf(wiring);
  const listings = [
    listingOf({
      files: wiring.files,
      folder: wiring.archive,
      source: '',
    }),
    ...packs,
  ];
  const read = sourceReaderOf(wiring);
  const templates = listings.flatMap((listing) => listing.templates);
  const parts = readParts({
    presets: listings.flatMap((listing) => listing.presets),
    read,
    templates,
  });
  const folders = foldersOf({
    configs: wiring.workingTree.trackedFiles({
      names: [
        ...new Set(templates.map((file) => file.path.slice(file.path.lastIndexOf('/') + 1))),
      ],
      project: wiring.project,
    }),
    parts,
    wiring,
  });

  return {
    blocks: wiring.resolution.blocks.map((block) => block.id),
    content: projectReaderOf(wiring),
    folders,
    hasFolder: (place: { folder: string; path: string }): boolean =>
      folders.get(place.path)?.has(place.folder) === true,
    naming: {
      packs: new Set(packs.map((pack) => pack.pack)),
      parts,
    },
    parts,
    readPart: read,
    resolution: wiring.resolution,
    rootBlocks: new Set(
      wiring.resolution.units
        .filter((unit) => unit.path === '')
        .flatMap((unit) => [
          ...unit.blocks,
        ]),
    ),
    unitAt: new Map(
      wiring.resolution.units.map((unit) => [
        unit.path,
        unit,
      ]),
    ),
  };
};

// What the project's configurations lack of the parts of their blocks, or name beyond them.
const checkWiring = (input: WiringInput): readonly ProjectWarning[] =>
  checkWiringOf(contextOf(input));

// The files ratify writes: each with the units it serves, its template and the parts it takes.
const planWiring = (input: WiringInput): readonly string[] => planWiringOf(contextOf(input));

export type { WiringInput };
export { checkWiring, planWiring };
