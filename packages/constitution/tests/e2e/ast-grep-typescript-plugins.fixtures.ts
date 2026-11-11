import type { PluginRow } from './ast-grep-plugins.fixtures';

const ORDER_AGGREGATE = 'src/features/orders/domain/order/entities/order.aggregate.ts';
const MONEY_VALUE_OBJECT = 'src/features/orders/domain/order/value-objects/money.value-object.ts';
const IMPORT_ORDER_USE_CASE =
  'src/features/orders/application/use-cases/commands/import-order.use-case.ts';
const ISSUE_INVOICE_USE_CASE =
  'src/features/invoices/application/use-cases/commands/issue-invoice.use-case.ts';
const MANIFEST = 'package.json';

const typescriptPluginRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'cause-passed-in-the-cause-option',
    reported: [
      {
        condition: 'a caught failure is mapped with no cause',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch (error) {\n  throw new ReadError('cannot read');\n}\n",
        },
      },
      {
        condition: 'a catch with no binding raises a new error',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch {\n  throw new ReadError('cannot read', { retry: false });\n}\n",
        },
      },
      {
        condition: 'a caught failure is returned mapped with no cause',
        files: {
          'src/x.ts':
            "export const f = (): unknown => {\n  try {\n    return read();\n  } catch (error) {\n    if (error instanceof TypeError) {\n      return new ParseError('bad');\n    }\n\n    throw error;\n  }\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the caught failure is passed as the cause',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch (error) {\n  throw new ReadError('cannot read', { cause: error });\n}\n",
        },
      },
      {
        condition: 'the caught failure is passed by its shorthand',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch (cause) {\n  throw new ReadError('cannot read', { cause });\n}\n",
        },
      },
      {
        condition: 'the options are read from a name',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch (error) {\n  throw new ReadError('cannot read', options);\n}\n",
        },
      },
      {
        condition: 'a function declared in the catch raises its own error',
        files: {
          'src/x.ts':
            "try {\n  read();\n} catch (error) {\n  const later = (): never => {\n    throw new ReadError('x');\n  };\n\n  later();\n\n  throw error;\n}\n",
        },
      },
      {
        condition: 'an error is raised outside any catch',
        files: {
          'src/x.ts': "throw new ReadError('cannot read');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'error-class-hands-its-cause-to-super',
    reported: [
      {
        condition: 'the error options are kept from super',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(message: string, options?: ErrorOptions) {\n    super(message);\n  }\n}\n',
        },
      },
      {
        condition: 'a destructured cause is kept from super',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(path: string, { cause }: { readonly cause: unknown }) {\n    super(`cannot read ${path}`);\n  }\n}\n',
        },
      },
      {
        condition: 'super is handed a cause other than the one taken',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(path: string, options: { readonly cause?: unknown }) {\n    super(path, { cause: undefined });\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the error options are handed on',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(message: string, options?: ErrorOptions) {\n    super(message, options);\n  }\n}\n',
        },
      },
      {
        condition: 'a destructured cause is handed on',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(path: string, { cause }: { readonly cause: unknown }) {\n    super(`cannot read ${path}`, { cause });\n  }\n}\n',
        },
      },
      {
        condition: 'the cause is read from the options it hands on',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(path: string, options: { readonly cause?: unknown }) {\n    super(path, { cause: options.cause });\n  }\n}\n',
        },
      },
      {
        condition: 'the constructor takes no cause',
        files: {
          'src/x.ts':
            'export class ReadError extends Error {\n  public constructor(path: string) {\n    super(path);\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'source-file-is-a-typescript-file',
    reported: [
      {
        condition: 'a source file is a js file',
        files: {
          'src/order.js': 'export const total = 1;\n',
        },
      },
      {
        condition: 'a source file is a jsx file',
        files: {
          'src/lib/badge.jsx': 'export const Badge = () => <p />;\n',
        },
      },
      {
        condition: 'a source file is an mjs file',
        files: {
          'src/order.mjs': 'export const total = 1;\n',
        },
      },
      {
        condition: 'a source file is a cjs file',
        files: {
          'src/order.cjs': 'module.exports = 1;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a source file is a ts file',
        files: {
          'src/order.ts': 'export const total = 1;\n',
        },
      },
      {
        condition: 'a tool reads a js file beside the manifest',
        files: {
          'vite.config.js': 'export default {};\n',
        },
      },
      {
        condition: 'a build script sits outside the source',
        files: {
          'scripts/build.mjs': 'export const built = 1;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'typescript-source-spelled-ts-or-tsx',
    reported: [
      {
        condition: 'a source file is spelled mts',
        files: {
          'src/order.mts': 'export const total = 1;\n',
        },
      },
      {
        condition: 'a source file is spelled cts',
        files: {
          'src/order.cts': 'export const total = 1;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a source file is spelled ts',
        files: {
          'src/order.ts': 'export const total = 1;\n',
        },
      },
      {
        condition: 'a tool reads an mts file beside the manifest',
        files: {
          'vitest.config.mts': 'export const config = {};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'type-error-suppression-gives-its-reason-on-its-line',
    reported: [
      {
        condition: 'the directive stands alone',
        files: {
          'src/x.ts': "// @ts-expect-error\nexport const total: number = 'x';\n",
        },
      },
      {
        condition: 'the reason sits on the line above',
        files: {
          'src/x.ts':
            "// Why: the old typings miss it.\n// @ts-expect-error\nexport const total: number = 'x';\n",
        },
      },
      {
        condition: 'a directive in markup gives no reason',
        files: {
          'src/x.tsx':
            'export const Card = () => (\n  <div>\n    {/* @ts-expect-error */}\n    <Badge size="x" />\n  </div>\n);\n',
        },
      },
      {
        condition: 'only a separator follows the directive',
        files: {
          'src/x.ts': "// @ts-expect-error --\nexport const total: number = 'x';\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the reason follows a separator',
        files: {
          'src/x.ts':
            "// @ts-expect-error -- the old typings miss the size prop\nexport const total: number = 'x';\n",
        },
      },
      {
        condition: 'the reason follows a colon',
        files: {
          'src/x.ts':
            "// @ts-expect-error: the vendor types it as a string\nexport const total: number = 'x';\n",
        },
      },
      {
        condition: 'a directive in markup gives its reason',
        files: {
          'src/x.tsx':
            'export const Card = () => (\n  <div>\n    {/* @ts-expect-error the old typings miss the size prop */}\n    <Badge size="x" />\n  </div>\n);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'brand-is-a-unique-symbol-key',
    reported: [
      {
        condition: 'a brand is keyed by a name',
        files: {
          'src/x.ts': "export type OrderId = string & { readonly __brand: 'OrderId' };\n",
        },
      },
      {
        condition: 'a brand is keyed by a string',
        files: {
          'src/x.ts': "export type Grams = number & { readonly 'brand': 'Grams' };\n",
        },
      },
      {
        condition: 'a brand is keyed by a symbol of its own',
        files: {
          'src/x.ts':
            'declare const orderIdBrand: unique symbol;\n\nexport type OrderId = string & { readonly [orderIdBrand]: true };\n',
        },
      },
      {
        condition: 'the branded primitive comes last',
        files: {
          'src/x.ts': "export type OrderId = { readonly _tag: 'OrderId' } & string;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a brand is keyed by the unique symbol',
        files: {
          'src/x.ts':
            "declare const brand: unique symbol;\n\nexport type OrderId = string & { readonly [brand]: 'OrderId' };\n",
        },
      },
      {
        condition: 'an object type narrows another object type',
        files: {
          'src/x.ts': "export type PlacedOrder = Order & { readonly stage: 'placed' };\n",
        },
      },
      {
        condition: 'an empty object widens a primitive',
        files: {
          'src/x.ts': "export type Loose = (string & {}) | 'a';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'empty-return-written-bare',
    reported: [
      {
        condition: 'undefined is returned by name',
        files: {
          'src/x.ts':
            "export const find = (id: string): string | undefined => {\n  if (id === '') {\n    return undefined;\n  }\n\n  return id;\n};\n",
        },
      },
      {
        condition: 'undefined ends the body of a function that answers no value elsewhere',
        files: {
          'src/x.ts':
            "export const stop = (id: string): undefined => {\n  if (id === '') {\n    return;\n  }\n\n  return undefined;\n};\n",
        },
      },
      {
        condition: 'void 0 is returned',
        files: {
          'src/x.ts': 'export function stop(): void {\n  return void 0;\n}\n',
        },
      },
      {
        condition: 'undefined is returned in parentheses',
        files: {
          'src/x.ts': 'export function stop(): void {\n  return (undefined);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the return is bare',
        files: {
          'src/x.ts':
            "export const find = (id: string): string | undefined => {\n  if (id === '') {\n    return;\n  }\n\n  return id;\n};\n",
        },
      },
      {
        condition: 'undefined ends the body of a function that answers a value before',
        files: {
          'src/x.ts':
            "export const find = (ids: readonly string[]): string | undefined => {\n  for (const id of ids) {\n    if (id !== '') {\n      return id;\n    }\n  }\n\n  return undefined;\n};\n",
        },
      },
      {
        condition: 'undefined ends the blocks of a try that ends the body',
        files: {
          'src/x.ts':
            'export const failureOf = (act: () => void): unknown => {\n  try {\n    act();\n\n    return undefined;\n  } catch (error) {\n    return error;\n  }\n};\n',
        },
      },
      {
        condition: 'undefined ends the handler of a try that ends the body',
        files: {
          'src/x.ts':
            'export const parsed = (text: string): unknown => {\n  try {\n    return JSON.parse(text);\n  } catch {\n    return undefined;\n  }\n};\n',
        },
      },
      {
        condition: 'an arrow function answers undefined',
        files: {
          'src/x.ts': 'export const absent = (): undefined => undefined;\n',
        },
      },
      {
        condition: 'a default falls back to undefined',
        files: {
          'src/x.ts':
            'export const label = (name?: string): string | undefined => {\n  return name ?? undefined;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'invariant-value-is-plain-readonly-data',
    reported: [
      {
        condition: 'a value object is a class',
        files: {
          [MONEY_VALUE_OBJECT]:
            'export class Money {\n  public constructor(public readonly cents: number) {}\n}\n',
        },
      },
      {
        condition: 'a value object is an abstract class',
        files: {
          [MONEY_VALUE_OBJECT]:
            'export abstract class Money {\n  public abstract readonly cents: number;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a value object is plain readonly data with a companion',
        files: {
          [MONEY_VALUE_OBJECT]:
            'export interface Money {\n  readonly cents: number;\n}\n\nexport const Money = {\n  plus: (left: Money, right: Money): Money => ({ cents: left.cents + right.cents }),\n} as const;\n',
        },
      },
      {
        condition: 'a class sits in a file of another role',
        files: {
          'src/features/orders/domain/order/errors/order-not-found.error.ts':
            'export class OrderNotFoundError extends Error {}\n',
        },
      },
      {
        condition: 'the architecture axis is not followed',
        files: {
          [MONEY_VALUE_OBJECT]:
            'export class Money {\n  public constructor(public readonly cents: number) {}\n}\n',
        },
        unit: {
          axes: [],
          blocks: [
            'bun-test',
            'react/react-dom',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'exit-codes-from-one-map',
    unit: {
      blocks: [
        'bun-test',
        'client/cli',
      ],
    },
    reported: [
      {
        condition: 'the program exits with a number',
        files: {
          'src/main.ts': 'process.exit(2);\n',
        },
      },
      {
        condition: 'the exit code is set to a number',
        files: {
          'src/main.ts': 'process.exitCode = 1;\n',
        },
      },
      {
        condition: 'the program exits with success written as zero',
        files: {
          'src/main.ts': 'export const stop = (): never => process.exit(0);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the program exits with a member of the map',
        files: {
          'src/main.ts':
            "import { ExitCode } from './kernel/exit-code';\n\nprocess.exit(ExitCode.Usage);\n",
        },
      },
      {
        condition: 'the exit code is set from the map',
        files: {
          'src/main.ts':
            "import { ExitCode } from './kernel/exit-code';\n\nprocess.exitCode = ExitCode.Failure;\n",
        },
      },
      {
        condition: 'the map writes its codes',
        files: {
          'src/kernel/exit-code.ts':
            'export enum ExitCode {\n  Success = 0,\n  Failure = 1,\n  Usage = 2,\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'entity-never-lifts-to-the-kernel',
    reported: [
      {
        condition: 'an entity file sits in the kernel',
        files: {
          'src/kernel/customer/customer.entity.ts':
            'export interface Customer {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: "an aggregate's root sits in the kernel",
        files: {
          'src/kernel/orders/order.aggregate.ts':
            'export interface Order {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: 'the kernel holds an entities folder',
        files: {
          'src/kernel/entities/customer.ts':
            'export interface Customer {\n  readonly id: string;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a value object sits in the kernel',
        files: {
          'src/kernel/value-objects/money.value-object.ts':
            'export interface Money {\n  readonly cents: number;\n}\n',
        },
      },
      {
        condition: "an aggregate's root sits in its feature",
        files: {
          [ORDER_AGGREGATE]: 'export interface Order {\n  readonly id: string;\n}\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'entity-never-lifts-to-the-kernel',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'an entity module sits in the kernel',
        files: {
          'src/shop/kernel/customer/customer_entity.py':
            '@dataclass(frozen=True, slots=True)\nclass Customer:\n    id: str\n',
        },
      },
      {
        condition: "an aggregate's root sits in the kernel",
        files: {
          'src/shop/kernel/orders/order_aggregate.py':
            '@dataclass(frozen=True, slots=True)\nclass Order:\n    id: str\n',
        },
      },
      {
        condition: 'the kernel holds an entities folder',
        files: {
          'src/shop/kernel/entities/customer.py':
            '@dataclass(frozen=True, slots=True)\nclass Customer:\n    id: str\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a value object sits in the kernel',
        files: {
          'src/shop/kernel/value_objects/money_value_object.py':
            '@dataclass(frozen=True, slots=True)\nclass Money:\n    cents: int\n',
        },
      },
      {
        condition: "an aggregate's root sits in its feature",
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            '@dataclass(frozen=True, slots=True)\nclass Order:\n    id: str\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'string-holding-a-backslash-written-literally',
    reported: [
      {
        condition: 'a path escapes its backslashes',
        files: {
          'src/x.ts': "export const home = 'C:\\\\Users\\\\me';\n",
        },
      },
      {
        condition: 'a regular expression is built from an escaped string',
        files: {
          'src/x.ts': "export const digits = new RegExp('\\\\d+');\n",
        },
      },
      {
        condition: 'a template escapes its backslash',
        files: {
          'src/x.ts': 'export const path = `${root}\\\\bin`;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a path is written raw',
        files: {
          'src/x.ts': 'export const home = String.raw`C:\\Users\\me`;\n',
        },
      },
      {
        condition: 'a regular expression is a literal',
        files: {
          'src/x.ts': 'export const digits = /\\d+/;\n',
        },
      },
      {
        condition: 'the string ends in a backslash',
        files: {
          'src/x.ts': "export const separator = '\\\\';\n",
        },
      },
      {
        condition: 'the string holds another escape',
        files: {
          'src/x.ts': "export const line = 'a\\\\b\\n';\n",
        },
      },
      {
        condition: 'the string holds a backtick',
        files: {
          'src/x.ts': "export const tick = '\\\\`';\n",
        },
      },
      {
        condition: 'the string holds the opening of a substitution',
        files: {
          'src/x.ts': "export const text = '${x}\\\\y';\n",
        },
      },
      {
        condition: 'a backslash precedes a substitution',
        files: {
          'src/x.ts': 'export const path = `C:\\\\Users\\\\${name}`;\n',
        },
      },
      {
        condition: 'a markup attribute holds a backslash',
        files: {
          'src/x.tsx': 'export const Link = () => <a title="C:\\\\x" />;\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'string-holding-a-backslash-written-literally',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'a path escapes its backslashes',
        files: {
          'src/shop/paths.py': 'HOME = "C:\\\\Users\\\\me"\n',
        },
      },
      {
        condition: 'a pattern escapes its backslash',
        files: {
          'src/shop/paths.py': 'DIGITS = re.compile("\\\\d+")\n',
        },
      },
      {
        condition: 'a formatted string escapes its backslash',
        files: {
          'src/shop/paths.py': 'BIN = f"{root}\\\\bin"\n',
        },
      },
      {
        condition: 'a bytes literal escapes its backslash',
        files: {
          'src/shop/paths.py': 'RAW = b"a\\\\b"\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a path is written raw',
        files: {
          'src/shop/paths.py': 'HOME = r"C:\\Users\\me"\n',
        },
      },
      {
        condition: 'the string ends in a backslash',
        files: {
          'src/shop/paths.py': 'SEPARATOR = "a\\\\"\n',
        },
      },
      {
        condition: 'the string holds another escape',
        files: {
          'src/shop/paths.py': 'LINE = "a\\\\b\\n"\n',
        },
      },
      {
        condition: 'a bytes literal is written raw',
        files: {
          'src/shop/paths.py': 'RAW = rb"a\\b"\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'collection-suffix-ends-only-its-files-name',
    reported: [
      {
        condition: 'an interface ends in Types',
        files: {
          'src/x.ts': 'export interface OrderTypes {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: 'a class ends in Utils',
        files: {
          'src/x.ts': 'export class DateUtils {}\n',
        },
      },
      {
        condition: "a type alias ends in the spec's mark",
        files: {
          'src/x.ts': 'export type CheckoutTest = () => void;\n',
        },
      },
      {
        condition: 'an enum ends in Constants',
        files: {
          'src/x.ts': "export enum OrderConstants {\n  Max = 'max',\n}\n",
        },
      },
      {
        condition: "an interface ends in the fixtures' mark",
        files: {
          'src/x.ts': 'export interface PaymentFixtures {\n  readonly paid: string;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a word ends in the spec's mark in lower case",
        files: {
          'src/x.ts': 'export interface Latest {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: 'a word ends in types in lower case',
        files: {
          'src/x.ts': 'export type Subtypes = readonly string[];\n',
        },
      },
      {
        condition: 'a library imposes the name it augments',
        files: {
          'src/x.d.ts':
            "declare module 'bun:test' {\n  interface MatcherTypes {\n    readonly strict: boolean;\n  }\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'entity-rules-held-by-its-companion',
    reported: [
      {
        condition: "an aggregate's predicate is a method",
        files: {
          [ORDER_AGGREGATE]:
            'export class Order {\n  public isPaid(): boolean {\n    return true;\n  }\n}\n',
        },
      },
      {
        condition: "a value object's operation is a field holding a function",
        files: {
          [MONEY_VALUE_OBJECT]:
            'export class Money {\n  public readonly plus = (other: Money): Money => other;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: "the rule is a function of the type's companion",
        files: {
          [MONEY_VALUE_OBJECT]:
            'export interface Money {\n  readonly cents: number;\n}\n\nexport const Money = {\n  plus: (left: Money, right: Money): Money => ({ cents: left.cents + right.cents }),\n} as const;\n',
        },
      },
      {
        condition: 'a class of another role has methods',
        files: {
          'src/features/orders/infrastructure/sql/sql-order-repository.adapter.ts':
            'export class Thing {\n  public run(): void {}\n}\n',
        },
      },
      {
        condition: 'an enumeration of the domain has no companion',
        files: {
          'src/features/orders/domain/order/value-objects/order-stage.value-object.ts':
            "export enum OrderStage {\n  Placed = 'placed',\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'role-suffix-spelled-after-a-dot',
    reported: [
      {
        condition: "a port's role is joined by a hyphen",
        files: {
          'src/features/orders/application/contracts/order-repository-port.ts':
            'export interface OrderRepositoryPort {\n  readonly save: () => void;\n}\n',
        },
      },
      {
        condition: "an error's role is joined by a hyphen in its role folder",
        files: {
          'src/features/orders/domain/order/errors/order-not-found-error.ts':
            'export class OrderNotFoundError extends Error {}\n',
        },
      },
      {
        condition: "a helper file's suffix is joined by a hyphen",
        files: {
          'src/shared/utils/date-utils.ts': 'export const today = 1;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the role is spelled after a dot',
        files: {
          'src/features/orders/application/contracts/order-repository.port.ts':
            'export interface OrderRepositoryPort {\n  readonly save: () => void;\n}\n',
        },
      },
      {
        condition: 'a hook ends in the word error outside the errors folder',
        files: {
          'src/presentation/hooks/use-form-error.ts': 'export const useFormError = 1;\n',
        },
      },
      {
        condition: 'a script outside the source ends in a role word',
        files: {
          'scripts/release-port.ts': 'export const port = 1;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'surface-imported-by-its-folders-path',
    reported: [
      {
        condition: "an import ends at a feature's index",
        files: {
          'src/x.ts': "import { placeOrder } from '#/features/orders/index';\n\nplaceOrder();\n",
        },
      },
      {
        condition: "a re-export ends at a folder's index",
        files: {
          'src/x.ts': "export { Money } from './value-objects/index';\n",
        },
      },
      {
        condition: "a dynamic import ends at a folder's index",
        files: {
          'src/x.ts':
            "export const load = async (): Promise<unknown> => import('./orders/index');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'an import ends at the folder',
        files: {
          'src/x.ts': "import { placeOrder } from '#/features/orders';\n\nplaceOrder();\n",
        },
      },
      {
        condition: 'a runtime without a bundler loads the surface by its file',
        files: {
          'src/x.ts': "import { run } from './lib/index.js';\n\nrun();\n",
        },
      },
      {
        condition: 'a package of the registry is imported by a path',
        files: {
          'src/x.ts': "import index from 'lodash/index';\n\nindex();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'aggregate-rebuild-kept-off-its-companion',
    unit: {
      blocks: [
        'bun-test',
        'data',
      ],
    },
    reported: [
      {
        condition: 'the companion holds the rebuild as a pair',
        files: {
          [ORDER_AGGREGATE]:
            'export const Order = {\n  restore: (row: OrderRow): Order => row,\n  isPaid: (order: Order): boolean => order.paid,\n} as const;\n',
        },
      },
      {
        condition: 'the companion holds the rebuild as a method',
        files: {
          [ORDER_AGGREGATE]:
            'export const Order = {\n  restoreOrder(row: OrderRow): Order {\n    return row;\n  },\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the rebuild is a free function beside the type',
        files: {
          [ORDER_AGGREGATE]:
            'export const restoreOrder = (row: OrderRow): Order => row;\n\nexport const Order = {\n  isPaid: (order: Order): boolean => order.paid,\n} as const;\n',
        },
      },
      {
        condition: 'a member opens with a longer word',
        files: {
          [ORDER_AGGREGATE]:
            'export const Order = {\n  restored: (order: Order): boolean => order.paid,\n} as const;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'rebuild-from-storage-called-only-by-its-adapters',
    unit: {
      blocks: [
        'bun-test',
        'data',
      ],
    },
    reported: [
      {
        condition: 'a use case calls the rebuild',
        files: {
          [IMPORT_ORDER_USE_CASE]:
            'export const importOrder = (row: OrderRow): Order => restoreOrder(row);\n',
        },
      },
      {
        condition: 'a use case calls the rebuild through a companion',
        files: {
          [IMPORT_ORDER_USE_CASE]:
            'export const importOrder = (row: OrderRow): Order => Order.restore(row);\n',
        },
      },
    ],
    allowed: [
      {
        condition: "the repository's adapter calls the rebuild",
        files: {
          'src/features/orders/infrastructure/sql/sql-order-repository.adapter.ts':
            'export const find = (row: OrderRow): Order => restoreOrder(row);\n',
        },
      },
      {
        condition: 'a spec calls the rebuild',
        files: {
          'src/features/orders/application/use-cases/commands/__tests__/import-order.use-case.test.ts':
            'export const order = restoreOrder(row);\n',
        },
      },
      {
        condition: 'a use case calls a function whose name opens with a longer word',
        files: {
          [IMPORT_ORDER_USE_CASE]:
            'export const importOrder = (row: OrderRow): Order => restored(row);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'opened-connection-verifies-its-peer',
    unit: {
      blocks: [
        'bun-test',
        'transports',
      ],
    },
    reported: [
      {
        condition: "a client's certificate check is turned off",
        files: {
          'src/libs/db/client.ts':
            'export const options = { ssl: { rejectUnauthorized: false } };\n',
        },
      },
      {
        condition: "the runtime's verification is switched off",
        files: {
          'src/root/start.ts': "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';\n",
        },
      },
      {
        condition: "the runtime's verification is switched off by its key",
        files: {
          'src/root/start.ts': "process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';\n",
        },
      },
      {
        condition: "the peer's name is accepted whatever it is",
        files: {
          'src/libs/db/client.ts':
            'export const options = { checkServerIdentity: () => undefined };\n',
        },
      },
      {
        condition: "a child's environment switches the verification off",
        files: {
          'src/libs/run.ts': "export const env = { NODE_TLS_REJECT_UNAUTHORIZED: '0' };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a private authority is trusted',
        files: {
          'src/libs/db/client.ts':
            'export const options = { ssl: { rejectUnauthorized: true, ca: authority } };\n',
        },
      },
      {
        condition: 'a spec reaches a local engine',
        files: {
          'src/libs/db/__tests__/client.integration.test.ts':
            'export const options = { ssl: { rejectUnauthorized: false } };\n',
        },
      },
      {
        condition: "the peer's name is checked against a pin",
        files: {
          'src/libs/db/client.ts':
            'export const options = {\n  checkServerIdentity: (host: string, cert: PeerCertificate) => checkPinned(host, cert),\n};\n',
        },
      },
      {
        condition: "the runtime's verification is switched on",
        files: {
          'src/root/start.ts': "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';\n",
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'opened-connection-verifies-its-peer',
    unit: {
      blocks: [
        'transports',
      ],
    },
    reported: [
      {
        condition: "a context's certificate check is turned off",
        files: {
          'src/shop/libs/client.py': 'context.verify_mode = ssl.CERT_NONE\n',
        },
      },
      {
        condition: "a context's name check is turned off",
        files: {
          'src/shop/libs/client.py': 'context.check_hostname = False\n',
        },
      },
      {
        condition: 'an unverified context is made',
        files: {
          'src/shop/libs/client.py': 'context = ssl._create_unverified_context()\n',
        },
      },
      {
        condition: 'the switch is imported from ssl',
        files: {
          'src/shop/libs/client.py': 'from ssl import CERT_NONE\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a private authority is trusted',
        files: {
          'src/shop/libs/client.py': 'context = ssl.create_default_context(cafile=AUTHORITY)\n',
        },
      },
      {
        condition: 'a spec reaches a local engine',
        files: {
          'tests/integration/test_client.py': 'context.check_hostname = False\n',
        },
      },
      {
        condition: 'the name check is kept on',
        files: {
          'src/shop/libs/client.py': 'context.check_hostname = True\n',
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'manifest-declares-the-module-type',
    unit: {
      blocks: [
        'js-runtime',
        'json',
      ],
    },
    reported: [
      {
        condition: 'the manifest sets no type',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "private": true\n}\n',
        },
      },
      {
        condition: 'the manifest sets the type commonjs',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "commonjs"\n}\n',
        },
      },
      {
        condition: "a package's manifest below the root sets no type",
        files: {
          'packages/tokens/package.json': '{\n  "name": "@acme/tokens"\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the manifest sets the type module',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "module"\n}\n',
        },
      },
      {
        condition: 'a nested object sets a type of its own',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "config": {\n    "type": "app"\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'hash-alias-for-the-source-root',
    unit: {
      blocks: [
        'js-runtime',
        'json',
      ],
    },
    reported: [
      {
        condition: 'the source root is aliased under another name',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "imports": {\n    "#src/*": "./src/*"\n  }\n}\n',
        },
      },
      {
        condition: 'the alias names another folder',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "imports": {\n    "#/*": "./lib/*"\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the alias names the source root',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "imports": {\n    "#/*": "./src/*"\n  }\n}\n',
        },
      },
      {
        condition: 'the manifest declares no imports',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "module"\n}\n',
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'manifest-exports-with-types-condition',
    unit: {
      blocks: [
        'distribution',
        'js-runtime',
        'json',
      ],
    },
    reported: [
      {
        condition: 'the exports are a bare string of code',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  },\n  "exports": "./dist/index.js"\n}\n',
        },
      },
      {
        condition: 'the types condition follows the code',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  },\n  "exports": {\n    ".": {\n      "import": "./dist/index.js",\n      "types": "./dist/index.d.ts"\n    }\n  }\n}\n',
        },
      },
      {
        condition: 'a subpath is a bare string of code',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  },\n  "exports": {\n    "./testing": "./dist/testing.js"\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'every entry of code carries its types first',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  },\n  "exports": {\n    ".": {\n      "types": "./dist/index.d.ts",\n      "default": "./dist/index.js"\n    },\n    "./nested": {\n      "import": {\n        "types": "./dist/nested.d.ts",\n        "default": "./dist/nested.js"\n      }\n    }\n  }\n}\n',
        },
      },
      {
        condition: 'an entry ships no code',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  },\n  "exports": {\n    "./styles.css": "./dist/styles.css",\n    "./package.json": "./package.json"\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'manifest-declares-the-runtime-floor',
    unit: {
      blocks: [
        'distribution',
        'json',
      ],
    },
    reported: [
      {
        condition: 'the published manifest declares no engines',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "module",\n  "version": "1.0.0"\n}\n',
        },
      },
      {
        condition: 'the published manifest declares empty engines',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {}\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the manifest declares its runtime floor',
        files: {
          [MANIFEST]:
            '{\n  "name": "@acme/shop",\n  "type": "module",\n  "engines": {\n    "node": ">=22"\n  }\n}\n',
        },
      },
      {
        condition: 'the package is private',
        files: {
          [MANIFEST]: '{\n  "name": "@acme/shop",\n  "type": "module",\n  "private": true\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'runtime-module-with-an-effect-imported-only-by-the-edge',
    unit: {
      blocks: [
        'bun-test',
        'js-runtime',
      ],
    },
    reported: [
      {
        condition: 'a use case imports the file system',
        files: {
          [ISSUE_INVOICE_USE_CASE]:
            "import { writeFile } from 'node:fs/promises';\n\nwriteFile();\n",
        },
      },
      {
        condition: 'the kernel imports a module without its prefix',
        files: {
          'src/kernel/utils/host.ts':
            "import os from 'os';\n\nexport const host = os.hostname();\n",
        },
      },
      {
        condition: 'a use case loads a module dynamically',
        files: {
          [ISSUE_INVOICE_USE_CASE]:
            "export const load = async (): Promise<unknown> => import('node:child_process');\n",
        },
      },
      {
        condition: "a use case imports the runtime's own store",
        files: {
          [ISSUE_INVOICE_USE_CASE]:
            "import { DatabaseSync } from 'node:sqlite';\n\nDatabaseSync();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'an adapter imports the file system',
        files: {
          'src/features/invoices/infrastructure/files/invoice-archive.adapter.ts':
            "import { writeFile } from 'node:fs/promises';\n\nwriteFile();\n",
        },
      },
      {
        condition: 'a use case imports types alone',
        files: {
          [ISSUE_INVOICE_USE_CASE]:
            "import type { Stats } from 'node:fs';\n\nexport type Size = Stats;\n",
        },
      },
      {
        condition: 'a use case imports a package of the registry named like a module',
        files: {
          [ISSUE_INVOICE_USE_CASE]: "import { open } from 'sqlite';\n\nopen();\n",
        },
      },
      {
        condition: 'the root imports a module that holds an effect',
        files: {
          'src/root/start.ts': "import { readFile } from 'node:fs/promises';\n\nreadFile();\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'bun-module-with-an-effect-imported-only-by-the-edge',
    unit: {
      blocks: [
        'bun-test',
        'js-runtime/bun',
      ],
    },
    reported: [
      {
        condition: "a use case reads a file through Bun's global",
        files: {
          [ISSUE_INVOICE_USE_CASE]: "export const read = (): unknown => Bun.file('invoice.pdf');\n",
        },
      },
      {
        condition: "the kernel imports Bun's store",
        files: {
          'src/kernel/db.ts': "import { Database } from 'bun:sqlite';\n\nDatabase();\n",
        },
      },
      {
        condition: 'the kernel imports a process starter from bun',
        files: {
          'src/kernel/start.ts': "import { spawn } from 'bun';\n\nspawn();\n",
        },
      },
      {
        condition: "a use case reads the environment through Bun's global",
        files: {
          [ISSUE_INVOICE_USE_CASE]: "export const region = (): unknown => Bun.env['REGION'];\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a use case computes a hash through Bun's global",
        files: {
          [ISSUE_INVOICE_USE_CASE]:
            'export const digest = (text: string): number => Number(Bun.hash(text));\n',
        },
      },
      {
        condition: 'a spec module and types alone are imported',
        files: {
          'src/kernel/x.ts':
            "import { describe } from 'bun:test';\nimport type { Server } from 'bun';\n\ndescribe('x', () => {});\n\nexport type Host = Server;\n",
        },
      },
      {
        condition: 'the root serves through Bun',
        files: {
          'src/root/server.ts':
            'export const start = (): unknown => Bun.serve({ fetch: () => new Response() });\n',
        },
      },
    ],
  },
];

export { typescriptPluginRows };
