import type { Document, Node, YAMLMap } from 'yaml';
import { isMap, isNode, isScalar, isSeq, parseDocument } from 'yaml';

import { attempted, isDeepEqual } from '#/kernel/utils';

import type { Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { SettingsText } from './settings-text.types';
import { settingOfWire } from './wire-setting.utils';

const OPTIONS = {
  schema: 'core',
  version: '1.2',
} as const;
const MAX_ALIASES = 1000;
// A word YAML 1.1 reads as a boolean is quoted, so a reader of YAML 1.1 reads it as a string too.
const YAML_11_BOOLEAN = /^(?:y|yes|n|no|on|off|true|false)$/i;

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

// A node the file did not hold is written as a catalogue writes it: a word YAML 1.1 reads as a truth
// quoted, a text of lines as a literal block, which the parser's writer gives it by itself.
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

  // Stryker disable next-line ConditionalExpression,LogicalOperator: a scalar of no text takes no quotes, whatever its type says
  if (isScalar(node) && typeof node.value === 'string' && YAML_11_BOOLEAN.test(node.value)) {
    node.type = 'QUOTE_SINGLE';
  }
};

const nodeOf = (document: Document, setting: Setting): Node => {
  const node = document.createNode(setting);

  styled(node);

  return node;
};

const keysOf = (node: YAMLMap): readonly unknown[] =>
  node.items.map((pair) => (isScalar(pair.key) ? pair.key.value : pair.key));

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

const writeYaml = (input: SettingsText): string => {
  const document = parseDocument(input.text, OPTIONS);

  lay({
    after: input.settings,
    before: settingOfDocument(document),
    document,
    path: [],
  });

  return document.toString({
    // A width of 0 folds no line.
    lineWidth: 0,
  });
};

export { readYaml, writeYaml };
