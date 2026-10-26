import type { Document, Node, Pair, YAMLMap } from 'yaml';
import { isMap, isNode, isScalar, isSeq, parseDocument, visit } from 'yaml';

import { attempted, compareText, isDeepEqual } from '#/kernel/utils';

import type { HeldStep, Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { anchorAt, lineAt, withBlockComments } from './block-comments.utils';
import type { SettingsText } from './settings-text.types';
import { settingOfWire } from './wire-setting.utils';

const OPTIONS = {
  schema: 'core',
  version: '1.2',
} as const;
const MAX_ALIASES = 1000;
// A word YAML 1.1 reads as a boolean is quoted, so a reader of YAML 1.1 reads it as a string too.
const YAML_11_BOOLEAN = /^(?:y|yes|n|no|on|off|true|false)$/i;
// The width the formatters keep.
const LINE_WIDTH = 100;
const LONG_TEXT = 80;
const NEWLINE = '\n';
// Indent, and the dashes of sequences that open on the same line.
const LINE_START = /^\s*(?:- )*$/;

const documentOf = (text: string): Document | undefined => {
  const document = parseDocument(text, OPTIONS);

  return document.errors.length === 0 ? document : undefined;
};

// The parser refuses a document whose aliases expand past the bound with a ReferenceError.
const isAliasExcess = (error: unknown): error is ReferenceError => error instanceof ReferenceError;

const settingOfDocument = (document: Document): Setting | undefined => {
  if (document.contents === null) {
    return {};
  }

  const wire = attempted<unknown>({
    effect: () =>
      document.toJS({
        maxAliasCount: MAX_ALIASES,
      }),
    isRecognised: isAliasExcess,
  });

  return settingOfWire(wire);
};

const readYaml = (text: string): Setting | undefined => {
  const document = documentOf(text);

  return document === undefined ? undefined : settingOfDocument(document);
};

// A node the file did not hold is written as a preset file writes it; the parser's writer gives a
// text of lines its literal block by itself.
const styled = (node: unknown): void => {
  if (isMap(node)) {
    for (const pair of node.items) {
      styled(pair.key);
      styled(pair.value);
    }

    return;
  }

  if (isSeq(node)) {
    for (const listed of node.items) {
      styled(listed);
    }

    return;
  }

  // Stryker disable next-line ConditionalExpression,LogicalOperator,BlockStatement: a node of no text is left unstyled either way
  if (!(isScalar(node) && typeof node.value === 'string')) {
    return;
  }

  if (YAML_11_BOOLEAN.test(node.value)) {
    node.type = 'QUOTE_SINGLE';
  }

  if (node.value.length > LONG_TEXT && !node.value.includes(NEWLINE)) {
    node.type = 'BLOCK_FOLDED';
  }
};

const nodeOf = (document: Document, setting: Setting): Node => {
  const node = document.createNode(setting);

  styled(node);

  return node;
};

const keyOfPair = (pair: Pair): unknown => (isScalar(pair.key) ? pair.key.value : pair.key);

const keysOf = (node: YAMLMap): readonly unknown[] => node.items.map(keyOfPair);

// The settings laid on the document: only what changed is touched, so the file's comments stay; a
// list keeps the nodes of the items it keeps, and a value the settings cannot hold is left alone.
const lay = (input: {
  after: Setting;
  before: Setting | undefined;
  document: Document;
  path: readonly string[];
}): void => {
  const { after, before, document, path } = input;
  const node = document.getIn(path, true);

  // Stryker disable next-line ConditionalExpression,BlockStatement: equal settings laid again change no node
  if (isDeepEqual(before, after)) {
    return;
  }

  if (Settings.isMap(before) && Settings.isMap(after) && isMap(node)) {
    for (const key of keysOf(node).filter(
      (held) => String(held) in before && !(String(held) in after),
    )) {
      document.deleteIn([
        ...path,
        key,
      ]);
    }

    for (const [key, held] of Object.entries(after)) {
      lay({
        after: held,
        before: before[key],
        document,
        path: [
          ...path,
          key,
        ],
      });
    }

    return;
  }

  if (Settings.isList(after) && Settings.isList(before) && isSeq(node)) {
    const left = [
      ...node.items,
    ];

    node.items = after.map((listed) => {
      const at = left.findIndex((known) =>
        // Stryker disable next-line ConditionalExpression: the test only narrows the type
        isDeepEqual(settingOfWire(isNode(known) ? known.toJS(document) : known), listed),
      );

      return at < 0 ? nodeOf(document, listed) : left.splice(at, 1)[0];
    });

    return;
  }

  // A scalar takes its new value in place, so its comment stays.
  if (isScalar(node) && Settings.isScalar(after)) {
    node.value = after;

    return;
  }

  document.setIn(path, nodeOf(document, after));
};

interface Child {
  readonly held: unknown;
  /** where the key or the item begins */
  readonly offset: number;
  readonly step: HeldStep;
}

// Stryker disable next-line ConditionalExpression,OptionalChaining,LogicalOperator: a parsed key or item is a node with its range
const startOf = (node: unknown): number => (isNode(node) ? (node.range?.[0] ?? 0) : 0);

const childrenOf = (node: unknown, document: Document): readonly Child[] => {
  if (isMap(node)) {
    return node.items.map((pair) => ({
      held: pair.value,
      offset: startOf(pair.key),
      step: {
        key: String(keyOfPair(pair)),
      },
    }));
  }

  return isSeq(node)
    ? node.items.flatMap((listed): readonly Child[] => {
        // Stryker disable next-line ConditionalExpression: an item of a parsed sequence is a node; the test only narrows the type
        const setting = settingOfWire(isNode(listed) ? listed.toJS(document) : listed);

        return setting === undefined
          ? []
          : [
              {
                held: listed,
                offset: startOf(listed),
                step: {
                  item: setting,
                },
              },
            ];
      })
    : [];
};

const yamlAnchorsOf = (text: string): readonly Anchor[] => {
  const document = parseDocument(text, OPTIONS);

  const walk = (node: unknown, path: readonly HeldStep[]): readonly Anchor[] =>
    childrenOf(node, document).flatMap((child) => {
      const at = [
        ...path,
        child.step,
      ];

      return [
        ...anchorAt({
          lineStart: LINE_START,
          offset: child.offset,
          path: at,
          text,
        }),
        ...walk(child.held, at),
      ];
    });

  return walk(document.contents, []);
};

const indentOf = (line: string): number => line.length - line.trimStart().length;

// A literal or folded block runs on over the lines indented deeper than the one it opens on, its
// blank lines among them.
const blockEndOf = (lines: readonly string[], first: number): number => {
  let last = first;

  // past the last line String() gives a word, which ends the run
  while (
    // Stryker disable next-line MethodExpression: the writer writes a block's blank line bare
    String(lines[last + 1]).trim() === '' ||
    indentOf(String(lines[last + 1])) > indentOf(String(lines[first]))
  ) {
    last += 1;
  }

  return last;
};

const yamlTextLinesOf = (text: string): ReadonlySet<number> => {
  const lines = text.split(NEWLINE);
  const texts = new Set<number>();

  visit(parseDocument(text, OPTIONS), (_key, node) => {
    if (!isScalar(node)) {
      return;
    }

    // Stryker disable next-line ArrayDeclaration,LogicalOperator: a parsed scalar holds its range
    const [start = 0, end = 0] = node.range ?? [];
    const first = lineAt(text, start);
    const last =
      node.type === 'BLOCK_LITERAL' || node.type === 'BLOCK_FOLDED'
        ? blockEndOf(lines, first)
        : lineAt(text, end);

    for (let line = first; line <= last; line += 1) {
      texts.add(line);
    }
  });

  return texts;
};

const yamlCommenting: Commenting = {
  anchorsOf: yamlAnchorsOf,
  prefix: '#',
  textLinesOf: yamlTextLinesOf,
};

const writeSettings = (input: SettingsText): string => {
  const document = parseDocument(input.text, OPTIONS);

  lay({
    after: input.settings,
    before: settingOfDocument(document),
    document,
    path: [],
  });

  // a map kept sorted keeps its pairs' nodes and comments
  for (const path of input.sorted) {
    const node = document.getIn(path);

    if (isMap(node)) {
      node.items = node.items.toSorted((left, right) =>
        compareText(String(keyOfPair(left)), String(keyOfPair(right))),
      );
    }
  }

  // As the formatter writes YAML.
  return document.toString({
    lineWidth: LINE_WIDTH,
    singleQuote: true,
  });
};

const writeYaml = withBlockComments({
  commenting: yamlCommenting,
  write: writeSettings,
});

export { readYaml, writeYaml };
