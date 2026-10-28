import type { Scalar, ScalarTag, YAMLMap, YAMLSeq } from 'yaml';
import { isAlias, isMap, isScalar, isSeq, LineCounter, parseDocument, Schema } from 'yaml';

import { recognisedFailure } from '#/kernel/utils';

import type { PresetFileParser, PresetFileRead } from '../../domain/contracts';
import { PresetFileReadStatus } from '../../domain/contracts';
import type { PresetValue, Setting } from '../../domain/entities';
import { PresetValue as Value, ValueKind } from '../../domain/entities';
import type { PresetFileRefusal } from './errors';
import { isPresetFileRefusal, PresetFileRefusal as Refusal } from './errors';

type ValueNode = Scalar | YAMLMap | YAMLSeq;

const marks: Readonly<Record<string, ValueKind.Default | ValueKind.Replace>> = {
  '!default': ValueKind.Default,
  '!replace': ValueKind.Replace,
};
const SORTED = '!sorted';
const WORDS = '!words';
const CORE_TAG = 'tag:yaml.org,2002:';
const PLAIN_SCALAR = 'PLAIN';
// Stryker disable next-line ObjectLiteral: a schema named by no option is the core schema
const coreSchema = new Schema({
  // Stryker disable next-line StringLiteral: a schema named by an empty text is the core schema
  schema: 'core',
});
// The core schema's tags that tell a plain scalar's type by its text, as the parser picks them.
const plainTags = coreSchema.tags.filter(
  (
    tag,
  ): tag is ScalarTag & {
    readonly test: RegExp;
  } => tag.test !== undefined,
);

const refusalAt = (offset: number): PresetFileRefusal =>
  new Refusal({
    offset,
  });

// An alias, or a value left empty, is no node a preset file writes; the offset of an empty value is
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

// A plain scalar's text read by the core schema, as an untagged one is: a text no tag tests is a
// string, and a tag resolves to a value or to a scalar holding it. The core schema's tags report no
// error, so the message sink is String, which drops it; a function of our own would never run.
const plainValueOf = (text: string): unknown => {
  const resolved = plainTags.find((one) => one.test.test(text))?.resolve(text, String, {});

  return isScalar(resolved) ? resolved.value : (resolved ?? text);
};

// A scalar a mark tags is left unresolved by the parser, so its text is read by the core schema.
const scalarOf = (node: Scalar): Setting => {
  const read: unknown =
    isCoreTagged(node) || node.type !== PLAIN_SCALAR
      ? node.value
      : plainValueOf(String(node.value));

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
      isWords: false,
      kind: mark,
      setting: contentOf(node),
    };
  }

  const isSorted = node.tag === SORTED && isMap(node);
  const isWords = node.tag === WORDS && isSeq(node);

  if (!(isCoreTagged(node) || isSorted || isWords)) {
    throw refusalAt(near);
  }

  if (isWords) {
    return Value.wordsOf(node.items.map((listed) => settingOf(nodeOf(listed, near))));
  }

  if (!isMap(node)) {
    return Value.plain(contentOf(node));
  }

  const pairs = node.items.map((pair) => ({
    key: keyOf(pair.key, near),
    value: presetOf(nodeOf(pair.value, near)),
  }));

  return isSorted ? Value.sortedMapOf(pairs) : Value.mapOf(pairs);
};

/**
 * A preset file as YAML 1.2 by its core schema writes it, with no custom tag given to the parser: the
 * marks are read from the nodes' own tags, `!sorted` a map's alone and `!words` a list's alone, and
 * an alias is refused, so none is expanded.
 */
const parse = (text: string): PresetFileRead => {
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
      status: PresetFileReadStatus.Unparsed,
    };
  }

  try {
    return {
      status: PresetFileReadStatus.Parsed,
      value: document.contents === null ? Value.mapOf([]) : presetOf(nodeOf(document.contents, 0)),
    };
  } catch (failure) {
    return {
      line: lineCounter.linePos(
        recognisedFailure({
          error: failure,
          isRecognised: isPresetFileRefusal,
        }).details.offset,
      ).line,
      status: PresetFileReadStatus.Unparsed,
    };
  }
};

const createYamlPresetFileParser = (): PresetFileParser => ({
  parse,
});

export { createYamlPresetFileParser };
