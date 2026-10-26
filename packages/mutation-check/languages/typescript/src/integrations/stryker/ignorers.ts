import type { PartialStrykerOptions } from '@stryker-mutator/api/core';
import type { Ignorer, NodePath } from '@stryker-mutator/api/ignore';
import type { FactoryPlugin } from '@stryker-mutator/api/plugin';
import { commonTokens, PluginKind, tokens } from '@stryker-mutator/api/plugin';

// The ignorer's own key in the Stryker configuration, a table each part of a configuration may add to.
const OPTIONS_KEY = 'diagnosticsTextArguments';

// A shape opened by this word is a constructor's, as in `new *Error`; `*` stands for any letters.
const CONSTRUCTOR = 'new ';
const ANY = '*';

// The calls whose arguments, at the indexes given, are text only a person reads.
interface CallShape {
  readonly indexes: ReadonlySet<unknown>;
  readonly isConstructor: boolean;
  readonly name: RegExp;
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

const shapeOf = ([shape, indexes]: readonly [
  string,
  unknown,
]): CallShape => {
  const isConstructor = shape.startsWith(CONSTRUCTOR);

  return {
    indexes: new Set(
      Array.isArray(indexes)
        ? indexes
        : [
            indexes,
          ],
    ),
    isConstructor,
    name: patternOf(isConstructor ? shape.slice(CONSTRUCTOR.length) : shape),
  };
};

const shapesOf = (options: PartialStrykerOptions): readonly CallShape[] => {
  const given = fieldOf(options, OPTIONS_KEY);

  return Object.entries(given instanceof Object ? given : {}).map(shapeOf);
};

const calleeNameOf = (call: unknown): unknown => {
  const callee = fieldOf(call, 'callee');

  return nameOf(callee) ?? propertyOf(callee);
};

interface ArgumentInput {
  readonly path: NodePath;
  readonly shapes: readonly CallShape[];
}

const isTextArgument = (input: ArgumentInput): boolean => {
  const { path } = input;
  const call = fieldOf(fieldOf(path, 'parentPath'), 'node');
  const isConstructor = isOfType(call, 'NewExpression');
  const name = calleeNameOf(call);

  return (
    isText(fieldOf(path, 'node')) &&
    fieldOf(path, 'listKey') === 'arguments' &&
    (isConstructor || isOfType(call, 'CallExpression')) &&
    typeof name === 'string' &&
    input.shapes.some(
      (shape) =>
        shape.isConstructor === isConstructor &&
        shape.indexes.has(fieldOf(path, 'key')) &&
        shape.name.test(name),
    )
  );
};

/**
 * Leaves out the mutants of the text a call takes that only a person reads: the argument at an
 * index the configuration's `diagnosticsTextArguments` gives the call's shape, a function's or a
 * method's name, or a constructor's after `new `, each with `*` for any letters.
 */
const createDiagnostics = (options: PartialStrykerOptions): Ignorer => {
  const shapes = shapesOf(options);

  return {
    shouldIgnore: (path: NodePath): string | undefined =>
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
