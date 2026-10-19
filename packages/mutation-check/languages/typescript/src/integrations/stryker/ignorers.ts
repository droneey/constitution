import type { Ignorer, NodePath } from '@stryker-mutator/api/ignore';
import { declareValuePlugin, PluginKind } from '@stryker-mutator/api/plugin';

const LOG_LEVELS: ReadonlySet<unknown> = new Set([
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
    LOG_LEVELS.has(propertyOf(callee)) &&
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

// Leaves out the mutants no caller relies on: inside a log call and the text an error is built with.
const diagnostics: Ignorer = {
  shouldIgnore: (path: NodePath): string | undefined => {
    if (isLogCall(fieldOf(path, 'node'))) {
      return 'A log call: no caller relies on it';
    }

    return isErrorText(path) ? 'The text of a diagnostic: no caller relies on it' : undefined;
  },
};

const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'diagnostics', diagnostics),
] as const;

export { strykerPlugins };
