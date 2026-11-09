import { describe, expect, it } from 'bun:test';

import {
  codesOfWholeTree,
  filesWithRestrictedImports,
  repeatedPluginPaths,
  unwrittenPresetWords,
  warnedRules,
  widestStatus,
} from './biome-preset.fixtures';

describe("the configuration Biome's presets write", () => {
  it('should load in Biome with no key, rule or plugin it does not know when a unit follows every block Biome is configured for', async () => {
    // Act
    const status = await widestStatus();

    // Assert
    expect(status).toBe(0);
  });

  it('should declare each plugin in one entry when a unit follows every block Biome is configured for', () => {
    // Act
    const repeated = repeatedPluginPaths();

    // Assert
    expect(repeated).toStrictEqual([]);
  });

  it('should name only folders, files and suffixes the blocks write when the preset scopes its rules', () => {
    // Act
    const unwritten = unwrittenPresetWords();

    // Assert
    expect(unwritten).toStrictEqual([]);
  });

  it('should hold no rule at warn when a unit follows every block Biome is configured for', () => {
    // Act
    const warned = warnedRules();

    // Assert
    expect(warned).toStrictEqual([]);
  });

  it("should refuse only the other side's port when the use cases of both sides import from one contracts surface", async () => {
    // Arrange
    const application = 'src/features/orders/application';

    // Act
    const files = await filesWithRestrictedImports({
      [`${application}/contracts/index.ts`]:
        "export type { OrderQueries } from './order-queries.port';\nexport type { OrderRepository } from './order-repository.port';\n",
      [`${application}/contracts/order-queries.port.ts`]:
        'export interface OrderQueries {\n  readonly count: () => Promise<number>;\n}\n',
      [`${application}/contracts/order-repository.port.ts`]:
        'export interface OrderRepository {\n  readonly has: (id: string) => Promise<boolean>;\n}\n',
      [`${application}/use-cases/commands/cancel-order.use-case.ts`]:
        "import type { OrderQueries } from '../../contracts';\n\nexport const cancelOrder = async (queries: OrderQueries): Promise<number> =>\n  await queries.count();\n",
      [`${application}/use-cases/commands/place-order.use-case.ts`]:
        "import type { OrderRepository } from '../../contracts';\n\nexport const placeOrder = async (orders: OrderRepository): Promise<boolean> =>\n  await orders.has('order');\n",
      [`${application}/use-cases/queries/count-orders.use-case.ts`]:
        "import type { OrderQueries } from '../../contracts';\n\nexport const countOrders = async (queries: OrderQueries): Promise<number> =>\n  await queries.count();\n",
      [`${application}/use-cases/queries/find-order.use-case.ts`]:
        "import type { OrderRepository } from '../../contracts';\n\nexport const findOrder = async (orders: OrderRepository): Promise<boolean> =>\n  await orders.has('order');\n",
    });

    // Assert
    expect(files).toStrictEqual([
      'src/features/orders/application/use-cases/commands/cancel-order.use-case.ts',
      'src/features/orders/application/use-cases/queries/find-order.use-case.ts',
    ]);
  });

  it('should refuse a namespace import in the use cases of both sides, a type-only one included', async () => {
    // Arrange
    const application = 'src/features/orders/application';

    // Act
    const files = await filesWithRestrictedImports({
      [`${application}/contracts/index.ts`]:
        "export type { OrderQueries } from './order-queries.port';\nexport type { OrderRepository } from './order-repository.port';\n",
      [`${application}/contracts/order-queries.port.ts`]:
        'export interface OrderQueries {\n  readonly count: () => Promise<number>;\n}\n',
      [`${application}/contracts/order-repository.port.ts`]:
        'export interface OrderRepository {\n  readonly has: (id: string) => Promise<boolean>;\n}\n',
      [`${application}/use-cases/commands/cancel-order.use-case.ts`]:
        "import type * as contracts from '../../contracts';\n\nexport const cancelOrder = async (queries: contracts.OrderQueries): Promise<number> =>\n  await queries.count();\n",
      [`${application}/use-cases/queries/find-order.use-case.ts`]:
        "import * as contracts from '../../contracts';\n\nexport const findOrder = async (orders: contracts.OrderRepository): Promise<boolean> =>\n  await orders.has('order');\n",
    });

    // Assert
    expect(files).toStrictEqual([
      'src/features/orders/application/use-cases/commands/cancel-order.use-case.ts',
      'src/features/orders/application/use-cases/queries/find-order.use-case.ts',
    ]);
  });

  it("should keep refusing a date library in a query's use case beside the repository it refuses there", async () => {
    // Arrange
    const feature = 'src/features/orders';

    // Act
    const files = await filesWithRestrictedImports({
      [`${feature}/application/contracts/index.ts`]:
        "export type { OrderRepository } from './order-repository.port';\n",
      [`${feature}/application/contracts/order-repository.port.ts`]:
        'export interface OrderRepository {\n  readonly has: (id: string) => Promise<boolean>;\n}\n',
      [`${feature}/application/use-cases/queries/find-order.use-case.ts`]:
        "import moment from 'moment';\n\nimport type { OrderRepository } from '../../contracts';\n\nexport const findOrder = async (orders: OrderRepository): Promise<string> =>\n  (await orders.has('order')) ? moment().toISOString() : '';\n",
      [`${feature}/domain/order/value-objects/order-date.value-object.ts`]:
        "import moment from 'moment';\n\nexport const orderDate = (): string => moment().toISOString();\n",
    });

    // Assert
    expect(files).toStrictEqual([
      'src/features/orders/application/use-cases/queries/find-order.use-case.ts',
      'src/features/orders/application/use-cases/queries/find-order.use-case.ts',
      'src/features/orders/domain/order/value-objects/order-date.value-object.ts',
    ]);
  });

  it('should leave .droneey/constitution alone when a project lints its whole tree', async () => {
    // Act
    const codes = await codesOfWholeTree({
      '.droneey/constitution/probe.ts': 'export const data = null;\n',
      'src/order.ts': "export const ORDER_KIND = 'order';\n",
    });

    // Assert
    expect(codes).toStrictEqual([]);
  });
});
