import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';

import {
  DiagnosticsSettingError,
  DiagnosticsSettingFailure,
} from '../diagnostics-setting.error.ts';
import { strykerPlugins } from '../ignorers.ts';

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
  super: 0,
} as const;

const ignorerOf = (textArguments: object = TEXT_ARGUMENTS) =>
  plugin.factory({
    diagnosticsTextArguments: textArguments,
  });

const identifier = (identifierName: string) => ({
  name: identifierName,
  type: 'Identifier',
});

const member = (input: { computed?: boolean; object: object; property: object }) => ({
  computed: input.computed ?? false,
  object: input.object,
  property: input.property,
  type: 'MemberExpression',
});

const method = (methodName: string) =>
  member({
    object: identifier('command'),
    property: identifier(methodName),
  });

const computedMethod = (methodName: string) =>
  member({
    computed: true,
    object: identifier('command'),
    property: identifier(methodName),
  });

// The path of an argument of a call, `<callee>(...)` or `new <callee>(...)`, as Babel hands it to Stryker.
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
      type: input.parent ?? 'CallExpression',
    },
  },
});

// A literal of a file, as Babel hands it to Stryker with the file it walks.
const literalIn = (input: { fileName: string; type: string }) => ({
  hub: {
    file: {
      opts: {
        filename: input.fileName,
      },
    },
  },
  node: {
    type: input.type,
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
      condition: 'the text a constructor its shape names builds with',
      path: argumentOf({
        callee: identifier('NotFoundError'),
        parent: 'NewExpression',
      }),
    },
    {
      condition: "the text a constructor hands to its parent class's",
      path: argumentOf({
        callee: {
          type: 'Super',
        },
      }),
    },
    {
      condition: 'a string of a file of messages',
      path: literalIn({
        fileName: '/work/src/order.messages.ts',
        type: 'StringLiteral',
      }),
    },
    {
      condition: 'a template of a file of messages',
      path: literalIn({
        fileName: '/work/src/order.messages.ts',
        type: 'TemplateLiteral',
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
      condition: 'a constructor its shape names is called, not built',
      path: argumentOf({
        callee: identifier('Error'),
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
      condition: 'the text lies in no call',
      path: argumentOf({
        callee: method('description'),
        parent: 'ArrayExpression',
      }),
    },
    {
      condition: 'a string lies in the spec of a file of messages',
      path: literalIn({
        fileName: '/work/src/__tests__/order.messages.test.ts',
        type: 'StringLiteral',
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

  it('should keep the mutants when a shape names any call and the call reads its method by a computed key', () => {
    // Arrange
    const ignorer = ignorerOf({
      '*': 0,
    });

    // Act
    const reason = ignorer.shouldIgnore(
      argumentOf({
        callee: computedMethod('description'),
      }),
    );

    // Assert
    expect(reason).toBeUndefined();
  });

  it.each([
    {
      condition: 'is no table',
      problemPaths: [
        'diagnosticsTextArguments',
      ],
      textArguments: [
        0,
      ],
    },
    {
      condition: 'give shapes indexes that are no whole numbers',
      problemPaths: [
        'diagnosticsTextArguments.info',
        'diagnosticsTextArguments.option',
      ],
      textArguments: {
        info: [
          0,
          '1',
        ],
        option: 1.5,
      },
    },
  ])(
    'should refuse, naming every problem, a configuration whose text arguments $condition',
    async ({ problemPaths, textArguments }) => {
      // Act
      const failure = await failureOf({
        call: () => ignorerOf(textArguments),
        kind: DiagnosticsSettingError,
      });

      // Assert
      expect(failure?.details).toStrictEqual({
        code: DiagnosticsSettingFailure.Malformed,
        problemPaths,
      });
    },
  );
});
