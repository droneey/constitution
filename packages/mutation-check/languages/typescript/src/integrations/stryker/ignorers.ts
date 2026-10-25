import type { PartialStrykerOptions } from '@stryker-mutator/api/core';
import type { Ignorer, NodePath } from '@stryker-mutator/api/ignore';
import type { FactoryPlugin } from '@stryker-mutator/api/plugin';
import { commonTokens, PluginKind, tokens } from '@stryker-mutator/api/plugin';

// The ignorer's own key in the Stryker configuration, a table each part of a configuration may add to.
const OPTIONS_KEY = 'diagnosticsTextArguments';

const logLevels: ReadonlySet<unknown> = new Set([
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
]);

// The logger is known by its name alone, the receiver's or its property's, as in `this.logger`.
const LOGGER_NAME = /^(?:log|logger|\w*Logger)$/;

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

const isLogger = (node: unknown): boolean => {
  const name = nameOf(node) ?? propertyOf(node);

  // Stryker disable next-line ConditionalExpression: the guard narrows the type; a name Babel leaves undefined reads "undefined", which no logger's name is
  return typeof name === 'string' && LOGGER_NAME.test(name);
};

const isLogCall = (node: unknown): boolean => {
  const call = fieldOf(node, 'expression');
  const callee = fieldOf(call, 'callee');

  return (
    isOfType(node, 'ExpressionStatement') &&
    isOfType(call, 'CallExpression') &&
    logLevels.has(propertyOf(callee)) &&
    isLogger(fieldOf(callee, 'object'))
  );
};

const isErrorText = (path: NodePath): boolean => {
  const node = fieldOf(path, 'node');
  const parent = fieldOf(fieldOf(path, 'parentPath'), 'node');
  const built = nameOf(fieldOf(parent, 'callee'));

  return (
    (isOfType(node, 'StringLiteral') || isOfType(node, 'TemplateLiteral')) &&
    isOfType(parent, 'NewExpression') &&
    fieldOf(path, 'listKey') === 'arguments' &&
    fieldOf(path, 'key') === 0 &&
    typeof built === 'string' &&
    built.endsWith('Error')
  );
};

// By a method's name, the index of its argument that is text only a person reads.
type TextArguments = ReadonlyMap<unknown, unknown>;

const textArgumentsOf = (options: PartialStrykerOptions): TextArguments => {
  const given = fieldOf(options, OPTIONS_KEY);

  return new Map(given instanceof Object ? Object.entries(given) : []);
};

const isPersonText = (path: NodePath, textArguments: TextArguments): boolean => {
  const parent = fieldOf(fieldOf(path, 'parentPath'), 'node');

  // A call's one list is its arguments, so an index as the path's key names one of them.
  return (
    isOfType(parent, 'CallExpression') &&
    textArguments.get(propertyOf(fieldOf(parent, 'callee'))) === fieldOf(path, 'key')
  );
};

/**
 * Leaves out the mutants no caller relies on: inside a log call, the text an error is built with,
 * and the argument of a method that the configuration's `diagnosticsTextArguments` names as text
 * only a person reads.
 */
const createDiagnostics = (options: PartialStrykerOptions): Ignorer => {
  const textArguments = textArgumentsOf(options);

  return {
    shouldIgnore: (path: NodePath): string | undefined => {
      if (isLogCall(fieldOf(path, 'node'))) {
        return 'A log call: no caller relies on it';
      }

      if (isPersonText(path, textArguments)) {
        return 'Text only a person reads: no caller relies on it';
      }

      return isErrorText(path) ? 'The text of a diagnostic: no caller relies on it' : undefined;
    },
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
