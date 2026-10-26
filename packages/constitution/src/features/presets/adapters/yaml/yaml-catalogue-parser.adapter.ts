import type { Scalar, YAMLMap, YAMLSeq } from 'yaml';
import {
  isAlias,
  isMap,
  isScalar,
  isSeq,
  LineCounter,
  parseDocument,
  parse as parseText,
} from 'yaml';

import { recognisedFailure } from '#/kernel/utils';

import type { CatalogueParser, CatalogueRead } from '../../domain/contracts';
import { CatalogueReadStatus } from '../../domain/contracts';
import type { PresetValue, Setting } from '../../domain/entities';
import { PresetValue as Value, ValueKind } from '../../domain/entities';
import type { CatalogueRefusal } from './errors';
import { isCatalogueRefusal, CatalogueRefusal as Refusal } from './errors';

type ValueNode = Scalar | YAMLMap | YAMLSeq;

const marks: Readonly<Record<string, ValueKind.Default | ValueKind.Replace>> = {
  '!default': ValueKind.Default,
  '!replace': ValueKind.Replace,
};
const CORE_TAG = 'tag:yaml.org,2002:';
const PLAIN_SCALAR = 'PLAIN';

const refusalAt = (offset: number): CatalogueRefusal =>
  new Refusal({
    offset,
  });

// An alias, or a value left empty, is no node a catalogue writes; the offset of an empty value is
// its holder's.
const nodeOf = (candidate: unknown, near: number): ValueNode => {
  // Stryker disable next-line ConditionalExpression: an alias, the only value that is no node, is refused at its own offset either way
  if (isMap(candidate) || isSeq(candidate) || isScalar(candidate)) {
    return candidate;
  }

  // Stryker disable next-line OptionalChaining: an alias the parser made always has a range
  throw refusalAt(isAlias(candidate) ? (candidate.range?.[0] ?? near) : near);
};

// Stryker disable next-line OptionalChaining: a node the parser made always has a range
const offsetOf = (node: ValueNode): number => node.range?.[0] ?? 0;

const isCoreTagged = (node: ValueNode): boolean =>
  node.tag === undefined || node.tag.startsWith(CORE_TAG);

const markOf = (node: ValueNode): ValueKind.Default | ValueKind.Replace | undefined =>
  // Stryker disable next-line ConditionalExpression: no mark is keyed by an absent tag
  node.tag === undefined ? undefined : marks[node.tag];

// A scalar a mark tags is left unresolved by the parser, so its text is read by the core schema.
const scalarOf = (node: Scalar): Setting => {
  const read: unknown =
    isCoreTagged(node) || node.type !== PLAIN_SCALAR ? node.value : parseText(String(node.value));

  if (typeof read === 'string' || typeof read === 'number' || typeof read === 'boolean') {
    return read;
  }

  throw refusalAt(offsetOf(node));
};

const keyOf = (node: unknown, near: number): string => {
  const key = nodeOf(node, near);

  if (isScalar(key) && (typeof key.value === 'string' || typeof key.value === 'number')) {
    return String(key.value);
  }

  throw refusalAt(offsetOf(key));
};

const contentOf = (node: ValueNode): Setting => {
  const near = offsetOf(node);

  if (isMap(node)) {
    return Object.fromEntries(
      node.items.map(
        (
          pair,
        ): [
          string,
          Setting,
        ] => [
          keyOf(pair.key, near),
          settingOf(nodeOf(pair.value, near)),
        ],
      ),
    );
  }

  return isSeq(node) ? node.items.map((listed) => settingOf(nodeOf(listed, near))) : scalarOf(node);
};

const settingOf = (node: ValueNode): Setting => {
  if (!isCoreTagged(node)) {
    throw refusalAt(offsetOf(node));
  }

  return contentOf(node);
};

const presetOf = (node: ValueNode): PresetValue => {
  const mark = markOf(node);
  const near = offsetOf(node);

  if (mark !== undefined) {
    return {
      kind: mark,
      setting: contentOf(node),
    };
  }

  if (!isCoreTagged(node)) {
    throw refusalAt(near);
  }

  return isMap(node)
    ? Value.mapOf(
        node.items.map((pair) => ({
          key: keyOf(pair.key, near),
          value: presetOf(nodeOf(pair.value, near)),
        })),
      )
    : Value.plain(contentOf(node));
};

/**
 * A catalogue as YAML 1.2 by its core schema writes it, with no custom tag given to the parser: the
 * marks are read from the nodes' own tags, and an alias is refused, so none is expanded.
 */
const parse = (text: string): CatalogueRead => {
  const lineCounter = new LineCounter();
  const document = parseDocument(text, {
    lineCounter,
    // Stryker disable next-line BooleanLiteral: the line comes from the error's offset, which pretty errors keep
    prettyErrors: false,
    // Stryker disable next-line StringLiteral: YAML 1.2 reads by the core schema where none is named
    schema: 'core',
    uniqueKeys: true,
    version: '1.2',
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      line: lineCounter.linePos(error.pos[0]).line,
      status: CatalogueReadStatus.Unparsed,
    };
  }

  try {
    return {
      status: CatalogueReadStatus.Parsed,
      value: document.contents === null ? Value.mapOf([]) : presetOf(nodeOf(document.contents, 0)),
    };
  } catch (failure) {
    recognisedFailure({
      error: failure,
      isRecognised: isCatalogueRefusal,
    });

    return {
      // Stryker disable next-line ConditionalExpression: any other failure was rethrown above
      line: lineCounter.linePos(isCatalogueRefusal(failure) ? failure.details.offset : 0).line,
      status: CatalogueReadStatus.Unparsed,
    };
  }
};

const createYamlCatalogueParser = (): CatalogueParser => ({
  parse,
});

export { createYamlCatalogueParser };
