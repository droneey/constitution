import type { Scalar, ScalarTag, YAMLMap, YAMLSeq } from 'yaml';
import { isAlias, isMap, isScalar, isSeq, LineCounter, parseDocument, Schema } from 'yaml';

import { recognisedFailure } from '#/kernel/utils';
import { YAML_READ_OPTIONS } from '#/libs/yaml-reading';

import type { PresetFileParser, PresetFileRead } from '../../application/contracts';
import { PresetFileReadStatus } from '../../application/contracts';
import type { PresetValue, Setting } from '../../domain/setting/entities';
import { Joining, PresetValue as Value, ValueKind } from '../../domain/setting/entities';
import { SettingKey } from '../../domain/shared/value-objects';
import type { PresetFileRefusal } from './errors';
import { isPresetFileRefusal, PresetFileRefusal as Refusal } from './errors';

type ValueNode = Scalar | YAMLMap | YAMLSeq;

type Mark = ValueKind.Copy | ValueKind.Default | ValueKind.Inherit | ValueKind.Replace;

const marks: Readonly<Record<string, Mark>> = {
  '!copy': ValueKind.Copy,
  '!default': ValueKind.Default,
  '!inherits': ValueKind.Inherit,
  '!replace': ValueKind.Replace,
};
const SORTED = '!sorted';
const WORDS = '!words';
const COMMANDS = '!commands';
const WHOLE = '!whole';
// Why: a preset is keyed by block, rule and language, so a language's value, the settings that hold
// its rule for that language, sits three maps below the document's.
const LANGUAGE_VALUE_DEPTH = 3;
const CORE_TAG = 'tag:yaml.org,2002:';
const PLAIN_SCALAR = 'PLAIN';
// Stryker disable next-line ObjectLiteral: a schema named by no option is the core schema
const coreSchema = new Schema({
  // Stryker disable next-line StringLiteral: a schema named by an empty text is the core schema
  schema: 'core',
});
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

/** @throws {PresetFileRefusal} when the value is an alias or left empty */
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

const markOf = (node: ValueNode): Mark | undefined =>
  // Stryker disable next-line ConditionalExpression: no mark is keyed by an absent tag
  node.tag === undefined ? undefined : marks[node.tag];

// Why: the core schema's tags report no error, so the message sink is String, which drops it; a
// function of our own would never run.
const plainValueOf = (text: string): unknown => {
  const resolved = plainTags.find((one) => one.test.test(text))?.resolve(text, String, {});

  return isScalar(resolved) ? resolved.value : (resolved ?? text);
};

// Why: the parser leaves a scalar a mark tags unresolved, so its text is read by the core schema.
/** @throws {PresetFileRefusal} when the scalar holds no text, number or truth */
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

/** @throws {PresetFileRefusal} when the key is no text or number */
const keyOf = (node: unknown, near: number): string => {
  const key = nodeOf(node, near);

  if (isScalar(key) && (typeof key.value === 'string' || typeof key.value === 'number')) {
    return String(key.value);
  }

  throw refusalAt(offsetOf(key));
};

/** @throws {PresetFileRefusal} when a key is no text or number */
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

/** @throws {PresetFileRefusal} when the node holds a tag or a mark */
const settingOf = (node: ValueNode): Setting => {
  if (!isCoreTagged(node)) {
    throw refusalAt(offsetOf(node));
  }

  return contentOf(node);
};

// Why: a command whose words a block fills at its slots, such as the members a run skips, is a
// list of words within the list of commands.
/** @throws {PresetFileRefusal} when the node holds a tag or a mark but the words mark on a list */
const commandOf = (node: ValueNode): Setting => {
  const near = offsetOf(node);

  return node.tag === WORDS && isSeq(node)
    ? node.items.map((listed) => settingOf(nodeOf(listed, near)))
    : settingOf(node);
};

/**
 * @throws {PresetFileRefusal} when the node holds a tag the grammar refuses, a key
 * `list[slot=<name>]` holds more than inserts, a copy holds no text, or a mark of a whole hold
 * tags anything but a language's map of settings
 */
const presetOf = (node: ValueNode, depth: number): PresetValue => {
  const mark = markOf(node);
  const near = offsetOf(node);

  if (mark === ValueKind.Copy && !isScalar(node)) {
    throw refusalAt(near);
  }

  if (mark !== undefined) {
    return {
      joining: Joining.None,
      kind: mark,
      setting: contentOf(node),
    };
  }

  const isSorted = node.tag === SORTED && isMap(node);
  const isWords = node.tag === WORDS && isSeq(node);
  const isCommands = node.tag === COMMANDS && isSeq(node);
  const isWhole = node.tag === WHOLE && isMap(node) && depth === LANGUAGE_VALUE_DEPTH;

  if (!(isCoreTagged(node) || isSorted || isWords || isCommands || isWhole)) {
    throw refusalAt(near);
  }

  if (isWords) {
    return Value.wordsOf(node.items.map((listed) => settingOf(nodeOf(listed, near))));
  }

  if (isCommands) {
    return Value.commandsOf(node.items.map((listed) => commandOf(nodeOf(listed, near))));
  }

  if (!isMap(node)) {
    return Value.plain(contentOf(node));
  }

  const pairs = node.items.map((pair) => {
    const key = keyOf(pair.key, near);
    const preset = presetOf(nodeOf(pair.value, near), depth + 1);

    if (SettingKey.slotAddressOf(key) !== undefined && !Value.isInsertOnly(preset)) {
      throw refusalAt(offsetOf(nodeOf(pair.key, near)));
    }

    return {
      key,
      value: preset,
    };
  });

  if (isWhole) {
    return Value.wholeMapOf(pairs);
  }

  return isSorted ? Value.sortedMapOf(pairs) : Value.mapOf(pairs);
};

const parse = (text: string): PresetFileRead => {
  const lineCounter = new LineCounter();
  const document = parseDocument(text, {
    lineCounter,
    ...YAML_READ_OPTIONS,
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
      value:
        document.contents === null ? Value.mapOf([]) : presetOf(nodeOf(document.contents, 0), 0),
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
