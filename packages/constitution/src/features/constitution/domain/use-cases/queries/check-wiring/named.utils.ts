import type { Parts } from './parts.utils';
import { PRESETS } from './parts.utils';

// How a configuration names the parts of a tool: by the path of the release or of a pack, as
// "<scope>/<axis>/<name>", in comments too or in code alone.

const ARCHIVE_END = '.droneey/constitution/';
const DOT_SLASH = './';
const BINDINGS = 'bindings.yaml';
// the first character that ends a path, or the line's end
const PATH_END = /[^\w./-]|$/;
const COMMENT = /^[ \t]*(#|\/\/|\/\*|\*)/;

interface Naming {
  // the packs that hold presets or templates
  readonly packs: ReadonlySet<string>;
  readonly parts: Parts;
}

const isComment = (line: string): boolean => COMMENT.test(line);

// Whether the text before "presets/" ends with the release's path or a pack's.
const isAnchored = (input: { before: string; naming: Naming }): boolean =>
  input.before.endsWith(ARCHIVE_END) ||
  [
    ...input.naming.packs,
  ].some((pack) =>
    input.before.endsWith(`${pack.startsWith(DOT_SLASH) ? pack.slice(DOT_SLASH.length) : pack}/`),
  );

const stemOf = (name: string): string =>
  name.includes('.') ? name.slice(0, name.indexOf('.')) : name;

// The parts a line names after each place it holds the prefix of a scope's tool.
const namedInLine = (input: {
  line: string;
  naming: Naming;
  prefix: string;
  scope: string;
}): readonly string[] => {
  const { line, prefix } = input;
  const found: string[] = [];

  for (let at = line.indexOf(prefix); at !== -1; at = line.indexOf(prefix, at + prefix.length)) {
    const rest = line.slice(at + prefix.length);
    const token = rest.slice(0, rest.search(PATH_END));
    const slash = token.indexOf('/');
    const file = token.slice(slash + 1);
    const name = stemOf(file);

    if (
      isAnchored({
        before: line.slice(0, at),
        naming: input.naming,
      }) &&
      slash !== -1 &&
      !file.includes('/') &&
      file !== BINDINGS &&
      name !== ''
    ) {
      found.push(`${input.scope}/${token.slice(0, slash)}/${name}`);
    }
  }

  return found;
};

// The parts of tool a text names, as <scope>/<axis>/<name>, each once in the order found.
const namedOf = (input: {
  isCodeOnly: boolean;
  naming: Naming;
  text: string;
  tool: string;
}): readonly string[] => {
  const scopes = input.naming.parts.toolScopes.get(input.tool) ?? new Set();
  const named = new Set<string>();

  for (const line of input.text.split('\n')) {
    if (input.isCodeOnly && isComment(line)) {
      continue;
    }

    for (const scope of scopes) {
      for (const part of namedInLine({
        line,
        naming: input.naming,
        prefix: `${PRESETS}${scope}/${input.tool}/`,
        scope,
      })) {
        named.add(part);
      }
    }
  }

  return [
    ...named,
  ];
};

export type { Naming };
export { isAnchored, isComment, namedOf };
