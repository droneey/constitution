import { describe, expect, it } from 'bun:test';

import { PluginKind } from '@stryker-mutator/api/plugin';

import { strykerPlugins, strykerValidationSchema } from '../ignorers.ts';

const [plugin] = strykerPlugins;

const LOG_CALL = 'A log call: no caller relies on it';
const ERROR_TEXT = 'The text of a diagnostic: no caller relies on it';
const PERSON_TEXT = 'Text only a person reads: no caller relies on it';

const TEXT_ARGUMENTS = {
  description: 0,
  option: 1,
} as const;

const ignorerOf = (textArguments: object = TEXT_ARGUMENTS) =>
  plugin.factory({
    diagnosticsTextArguments: textArguments,
  });

const identifier = (name: string) => ({
  name,
  type: 'Identifier',
});

const member = (input: { computed?: boolean; object: object; property: object }) => ({
  computed: input.computed ?? false,
  object: input.object,
  property: input.property,
  type: 'MemberExpression',
});

// The path of `<receiver>.<level>(...)` written as a statement, as Babel hands it to Stryker.
const statementOf = (input: { callee: object; type?: string }) => ({
  node: {
    expression: {
      arguments: [],
      callee: input.callee,
      type: input.type ?? 'CallExpression',
    },
    type: 'ExpressionStatement',
  },
});

const callOn = (receiver: object, level = 'info') =>
  statementOf({
    callee: member({
      object: receiver,
      property: identifier(level),
    }),
  });

// The path of an argument of `new <callee>(...)`.
const argumentOf = (input: {
  callee: object;
  key?: number;
  listKey?: string;
  parent?: string;
  type?: string;
}) => ({
  key: input.key ?? 0,
  listKey: input.listKey ?? 'arguments',
  node: {
    type: input.type ?? 'StringLiteral',
  },
  parentPath: {
    node: {
      callee: input.callee,
      type: input.parent ?? 'NewExpression',
    },
  },
});

describe('the diagnostics ignorer', () => {
  it.each([
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
  ])('should leave out a %s call on the logger', (level) => {
    // Arrange
    const path = callOn(identifier('logger'), level);

    // Act
    const reason = ignorerOf().shouldIgnore(path);

    // Assert
    expect(reason).toBe(LOG_CALL);
  });

  it.each([
    {
      name: 'log',
      receiver: identifier('log'),
    },
    {
      name: 'Logger',
      receiver: identifier('Logger'),
    },
    {
      name: 'auditLogger',
      receiver: identifier('auditLogger'),
    },
    {
      name: 'this.logger',
      receiver: member({
        object: {
          type: 'ThisExpression',
        },
        property: identifier('logger'),
      }),
    },
  ])('should leave out a log call when the receiver is $name', ({ receiver }) => {
    // Arrange
    const path = callOn(receiver);

    // Act
    const reason = ignorerOf().shouldIgnore(path);

    // Assert
    expect(reason).toBe(LOG_CALL);
  });

  it.each([
    {
      condition: 'the receiver is not a logger',
      path: callOn(identifier('panel')),
    },
    {
      condition: "the receiver's name only ends in log",
      path: callOn(identifier('dialog')),
    },
    {
      condition: "the receiver's name only starts with log",
      path: callOn(identifier('logs')),
    },
    {
      condition: "the receiver's name only holds Logger",
      path: callOn(identifier('auditLoggers')),
    },
    {
      condition: 'the receiver is read by a computed key',
      path: callOn(
        member({
          computed: true,
          object: {
            type: 'ThisExpression',
          },
          property: identifier('logger'),
        }),
      ),
    },
    {
      condition: 'the method is no level',
      path: callOn(identifier('logger'), 'child'),
    },
    {
      condition: 'the level is read by a computed key',
      path: statementOf({
        callee: member({
          computed: true,
          object: identifier('logger'),
          property: identifier('info'),
        }),
      }),
    },
    {
      condition: 'the statement awaits the call',
      path: statementOf({
        callee: member({
          object: identifier('logger'),
          property: identifier('info'),
        }),
        type: 'AwaitExpression',
      }),
    },
    {
      condition: 'the call is no statement',
      path: {
        node: {
          callee: member({
            object: identifier('logger'),
            property: identifier('info'),
          }),
          type: 'CallExpression',
        },
      },
    },
  ])('should keep the mutants when $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBeUndefined();
  });

  it.each([
    {
      condition: 'a string',
      path: argumentOf({
        callee: identifier('Error'),
      }),
    },
    {
      condition: 'a template',
      path: argumentOf({
        callee: identifier('Error'),
        type: 'TemplateLiteral',
      }),
    },
    {
      condition: "a subclass's text",
      path: argumentOf({
        callee: identifier('NotFoundError'),
      }),
    },
  ])('should leave out the text an error is built with when it is $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBe(ERROR_TEXT);
  });

  it.each([
    {
      condition: 'the argument is no text',
      path: argumentOf({
        callee: identifier('Error'),
        type: 'NumericLiteral',
      }),
    },
    {
      condition: 'the text is not the first argument',
      path: argumentOf({
        callee: identifier('Error'),
        key: 1,
      }),
    },
    {
      condition: 'the text is no argument',
      path: argumentOf({
        callee: identifier('Error'),
        listKey: 'typeArguments',
      }),
    },
    {
      condition: 'the error is called, not built',
      path: argumentOf({
        callee: identifier('Error'),
        parent: 'CallExpression',
      }),
    },
    {
      condition: 'the built value is no error',
      path: argumentOf({
        callee: identifier('ErrorPage'),
      }),
    },
    {
      condition: 'the constructor is read from a namespace',
      path: argumentOf({
        callee: member({
          object: identifier('errors'),
          property: identifier('Error'),
        }),
      }),
    },
    {
      condition: 'the text has no parent',
      path: {
        key: 0,
        listKey: 'arguments',
        node: {
          type: 'StringLiteral',
        },
      },
    },
  ])('should keep the mutants when $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBeUndefined();
  });

  // The path of an argument of `<receiver>.<method>(...)`.
  const methodArgumentOf = (input: { key?: number | string; method: string; parent?: string }) => ({
    key: input.key ?? 0,
    node: {
      type: 'CallExpression',
    },
    parentPath: {
      node: {
        callee: member({
          object: identifier('command'),
          property: identifier(input.method),
        }),
        type: input.parent ?? 'CallExpression',
      },
    },
  });

  it.each([
    {
      condition: 'the first argument of a method that takes it first',
      path: methodArgumentOf({
        method: 'description',
      }),
    },
    {
      condition: 'the second argument of a method that takes it second',
      path: methodArgumentOf({
        key: 1,
        method: 'option',
      }),
    },
  ])('should leave out the text only a person reads when it is $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBe(PERSON_TEXT);
  });

  it.each([
    {
      condition: 'the argument is not the one the configuration names',
      path: methodArgumentOf({
        method: 'option',
      }),
    },
    {
      condition: 'the method is not named',
      path: methodArgumentOf({
        method: 'action',
      }),
    },
    {
      condition: 'the method is built, not called',
      path: methodArgumentOf({
        method: 'description',
        parent: 'NewExpression',
      }),
    },
    {
      condition: 'the node is the callee, not an argument',
      path: methodArgumentOf({
        key: 'callee',
        method: 'description',
      }),
    },
  ])('should keep the mutants when $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBeUndefined();
  });

  it('should keep the text of a method when the configuration names none', () => {
    // Arrange
    const ignorer = plugin.factory({});

    // Act
    const reason = ignorer.shouldIgnore(
      methodArgumentOf({
        method: 'description',
      }),
    );

    // Assert
    expect(reason).toBeUndefined();
  });

  it('should declare its key, so Stryker does not warn of it', () => {
    // Arrange
    const schema = strykerValidationSchema;

    // Act
    const declared = Object.keys(schema.properties);

    // Assert
    expect(declared).toStrictEqual([
      'diagnosticsTextArguments',
    ]);
  });

  it('should declare the ignorer the configuration names', () => {
    // Arrange
    const declared = plugin;

    // Act
    const { kind, name } = declared;

    // Assert
    expect({
      kind,
      name,
    }).toStrictEqual({
      kind: PluginKind.Ignore,
      name: 'diagnostics',
    });
  });
});
