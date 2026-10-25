import { Placeholder, RELEASE_FOLDER, WORKSPACE_PART } from '#/kernel/constants';
import { compareText } from '#/kernel/utils';
import type { BlockSource, PresetFolder } from '#/kernel/value-objects';
import {
  PartAddress,
  PresetFileKind,
  PresetPartPath,
  SourceKind,
  TemplatePath,
} from '#/kernel/value-objects';

/** A file of the release or of a pack, by its path from the source's folder. */
interface SourceFile {
  readonly path: string;
  readonly source: BlockSource;
}

enum Takes {
  Nothing = 'nothing',
  /** it lists them where it writes <parts> */
  Parts = 'parts',
  /** it copies them whole where it writes <copied parts> */
  Copies = 'copies',
  /** it extends the end of their chain where it writes <chain end> */
  Chains = 'chains',
}

/** A template of a tool, with the path it writes from the folder it serves. */
interface Fragment {
  /** the template's path as a project names it */
  readonly at: string;
  readonly path: string;
  readonly takes: Takes;
}

/** A template that lists the folders of the workspace's units where it writes <unit folders>. */
interface Skip {
  readonly path: string;
  readonly template: SourceFile;
  readonly tool: string;
}

/** Its maps are keyed by the companion alone; a caller asks through it. */
interface Parts {
  readonly chainTools: ReadonlySet<string>;
  readonly filesByAddress: ReadonlyMap<string, SourceFile>;
  readonly filesByPath: ReadonlyMap<string, SourceFile>;
  readonly fragments: ReadonlyMap<string, readonly Fragment[]>;
  readonly gives: ReadonlySet<string>;
  readonly links: ReadonlyMap<string, string>;
  readonly names: ReadonlyMap<string, ReadonlySet<string>>;
  /** the paths templates write, in order */
  readonly paths: readonly string[];
  readonly skips: readonly Skip[];
  readonly takes: ReadonlyMap<string, Takes>;
  readonly toolScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly tools: ReadonlySet<string>;
  readonly toolsAt: ReadonlyMap<string, ReadonlySet<string>>;
  readonly workspaceTools: ReadonlySet<string>;
}

const EXTENDS = /^extends?[ \t]*=[ \t]*"/;

const keyOf = (...segments: readonly string[]): string => JSON.stringify(segments);

const addressKey = (address: PartAddress): string =>
  keyOf(address.scope, address.tool, address.axis, address.name);

const folderKey = (folder: PresetFolder): string => keyOf(folder.scope, folder.tool, folder.axis);

const releasePathOf = (file: SourceFile): string =>
  `${file.source.kind === SourceKind.Release ? RELEASE_FOLDER : file.source.pack}/${file.path}`;

const added = <TItem>(input: {
  item: TItem;
  key: string;
  map: Map<string, ReadonlySet<TItem>>;
}): void => {
  input.map.set(input.key, new Set(input.map.get(input.key)).add(input.item));
};

// Where a line names <copied parts> the template copies, where it names <chain end> it chains, and
// a bare <parts> lists them unless the template copies or chains.
const takesOf = (text: string): Takes => {
  let found = Takes.Nothing;

  for (const line of text.split('\n')) {
    if (line.includes(Placeholder.CopiedParts)) {
      found = Takes.Copies;
    } else if (line.includes(Placeholder.ChainEnd)) {
      found = Takes.Chains;
    } else if (line.includes(Placeholder.Parts) && found === Takes.Nothing) {
      found = Takes.Parts;
    }
  }

  return found;
};

interface FoundPart {
  readonly address: PartAddress;
  readonly file: SourceFile;
}

const partsFound = (presets: readonly SourceFile[]): readonly FoundPart[] =>
  presets.flatMap((file) => {
    const path = PresetPartPath.parse(file.path);

    return path?.kind === PresetFileKind.Part
      ? [
          {
            address: PartAddress.create(path),
            file,
          },
        ]
      : [];
  });

// The part each chained part extends, by the last "extends" line of its file.
const linksOf = (input: {
  chainTools: ReadonlySet<string>;
  found: readonly FoundPart[];
  read: (file: SourceFile) => string;
}): ReadonlyMap<string, string> => {
  const links = new Map<string, string>();

  for (const { address, file } of input.found) {
    // Stryker disable next-line ConditionalExpression,BlockStatement: only a chained tool's links are followed, so skipping the rest only spares their reads
    if (!input.chainTools.has(address.tool)) {
      continue;
    }

    for (const line of input.read(file).split('\n')) {
      if (EXTENDS.test(line)) {
        // Stryker disable next-line StringLiteral: split always yields a first part
        const target = line.slice(line.indexOf('"') + 1).split('"')[0] ?? '';

        links.set(
          addressKey(address),
          PresetPartPath.partNameOf(target.slice(target.lastIndexOf('/') + 1)),
        );
      }
    }
  }

  return links;
};

interface TemplatesRead {
  readonly fragments: ReadonlyMap<string, readonly Fragment[]>;
  readonly gives: ReadonlySet<string>;
  readonly paths: readonly string[];
  readonly skips: readonly Skip[];
  readonly takes: ReadonlyMap<string, Takes>;
  readonly toolsAt: ReadonlyMap<string, ReadonlySet<string>>;
}

const readTemplates = (input: {
  read: (file: SourceFile) => string;
  templates: readonly SourceFile[];
  tools: ReadonlySet<string>;
}): TemplatesRead => {
  const fragments = new Map<string, Fragment[]>();
  const gives = new Set<string>();
  const takes = new Map<string, Takes>();
  const toolsAt = new Map<string, ReadonlySet<string>>();
  const paths = new Set<string>();
  // Stryker disable next-line ArrayDeclaration: an entry that is no template names no tool the root follows
  const skips: Skip[] = [];

  for (const template of input.templates) {
    const place = TemplatePath.parse(template.path);

    if (place === undefined) {
      continue;
    }

    const { scope, tool, writes: path } = place;
    const text = input.read(template);
    const taken = input.tools.has(keyOf(scope, tool)) ? takesOf(text) : Takes.Nothing;

    // Stryker disable next-line ConditionalExpression: a template without the placeholder holds no list to find, so this only spares its parse
    if (text.includes(Placeholder.UnitFolders)) {
      skips.push({
        path,
        template,
        tool,
      });
    }

    const fragment = {
      at: releasePathOf(template),
      path,
      takes: taken,
    };
    const ofTool = fragments.get(keyOf(scope, tool));

    if (ofTool === undefined) {
      fragments.set(keyOf(scope, tool), [
        fragment,
      ]);
    } else {
      ofTool.push(fragment);
    }

    paths.add(path);
    gives.add(keyOf(path, tool));

    if (taken !== Takes.Nothing) {
      added({
        item: tool,
        key: path,
        map: toolsAt,
      });
      takes.set(keyOf(path, tool), taken);
    }
  }

  return {
    fragments,
    gives,
    paths: [
      ...paths,
    ].toSorted(compareText),
    skips,
    takes,
    toolsAt,
  };
};

/** read gives a file's text, to find what a template takes and what a chained part extends. */
const create = (input: {
  presets: readonly SourceFile[];
  read: (file: SourceFile) => string;
  templates: readonly SourceFile[];
}): Parts => {
  const found = partsFound(input.presets);
  const tools = new Set(found.map(({ address }) => keyOf(address.scope, address.tool)));
  const templates = readTemplates({
    read: input.read,
    templates: input.templates,
    tools,
  });
  const chainTools = new Set(
    found
      .map(({ address }) => address.tool)
      .filter((tool) =>
        templates.paths.some((path) => templates.takes.get(keyOf(path, tool)) === Takes.Chains),
      ),
  );
  const names = new Map<string, ReadonlySet<string>>();
  const toolScopes = new Map<string, ReadonlySet<string>>();

  for (const { address } of found) {
    added({
      item: address.name,
      key: folderKey(address),
      map: names,
    });
    added({
      item: address.scope,
      key: address.tool,
      map: toolScopes,
    });
  }

  return {
    ...templates,
    chainTools,
    filesByAddress: new Map(
      found.map(({ address, file }) => [
        addressKey(address),
        file,
      ]),
    ),
    filesByPath: new Map(
      found.map(({ file }) => [
        file.path,
        file,
      ]),
    ),
    links: linksOf({
      chainTools,
      found,
      read: input.read,
    }),
    names,
    toolScopes,
    tools,
    workspaceTools: new Set(
      found
        .filter(({ address }) => address.name === WORKSPACE_PART)
        .map(({ address }) => address.tool),
    ),
  };
};

interface ToolScope {
  readonly scope: string;
  readonly tool: string;
}

interface ToolPath {
  readonly path: string;
  readonly tool: string;
}

const Parts = {
  create,
  fileOf: (parts: Parts, address: PartAddress): SourceFile | undefined =>
    parts.filesByAddress.get(addressKey(address)),
  /** the part whose file sits at a path from its source */
  fileAt: (parts: Parts, path: string): SourceFile | undefined => parts.filesByPath.get(path),
  fragmentsOf: (parts: Parts, at: ToolScope): readonly Fragment[] =>
    parts.fragments.get(keyOf(at.scope, at.tool)) ?? [],
  /** whether a template of the tool writes the path */
  gives: (parts: Parts, at: ToolPath): boolean => parts.gives.has(keyOf(at.path, at.tool)),
  hasTool: (parts: Parts, at: ToolScope): boolean => parts.tools.has(keyOf(at.scope, at.tool)),
  hasWorkspacePart: (parts: Parts, tool: string): boolean => parts.workspaceTools.has(tool),
  /** whether the tool's template ends a chain of parts */
  isChained: (parts: Parts, tool: string): boolean => parts.chainTools.has(tool),
  /** the name of the part a chained part extends */
  linkOf: (parts: Parts, address: PartAddress): string | undefined =>
    parts.links.get(addressKey(address)),
  /** the names of the tool's parts on an axis, in the order they were found */
  namesOf: (parts: Parts, folder: PresetFolder): readonly string[] => [
    ...(parts.names.get(folderKey(folder)) ?? []),
  ],
  scopesOf: (parts: Parts, tool: string): readonly string[] => [
    ...(parts.toolScopes.get(tool) ?? []),
  ],
  takesAt: (parts: Parts, at: ToolPath): Takes =>
    parts.takes.get(keyOf(at.path, at.tool)) ?? Takes.Nothing,
  /** the tools whose template takes parts at the path, in the order found */
  toolsAt: (parts: Parts, path: string): readonly string[] => [
    ...(parts.toolsAt.get(path) ?? []),
  ],
} as const;

export type { Fragment, Skip, SourceFile };
export { Parts, Takes };
