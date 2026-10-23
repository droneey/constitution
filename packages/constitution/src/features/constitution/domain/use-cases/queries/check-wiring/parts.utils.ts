import { AXES } from '#/kernel/constants';
import { compareText } from '#/kernel/utils';

// The parts of the presets a release and its packs ship, and the templates that take them: a
// part is presets/<scope>/<tool>/<axis>/<name>.<ext>, a template templates/project/<scope>/<tool>/<path>.

const ARCHIVE = '.droneey/constitution';
const PRESETS = 'presets/';
const TEMPLATES = 'templates/project/';
const BINDINGS = 'bindings.yaml';
const WORKSPACE = 'workspace';
const PART_SEGMENTS = 5;
const EXTENDS = /^extends?[ \t]*=[ \t]*"/;

enum Takes {
  Nothing = 0,
  Parts = 1,
  Copies = 2,
  Chains = 3,
}

interface SourcePath {
  readonly path: string;
  // '' for the release, else the pack's path as constitution.yaml names it
  readonly source: string;
}

interface Fragment {
  // the path of the template in the release or the pack, as a project names it
  readonly at: string;
  // the path the template writes, from the folder it serves
  readonly path: string;
  readonly takes: Takes;
}

interface Parts {
  // the paths each part sits at, as a project names it
  readonly archivePath: ReadonlyMap<string, string>;
  // the tools whose template ends a chain of parts
  readonly chainTools: ReadonlySet<string>;
  // per <scope>/<tool>, its templates
  readonly fragments: ReadonlyMap<string, readonly Fragment[]>;
  // per <path>/<tool>, whether a template of the tool writes path
  readonly gives: ReadonlySet<string>;
  readonly hasWorkspace: ReadonlySet<string>;
  // per <scope>/<tool>/<axis>/<name>, the link a chained part extends
  readonly links: ReadonlyMap<string, string>;
  // per <scope>/<tool>/<axis>, the names of its parts in the order they were found
  readonly names: ReadonlyMap<string, ReadonlySet<string>>;
  // per <scope>/<tool>/<axis>/<name>, the part's path from its source
  readonly partAt: ReadonlyMap<string, string>;
  // per part path from its source, the file to read
  readonly partFile: ReadonlyMap<string, SourcePath>;
  // the template paths, in order
  readonly paths: readonly string[];
  // per path, how a tool takes its parts there
  readonly takes: ReadonlyMap<string, Takes>;
  // per tool, the scopes it has parts in
  readonly toolScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly tools: ReadonlySet<string>;
  // per path, the tools whose template takes parts there, in the order found
  readonly toolsAt: ReadonlyMap<string, ReadonlySet<string>>;
}

const keyOf = (...segments: readonly string[]): string => segments.join('\n');

const archivePathOf = (file: SourcePath): string =>
  `${file.source === '' ? ARCHIVE : file.source}/${file.path}`;

const stemOf = (name: string): string =>
  name.includes('.') ? name.slice(0, name.indexOf('.')) : name;

const addTo = (input: { item: string; key: string; map: Map<string, Set<string>> }): void => {
  input.map.set(input.key, (input.map.get(input.key) ?? new Set()).add(input.item));
};

const appendTo = <TItem>(input: { item: TItem; key: string; map: Map<string, TItem[]> }): void => {
  const known = input.map.get(input.key);

  if (known === undefined) {
    input.map.set(input.key, [
      input.item,
    ]);
  } else {
    known.push(input.item);
  }
};

const takesOf = (text: string): Takes => {
  let found = Takes.Nothing;

  for (const line of text.split('\n')) {
    if (line.includes('<copied parts>')) {
      found = Takes.Copies;
    } else if (line.includes('<chain end>')) {
      found = Takes.Chains;
    } else if (line.includes('<parts>') && found === Takes.Nothing) {
      found = Takes.Parts;
    }
  }

  return found;
};

// A part as its path names it.
interface PartFound {
  readonly axis: string;
  readonly file: SourcePath;
  readonly name: string;
  readonly scope: string;
  readonly tool: string;
}

interface PartsDraft {
  archivePath: Map<string, string>;
  hasWorkspace: Set<string>;
  names: Map<string, Set<string>>;
  partAt: Map<string, string>;
  partFile: Map<string, SourcePath>;
  toolScopes: Map<string, Set<string>>;
  tools: Set<string>;
}

// The part a preset is, or undefined when it is a tool's bindings or lies elsewhere.
const partOf = (preset: SourcePath): PartFound | undefined => {
  // Stryker disable next-line StringLiteral: the length check guards every read
  const [, scope = '', tool = '', axis = '', file = ''] = preset.path.split('/');
  const name = stemOf(file);

  return preset.path.split('/').length !== PART_SEGMENTS ||
    file === BINDINGS ||
    !AXES.some((candidate) => candidate === axis) ||
    name === ''
    ? undefined
    : {
        axis,
        file: preset,
        name,
        scope,
        tool,
      };
};

const readPresets = (found: readonly PartFound[]): PartsDraft => {
  const draft: PartsDraft = {
    archivePath: new Map(),
    hasWorkspace: new Set(),
    names: new Map(),
    partAt: new Map(),
    partFile: new Map(),
    toolScopes: new Map(),
    tools: new Set(),
  };

  for (const { axis, file, name, scope, tool } of found) {
    const partKey = keyOf(scope, tool, axis, name);

    draft.tools.add(keyOf(scope, tool));
    addTo({
      item: scope,
      key: tool,
      map: draft.toolScopes,
    });
    addTo({
      item: name,
      key: keyOf(scope, tool, axis),
      map: draft.names,
    });

    if (name === WORKSPACE) {
      draft.hasWorkspace.add(tool);
    }

    draft.partAt.set(partKey, file.path);
    draft.partFile.set(file.path, file);
    draft.archivePath.set(partKey, archivePathOf(file));
  }

  return draft;
};

const readLinks = (input: {
  chainTools: ReadonlySet<string>;
  found: readonly PartFound[];
  read: (file: SourcePath) => string;
}): ReadonlyMap<string, string> => {
  const links = new Map<string, string>();

  for (const part of input.found) {
    // Stryker disable next-line ConditionalExpression,BlockStatement: only a chained tool's links are followed, so skipping the rest only spares their reads
    if (!input.chainTools.has(part.tool)) {
      continue;
    }

    for (const line of input.read(part.file).split('\n')) {
      if (EXTENDS.test(line)) {
        // Stryker disable next-line StringLiteral: split always yields a first part
        const target = line.slice(line.indexOf('"') + 1).split('"')[0] ?? '';

        links.set(
          keyOf(part.scope, part.tool, part.axis, part.name),
          stemOf(target.slice(target.lastIndexOf('/') + 1)),
        );
      }
    }
  }

  return links;
};

const readParts = (input: {
  presets: readonly SourcePath[];
  read: (file: SourcePath) => string;
  templates: readonly SourcePath[];
}): Parts => {
  const found = input.presets.map(partOf).filter((part) => part !== undefined);
  const draft = readPresets(found);
  const fragments = new Map<string, Fragment[]>();
  const gives = new Set<string>();
  const takes = new Map<string, Takes>();
  const toolsAt = new Map<string, Set<string>>();
  const paths = new Set<string>();

  for (const template of input.templates) {
    // Stryker disable next-line StringLiteral: a template with a path has its scope and its tool
    const [scope = '', tool = '', ...rest] = template.path.slice(TEMPLATES.length).split('/');
    const path = rest.join('/');

    if (path === '') {
      continue;
    }

    const taken = draft.tools.has(keyOf(scope, tool))
      ? takesOf(input.read(template))
      : Takes.Nothing;

    appendTo({
      item: {
        at: archivePathOf(template),
        path,
        takes: taken,
      },
      key: keyOf(scope, tool),
      map: fragments,
    });
    paths.add(path);
    gives.add(keyOf(path, tool));

    if (taken !== Takes.Nothing) {
      addTo({
        item: tool,
        key: path,
        map: toolsAt,
      });
      takes.set(keyOf(path, tool), taken);
    }
  }

  const chainTools = new Set(
    [
      ...takes,
    ]
      .filter(([, taken]) => taken === Takes.Chains)
      .map(([key]) => key.slice(key.lastIndexOf('\n') + 1)),
  );

  return {
    ...draft,
    chainTools,
    fragments,
    gives,
    links: readLinks({
      chainTools,
      found,
      read: input.read,
    }),
    paths: [
      ...paths,
    ].toSorted(compareText),
    takes,
    toolsAt,
  };
};

export type { Parts, SourcePath };
export { appendTo, keyOf, PRESETS, readParts, Takes, TEMPLATES };
