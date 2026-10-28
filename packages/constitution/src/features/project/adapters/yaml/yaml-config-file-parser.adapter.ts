import type { Document } from 'yaml';
import { isAlias, isNode, isScalar, LineCounter, parseDocument, Scalar, visit } from 'yaml';
import type { z } from 'zod';

import type { ListKey, RequiredConfigKey } from '#/kernel/constants';
import { ConfigKey, LIST_KEYS, REQUIRED_CONFIG_KEYS } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import { fieldsOf } from '#/kernel/utils';

import type { ConfigParser } from '../../domain/contracts';
import type { ConfigRead, DeclaredUnit } from '../../domain/entities';
import { ConfigOverride } from '../../domain/entities';
import type { ConfigFileWire } from './models';
import { configFileModel } from './models';

const FIRST_LINE = 1;
const blockScalars: ReadonlySet<string | undefined> = new Set([
  Scalar.BLOCK_FOLDED,
  Scalar.BLOCK_LITERAL,
]);
const listKeys: ReadonlySet<string> = new Set(LIST_KEYS);

const isListKey = (key: string): key is ListKey => listKeys.has(key);

const requiredKeys: ReadonlySet<string> = new Set(REQUIRED_CONFIG_KEYS);

const isRequiredKey = (key: string): key is RequiredConfigKey => requiredKeys.has(key);

// A value reads where it is written: no anchor or alias takes it from elsewhere, no tag retypes it
// and no block scalar runs it over the lines below.
const isRefused = (node: unknown): boolean =>
  isAlias(node) ||
  (isNode(node) &&
    (node.anchor !== undefined ||
      node.tag !== undefined ||
      (isScalar(node) && blockScalars.has(node.type))));

const refusedNodesOf = (document: Document): readonly unknown[] => {
  const refused: unknown[] = [];

  visit(document, (_key, node) => {
    if (isRefused(node)) {
      refused.push(node);
    }
  });

  return refused;
};

// The values of the file with its aliases left out, as one without its anchor cannot be read, so
// none is expanded.
const writtenOf = (document: Document): unknown => {
  const withoutAliases = document.clone();

  visit(withoutAliases, (_key, node) => (isAlias(node) ? visit.REMOVE : undefined));

  // Stryker disable next-line ObjectLiteral: every alias is left out above, so the bound only states it
  return withoutAliases.toJS({
    maxAliasCount: 0,
  });
};

// An issue of a field the schema does not know names the object; the field's own path names its line.
const pathsOf = (issue: z.core.$ZodIssue): readonly (readonly PropertyKey[])[] =>
  issue.code === 'unrecognized_keys'
    ? issue.keys.map((key) => [
        ...issue.path,
        key,
      ])
    : [
        issue.path,
      ];

const configOf = (input: {
  document: Document;
  keys: readonly string[];
  lineOf: (node: unknown) => number;
  wire: ConfigFileWire;
}): DeclaredUnit['config'] => {
  const { document, keys, wire } = input;
  const name = wire[ConfigKey.Name];
  const overrides = (wire[ConfigKey.Overrides] ?? []).map(
    (override, index): ConfigOverride =>
      ConfigOverride.create({
        level: override.level,
        line: input.lineOf(
          document.getIn([
            ConfigKey.Overrides,
            index,
          ]),
        ),
        reason: override.reason,
        rule: override.rule,
        until: override.until,
      }),
  );

  return {
    empties: keys.filter(isRequiredKey).filter((key) => wire[key] === null),
    items: keys.filter(isListKey).flatMap((key) =>
      // Stryker disable next-line ArrayDeclaration: a key the file writes holds its list, so the default only meets the type
      (wire[key] ?? []).map((text) => ({
        key,
        text,
      })),
    ),
    keys,
    ...(name === undefined
      ? {}
      : {
          name,
        }),
    overrides,
  };
};

const parse = (text: string): ConfigRead => {
  const lineCounter = new LineCounter();
  const document = parseDocument(text, {
    lineCounter,
    // Stryker disable next-line StringLiteral: YAML 1.2 reads by the core schema where none is named
    schema: 'core',
  });

  const lineOf = (node: unknown): number =>
    // Stryker disable next-line ConditionalExpression,LogicalOperator: every node a path or a visit reaches is parsed, with its range, so the test only narrows the type
    isNode(node) && node.range !== undefined && node.range !== null
      ? lineCounter.linePos(node.range[0]).line
      : FIRST_LINE;

  const written = writtenOf(document);
  const read = configFileModel.safeParse(written);
  const lines = [
    ...document.errors.map((error) => lineCounter.linePos(error.pos[0]).line),
    ...refusedNodesOf(document).map(lineOf),
    ...(read.success
      ? []
      : read.error.issues.flatMap(pathsOf).map((path) => lineOf(document.getIn(path, true)))),
  ];

  if (!read.success || lines.length > 0) {
    return {
      lines: [
        ...new Set(lines),
      ].toSorted((left, right) => left - right),
      status: ConfigReadStatus.Unparsed,
    };
  }

  return {
    config: configOf({
      document,
      keys: [
        ...fieldsOf(written).keys(),
      ],
      lineOf,
      wire: read.data ?? {},
    }),
    status: ConfigReadStatus.Parsed,
  };
};

const createYamlConfigFileParser = (): ConfigParser => ({
  parse,
});

export { createYamlConfigFileParser };
