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
const UNREACHABLE_CODE =
  "export const kind = (): string => {\n  return 'order';\n  console.log('never');\n};\n";

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
        'core',
        'bun',
      ],
    },
    {
      condition: 'code follows a return',
      main: UNREACHABLE_CODE,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a class field has no initializer',
      main: FIELD_WITHOUT_INITIALIZER,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'an import names its .ts extension',
      main: IMPORT_WITH_TS_EXTENSION,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'code outside a browser reads the document',
      main: READS_THE_DOCUMENT,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'browser code reads Bun',
      main: READS_BUN,
      parts: [
        'self',
        'core',
        'browser',
      ],
    },
    {
      condition: 'browser code reads the process',
      main: READS_THE_PROCESS,
      parts: [
        'self',
        'core',
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
      condition: 'code follows a return, as only the core part refuses it',
      main: UNREACHABLE_CODE,
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
        'core',
        'bun',
      ],
    },
    {
      condition: 'a type is imported without `import type`',
      main: TYPE_IMPORTED_AS_VALUE,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'a class field has no initializer, as the framework fills it',
      main: FIELD_WITHOUT_INITIALIZER,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'browser code reads the document',
      main: READS_THE_DOCUMENT,
      parts: [
        'self',
        'core',
        'browser',
        '_react',
      ],
    },
    {
      condition: 'code on Bun reads Bun',
      main: READS_BUN,
      parts: [
        'self',
        'core',
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
