import type { PartialStrykerOptions } from '@stryker-mutator/api/core';
import type { Ignorer, NodePath } from '@stryker-mutator/api/ignore';
import type { FactoryPlugin } from '@stryker-mutator/api/plugin';
import { commonTokens, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { z } from 'zod';

import { problemPathsOf } from '#/libs/schemas';

import { DiagnosticsSettingError, DiagnosticsSettingFailure } from './diagnostics-setting.error.ts';

// The ignorer's own key in the Stryker configuration, a table each part of a configuration may add to.
const OPTIONS_KEY = 'diagnosticsTextArguments';

// A shape opened by this word is a constructor's, as in `new *Error`; `*` stands for any letters.
const CONSTRUCTOR = 'new ';
const ANY = '*';
const SUPER_NAME = 'super';

// A file of the text a person reads and the templates that fill it, as core names it: `<name>.messages.<ext>`.
const MESSAGES_FILE_PATTERN = /\.messages\.[^./]+$/;
const textNodeTypes: ReadonlySet<unknown> = new Set([
  'StringLiteral',
  'TemplateLiteral',
]);

// The calls whose arguments, at the indexes given, are text only a person reads.
interface CallShape {
  readonly indexes: ReadonlySet<number>;
  readonly isConstructor: boolean;
  readonly namePattern: RegExp;
}

// Stryker hands Babel's paths over as an opaque NodePath, so their fields are read as unknown.
const fieldOf = (holder: unknown, key: string): unknown =>
  holder instanceof Object ? Reflect.get(holder, key) : undefined;

const isOfType = (node: unknown, type: string): boolean => fieldOf(node, 'type') === type;

const nameOf = (node: unknown): unknown =>
  isOfType(node, 'Identifier') ? fieldOf(node, 'name') : undefined;

const propertyOf = (node: unknown): unknown =>
  isOfType(node, 'MemberExpression') && fieldOf(node, 'computed') === false
    ? nameOf(fieldOf(node, 'property'))
    : undefined;

// An argument at a text's index is the text, or what builds it, unless it is an object or a list,
// which carries data a caller reads.
const isText = (node: unknown): boolean =>
  !(isOfType(node, 'ObjectExpression') || isOfType(node, 'ArrayExpression'));

const patternOf = (glob: string): RegExp =>
  new RegExp(`^${glob.split(ANY).map(RegExp.escape).join('.*')}$`);

const diagnosticsOptionsModel = z.object({
  [OPTIONS_KEY]: z
    .record(
      z.string(),
      z.union([
        z.int(),
        z.array(z.int()),
      ]),
    )
    .default({}),
});

const shapeOf = ([shape, indexes]: readonly [
  string,
  number | readonly number[],
]): CallShape => {
  const isConstructor = shape.startsWith(CONSTRUCTOR);

  return {
    indexes: new Set(
      [
        indexes,
      ].flat(),
    ),
    isConstructor,
    namePattern: patternOf(isConstructor ? shape.slice(CONSTRUCTOR.length) : shape),
  };
};

/** @throws DiagnosticsSettingError when the setting is no table of shapes to indexes */
const shapesOf = (options: PartialStrykerOptions): readonly CallShape[] => {
  const parsing = diagnosticsOptionsModel.safeParse(options);

  if (!parsing.success) {
    throw new DiagnosticsSettingError({
      code: DiagnosticsSettingFailure.Malformed,
      problemPaths: problemPathsOf(parsing.error),
    });
  }

  return Object.entries(parsing.data[OPTIONS_KEY]).map(shapeOf);
};

// A call of the parent class's constructor names it `super`, as a shape does.
const calleeNameOf = (call: unknown): unknown => {
  const callee = fieldOf(call, 'callee');

  return isOfType(callee, 'Super') ? SUPER_NAME : (nameOf(callee) ?? propertyOf(callee));
};

interface ArgumentInput {
  readonly path: NodePath;
  readonly shapes: readonly CallShape[];
}

const isTextArgument = (input: ArgumentInput): boolean => {
  const { path } = input;
  const key = fieldOf(path, 'key');
  const call = fieldOf(fieldOf(path, 'parentPath'), 'node');
  const isConstructor = isOfType(call, 'NewExpression');
  const calleeName = calleeNameOf(call);

  return (
    isText(fieldOf(path, 'node')) &&
    fieldOf(path, 'listKey') === 'arguments' &&
    (isConstructor || isOfType(call, 'CallExpression')) &&
    typeof calleeName === 'string' &&
    input.shapes.some(
      (shape) =>
        shape.isConstructor === isConstructor &&
        // Stryker disable next-line ConditionalExpression: the set holds only numbers, so `has` refuses any other key itself and the check only narrows the type
        typeof key === 'number' &&
        shape.indexes.has(key) &&
        shape.namePattern.test(calleeName),
    )
  );
};

// Babel's path reaches the file it walks through its hub, where Stryker names the file it mutates.
const isMessagesFileText = (path: NodePath): boolean =>
  textNodeTypes.has(fieldOf(fieldOf(path, 'node'), 'type')) &&
  MESSAGES_FILE_PATTERN.test(
    String(fieldOf(fieldOf(fieldOf(fieldOf(path, 'hub'), 'file'), 'opts'), 'filename')),
  );

/**
 * Leaves out the string and template mutants of a `.messages` file, and the mutants of the text a
 * call takes that only a person reads: the argument at an index the configuration's
 * `diagnosticsTextArguments` gives the call's shape, a function's or a method's name, `super`, or
 * a constructor's after `new `, each with `*` for any letters.
 *
 * @throws DiagnosticsSettingError when the setting is no table of shapes to indexes
 */
const createDiagnostics = (options: PartialStrykerOptions): Ignorer => {
  const shapes = shapesOf(options);

  return {
    shouldIgnore: (path: NodePath): string | undefined =>
      isMessagesFileText(path) ||
      isTextArgument({
        path,
        shapes,
      })
        ? 'Text only a person reads: no caller relies on it'
        : undefined,
  };
};

createDiagnostics.inject = tokens(commonTokens.options);

// Stryker warns of a key no plugin declares; the key's value is read as unknown, so it takes no shape.
const STRYKER_VALIDATION_SCHEMA = {
  properties: {
    [OPTIONS_KEY]: {},
  },
} as const;

const STRYKER_PLUGINS = [
  {
    factory: createDiagnostics,
    kind: PluginKind.Ignore,
    name: 'diagnostics',
  } satisfies FactoryPlugin<
    PluginKind.Ignore,
    [
      typeof commonTokens.options,
    ]
  >,
] as const;

export { STRYKER_PLUGINS as strykerPlugins, STRYKER_VALIDATION_SCHEMA as strykerValidationSchema };
