import { describe, expect, it } from 'bun:test';

import { presetParts, typeChecks } from './typescript-preset.fixtures';

const EMPTY = 'export {};\n';
const TYPE_IMPORTED_AS_VALUE =
  "import { Order } from './order';\nexport const orders: Order[] = [];\n";
const IMPORT_WITH_TS_EXTENSION =
  "import { ORDER_KIND } from './order.ts';\nexport const kind = ORDER_KIND;\n";
const FIELD_WITHOUT_INITIALIZER =
  'export class CreateOrderInput {\n  id: string;\n}\n';
const READS_THE_DOCUMENT = 'export const title = document.title;\n';
const READS_BUN = 'export const version = Bun.version;\n';
const READS_THE_PROCESS = 'export const home = process.env.HOME;\n';

describe('the tsconfig preset', () => {
  it.each([
    ...presetParts(),
  ])(
    'should resolve and check an empty project when a project extends %s',
    (part) => {
      // Arrange
      const project = {
        main: EMPTY,
        parts:
          part === 'self'
            ? [
                part,
              ]
            : [
                'self',
                part,
              ],
      };

      // Act
      const isClean = typeChecks(project);

      // Assert
      expect(isClean).toBe(true);
    },
  );

  it.each([
    {
      condition: 'a type is imported without `import type`',
      main: TYPE_IMPORTED_AS_VALUE,
      parts: [
        'self',
        'bun',
      ],
    },
    {
      condition: 'a class field has no initializer',
      main: FIELD_WITHOUT_INITIALIZER,
      parts: [
        'self',
        'bun',
      ],
    },
    {
      condition: 'an import names its .ts extension',
      main: IMPORT_WITH_TS_EXTENSION,
      parts: [
        'self',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'code outside a browser reads the document',
      main: READS_THE_DOCUMENT,
      parts: [
        'self',
        'bun',
      ],
    },
    {
      condition: 'browser code reads Bun',
      main: READS_BUN,
      parts: [
        'self',
        'browser',
      ],
    },
    {
      condition: 'browser code reads the process',
      main: READS_THE_PROCESS,
      parts: [
        'self',
        'browser',
        '_react',
      ],
    },
  ])(
    'should fail the type check of $parts when $condition',
    ({ main, parts }) => {
      // Arrange
      const project = {
        main,
        parts,
      };

      // Act
      const isClean = typeChecks(project);

      // Assert
      expect(isClean).toBe(false);
    },
  );

  it.each([
    {
      condition: 'an import names its .ts extension',
      main: IMPORT_WITH_TS_EXTENSION,
      parts: [
        'self',
        'bun',
      ],
    },
    {
      condition: 'a type is imported without `import type`',
      main: TYPE_IMPORTED_AS_VALUE,
      parts: [
        'self',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'a class field has no initializer, as the framework fills it',
      main: FIELD_WITHOUT_INITIALIZER,
      parts: [
        'self',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'browser code reads the document',
      main: READS_THE_DOCUMENT,
      parts: [
        'self',
        'browser',
        '_react',
      ],
    },
    {
      condition: 'code on Bun reads Bun',
      main: READS_BUN,
      parts: [
        'self',
        'bun',
      ],
    },
  ])(
    'should pass the type check of $parts when $condition',
    ({ main, parts }) => {
      // Arrange
      const project = {
        main,
        parts,
      };

      // Act
      const isClean = typeChecks(project);

      // Assert
      expect(isClean).toBe(true);
    },
  );
});
