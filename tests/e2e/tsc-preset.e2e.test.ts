import { describe, expect, it } from 'bun:test';

import { presetParts, typeChecks } from './tsc-preset.fixtures';

const EMPTY = 'export {};\n';
const TYPE_IMPORTED_AS_VALUE =
  "import { Order } from './order';\nexport const orders: Order[] = [];\n";
const IMPORT_WITH_TS_EXTENSION =
  "import { ORDER_KIND } from './order.ts';\nexport const kind = ORDER_KIND;\n";
const FIELD_WITHOUT_INITIALIZER = 'export class CreateOrderInput {\n  id: string;\n}\n';
const READS_THE_DOCUMENT = 'export const title = document.title;\n';
const READS_BUN = 'export const version = Bun.version;\n';
const UNREACHABLE_CODE =
  "export const kind = (): string => {\n  return 'order';\n  console.log('never');\n};\n";

const OPTIONAL_SET_TO_UNDEFINED =
  'interface Options {\n  limit?: number;\n}\nexport const options: Options = { limit: undefined };\n';
const INDEX_READ_AS_PRESENT =
  'const totals: number[] = [1];\nexport const first: number = totals[0];\n';
const UNUSED_LOCAL = 'const unused = 1;\nexport const used = 2;\n';
const UNUSED_PARAMETER = 'export const total = (price: number, count: number): number => price;\n';
const OVERRIDE_UNMARKED =
  'class Base {\n  public run(): void {}\n}\nexport class Child extends Base {\n  public run(): void {}\n}\n';
const PATH_WITHOUT_RETURN =
  'export const sign = (n: number): number | undefined => {\n  if (n > 0) {\n    return 1;\n  }\n};\n';
const CASE_FALLS_THROUGH =
  'export const level = (n: number): number => {\n  let result = 0;\n  switch (n) {\n    case 1:\n      result = 1;\n    case 2:\n      result = 2;\n      break;\n  }\n  return result;\n};\n';
const IMPLICIT_ANY = 'export const double = (n) => n * 2;\n';
const UNUSED_LABEL =
  'export const first = (): number => {\n  outer: for (const n of [1]) {\n    return n;\n  }\n  return 0;\n};\n';
const PARAMETER_DECORATOR =
  'const Inject = (): ParameterDecorator => () => undefined;\nexport class Orders {\n  public constructor(@Inject() public readonly source: object) {}\n}\n';

describe('the tsconfig preset', () => {
  it.each([
    ...presetParts(),
  ])('should resolve and check an empty project when a project extends %s', (part) => {
    // Arrange
    const project = {
      main: EMPTY,
      parts: [
        ...new Set([
          'self',
          part,
        ]),
      ],
    };

    // Act
    const isClean = typeChecks(project);

    // Assert
    expect(isClean).toBe(true);
  });

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
      condition: 'a type is imported without `import type`, though Nest reads decorator metadata',
      main: TYPE_IMPORTED_AS_VALUE,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
      ],
    },
    {
      condition: 'a class field has no initializer, though Nest fills request classes',
      main: FIELD_WITHOUT_INITIALIZER,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
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
      condition: 'an optional field is set to undefined',
      main: OPTIONAL_SET_TO_UNDEFINED,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'an indexed element is read as present',
      main: INDEX_READ_AS_PRESENT,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a local is never read',
      main: UNUSED_LOCAL,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a parameter is never read',
      main: UNUSED_PARAMETER,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a method overrides without override',
      main: OVERRIDE_UNMARKED,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a path returns no value',
      main: PATH_WITHOUT_RETURN,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a case falls through',
      main: CASE_FALLS_THROUGH,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a parameter is implicitly any',
      main: IMPLICIT_ANY,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a label is never used',
      main: UNUSED_LABEL,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
    {
      condition: 'a constructor parameter takes a decorator',
      main: PARAMETER_DECORATOR,
      parts: [
        'self',
        'core',
        'bun',
      ],
    },
  ])('should fail the type check of $parts when $condition', ({ main, parts }) => {
    // Arrange
    const project = {
      main,
      parts,
    };

    // Act
    const isClean = typeChecks(project);

    // Assert
    expect(isClean).toBe(false);
  });

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
    {
      condition: 'a constructor parameter takes a decorator the injector reads',
      main: PARAMETER_DECORATOR,
      parts: [
        'self',
        'core',
        'bun',
        'nestjs',
      ],
    },
  ])('should pass the type check of $parts when $condition', ({ main, parts }) => {
    // Arrange
    const project = {
      main,
      parts,
    };

    // Act
    const isClean = typeChecks(project);

    // Assert
    expect(isClean).toBe(true);
  });
});
