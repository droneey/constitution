import { describe, expect, it } from 'bun:test';

import { PluginKind } from '@stryker-mutator/api/plugin';

import { strykerPlugins, strykerValidationSchema } from '../ignorers.ts';

const [plugin] = strykerPlugins;

const PERSON_TEXT = 'Text only a person reads: no caller relies on it';

const TEXT_ARGUMENTS = {
  description: 0,
  info: [
    0,
    1,
  ],
  'new *Error': 0,
  option: 1,
  t: 0,
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

const method = (name: string, computed = false) =>
  member({
    computed,
    object: identifier('command'),
    property: identifier(name),
  });

// The path of an argument of a call, `<callee>(...)` or `new <callee>(...)`, as Babel hands it to Stryker.
const argumentOf = (input: {
  callee: object;
  key?: number | string;
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
      type: input.parent ?? 'CallExpression',
    },
  },
});

describe('the diagnostics ignorer', () => {
  it.each([
    {
      condition: "a method's text at the index its shape names",
      path: argumentOf({
        callee: method('option'),
        key: 1,
      }),
    },
    {
      condition: 'a template at that index',
      path: argumentOf({
        callee: method('description'),
        type: 'TemplateLiteral',
      }),
    },
    {
      condition: 'the text at any of the indexes its shape names',
      path: argumentOf({
        callee: method('info'),
        key: 1,
      }),
    },
    {
      condition: 'the call that builds the text at that index',
      path: argumentOf({
        callee: method('description'),
        type: 'CallExpression',
      }),
    },
    {
      condition: "a function's text",
      path: argumentOf({
        callee: identifier('t'),
      }),
    },
    {
      condition: 'the text a constructor its shape names builds with',
      path: argumentOf({
        callee: identifier('NotFoundError'),
        parent: 'NewExpression',
      }),
    },
    {
      condition: 'the text of a constructor read from a namespace',
      path: argumentOf({
        callee: member({
          object: identifier('errors'),
          property: identifier('Error'),
        }),
        parent: 'NewExpression',
      }),
    },
  ])('should leave out $condition', ({ path }) => {
    // Arrange
    const ignorer = ignorerOf();

    // Act
    const reason = ignorer.shouldIgnore(path);

    // Assert
    expect(reason).toBe(PERSON_TEXT);
  });

  it.each([
    {
      condition: 'the argument is an object',
      path: argumentOf({
        callee: method('description'),
        type: 'ObjectExpression',
      }),
    },
    {
      condition: 'the argument is a list',
      path: argumentOf({
        callee: method('description'),
        type: 'ArrayExpression',
      }),
    },
    {
      condition: 'the argument is not at an index its shape names',
      path: argumentOf({
        callee: method('option'),
      }),
    },
    {
      condition: 'no shape names the method',
      path: argumentOf({
        callee: method('action'),
      }),
    },
    {
      condition: "a shape names only part of the method's name",
      path: argumentOf({
        callee: method('options'),
        key: 1,
      }),
    },
    {
      condition: 'the method is read by a computed key',
      path: argumentOf({
        callee: method('description', true),
      }),
    },
    {
      condition: 'the call has no callee',
      path: {
        key: 0,
        listKey: 'arguments',
        node: {
          type: 'StringLiteral',
        },
        parentPath: {
          node: {
            type: 'CallExpression',
          },
        },
      },
    },
    {
      condition: 'a method its shape names is built, not called',
      path: argumentOf({
        callee: identifier('description'),
        parent: 'NewExpression',
      }),
    },
    {
      condition: 'a constructor its shape names is called, not built',
      path: argumentOf({
        callee: identifier('Error'),
      }),
    },
    {
      condition: "the constructor's name only begins as the shape's ends",
      path: argumentOf({
        callee: identifier('ErrorPage'),
        parent: 'NewExpression',
      }),
    },
    {
      condition: 'the text is no argument',
      path: argumentOf({
        callee: method('description'),
        listKey: 'typeArguments',
      }),
    },
    {
      condition: 'the node is the callee',
      path: argumentOf({
        callee: method('description'),
        key: 'callee',
        listKey: 'callee',
      }),
    },
    {
      condition: 'the text lies in no call',
      path: argumentOf({
        callee: method('description'),
        parent: 'ArrayExpression',
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

  it('should keep the text of a method when the configuration names no shape', () => {
    // Arrange
    const ignorer = plugin.factory({});

    // Act
    const reason = ignorer.shouldIgnore(
      argumentOf({
        callee: method('description'),
      }),
    );

    // Assert
    expect(reason).toBeUndefined();
  });

  it('should keep the mutants when a shape names any call and the call reads its method by a computed key', () => {
    // Arrange
    const ignorer = ignorerOf({
      '*': 0,
    });

    // Act
    const reason = ignorer.shouldIgnore(
      argumentOf({
        callee: method('description', true),
      }),
    );

    // Assert
    expect(reason).toBeUndefined();
  });

  it('should take a shape for its letters alone when it holds a character a pattern reads', () => {
    // Arrange
    const ignorer = ignorerOf({
      'log.info': 0,
    });

    // Act
    const reason = ignorer.shouldIgnore(
      argumentOf({
        callee: identifier('logXinfo'),
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
