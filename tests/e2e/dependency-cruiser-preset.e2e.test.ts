import { describe, expect, it } from 'bun:test';

import { cruise } from './dependency-cruiser-preset.fixtures';

const exported = (name: string): string => `export const ${name} = 1;\n`;

const importing = (input: { from: string; name: string }): string =>
  `import { ${input.name} } from '${input.from}';\nexport const uses = ${input.name};\n`;

const WELL_FORMED = {
  'src/adapters/mail/index.ts': "export { sendMail } from './mail.adapter';\n",
  'src/adapters/mail/mail.adapter.ts': importing({
    from: '../../libs/smtp',
    name: 'smtp',
  }),
  'src/contracts/mail/index.ts': "export type { Mail } from './mail.port';\n",
  'src/contracts/mail/mail.port.ts':
    "import type { Money } from '../../kernel';\nexport interface Mail { cost: Money }\n",
  'src/features/orders/domain/entities/__tests__/order.entity.test.ts':
    "import { expect } from 'bun:test';\nimport { order } from '../order.entity';\nexpect(order).toBe(1);\n",
  'src/features/orders/adapters/api/order.adapter.ts': importing({
    from: '../../domain/entities',
    name: 'order',
  }),
  'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts': importing({
    from: '../../../../domain/entities',
    name: 'order',
  }),
  'src/features/orders/app/use-cases/queries/count-orders/count-orders.use-case.ts': importing({
    from: '../../../../domain/use-cases/queries/count-orders',
    name: 'countOrders',
  }),
  'src/features/orders/domain/use-cases/queries/count-orders/count-orders.use-case.ts':
    "import type { Mail } from '../../../../../../contracts/mail';\nexport const countOrders = (mail: Mail): Mail => mail;\n",
  'src/features/orders/domain/use-cases/queries/count-orders/index.ts':
    "export { countOrders } from './count-orders.use-case';\n",
  'src/features/orders/domain/entities/index.ts': "export { order } from './order.entity';\n",
  'src/features/orders/domain/entities/order.entity.ts':
    "import { money } from '../../../../kernel';\nexport const order = money;\n",
  'src/features/orders/index.ts':
    "export { listOrders } from './app/use-cases/queries/list-orders/list-orders.use-case';\n",
  'src/kernel/index.ts':
    "export { money } from './money';\nexport type { Money } from './money';\n",
  'src/kernel/money.ts': 'export const money = 1;\nexport type Money = number;\n',
  'src/libs/smtp/index.ts': "export { smtp } from './smtp';\n",
  'src/libs/smtp/smtp.ts': exported('smtp'),
  'src/main.ts': importing({
    from: './root/wiring',
    name: 'wiring',
  }),
  'src/root/wiring.ts':
    "import { sendMail } from '../adapters/mail';\nimport { listOrders } from '../features/orders';\nexport const wiring = [sendMail, listOrders];\n",
  'src/shared/format/index.ts': "export { format } from './format';\n",
  'src/shared/format/format.ts': importing({
    from: '../../kernel',
    name: 'money',
  }),
};

describe('the dependency-cruiser layer set', () => {
  it('should report no violation when an application follows the layer matrix', () => {
    // Arrange
    const project = {
      files: WELL_FORMED,
    };

    // Act
    const { cruised, violations } = cruise(project);

    // Assert
    expect({
      cruisedAny: cruised > 0,
      violations,
    }).toStrictEqual({
      cruisedAny: true,
      violations: [],
    });
  });

  it.each([
    {
      condition: 'the domain imports a vendor package',
      files: {
        'src/features/orders/domain/entities/order.entity.ts':
          "import { readFile } from 'node:fs';\nexport const order = readFile;\n",
      },
      rule: 'domain-reaches-only-itself-and-kernel',
    },
    {
      condition: 'the domain imports a library',
      files: {
        'src/features/orders/domain/entities/order.entity.ts': importing({
          from: '../../../../libs/smtp',
          name: 'smtp',
        }),
        'src/libs/smtp/index.ts': exported('smtp'),
      },
      rule: 'domain-reaches-only-itself-and-kernel',
    },
    {
      condition: 'the kernel imports shared code',
      files: {
        'src/kernel/money.ts': importing({
          from: '../shared/format',
          name: 'format',
        }),
        'src/shared/format/index.ts': exported('format'),
      },
      rule: 'kernel-reaches-only-itself',
    },
    {
      condition: 'a library imports the kernel',
      files: {
        'src/kernel/index.ts': exported('money'),
        'src/libs/smtp/smtp.ts': importing({
          from: '../../kernel',
          name: 'money',
        }),
      },
      rule: 'libs-know-no-application',
    },
    {
      condition: 'shared code imports a feature',
      files: {
        'src/features/orders/index.ts': exported('orders'),
        'src/shared/format/format.ts': importing({
          from: '../../features/orders',
          name: 'orders',
        }),
      },
      rule: 'shared-knows-no-feature-or-root',
    },
    {
      condition: 'a feature imports the composition root',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../root/wiring',
          name: 'wiring',
        }),
        'src/root/wiring.ts': exported('wiring'),
      },
      rule: 'root-reached-only-from-entries',
    },
    {
      condition: 'a router file imports the composition root',
      files: {
        'src/root/wiring.ts': exported('wiring'),
        'src/router.tsx': importing({
          from: './root/wiring',
          name: 'wiring',
        }),
      },
      rule: 'root-reached-only-from-entries',
    },
    {
      condition: 'code imports the entry',
      files: {
        'src/main.ts': exported('main'),
        'src/shared/format/format.ts': importing({
          from: '../../main',
          name: 'main',
        }),
      },
      rule: 'entry-never-imported',
    },
    {
      condition: 'the application imports an entrypoint',
      files: {
        'src/entrypoints/export/export.ts': exported('run'),
        'src/shared/format/format.ts': importing({
          from: '../../entrypoints/export/export',
          name: 'run',
        }),
      },
      rule: 'entrypoint-reached-only-from-itself',
    },
    {
      condition: 'an entrypoint imports another',
      files: {
        'src/entrypoints/export/export.ts': importing({
          from: '../import/import',
          name: 'run',
        }),
        'src/entrypoints/import/import.ts': exported('run'),
      },
      rule: 'entrypoints-blind-to-each-other',
    },
    {
      condition: 'a feature imports another',
      files: {
        'src/features/billing/index.ts': exported('invoice'),
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../billing',
          name: 'invoice',
        }),
      },
      rule: 'features-blind-to-each-other',
    },
    {
      condition: 'a module reaches past another module’s surface',
      files: {
        'src/libs/smtp/smtp.ts': exported('smtp'),
        'src/shared/format/format.ts': importing({
          from: '../../libs/smtp/smtp',
          name: 'smtp',
        }),
      },
      rule: 'module-reached-through-its-surface',
    },
    {
      condition: 'the root reaches past a feature’s surface',
      files: {
        'src/features/orders/app/order.use-case.ts': exported('order'),
        'src/root/wiring.ts': importing({
          from: '../features/orders/app/order.use-case',
          name: 'order',
        }),
      },
      rule: 'module-reached-through-its-surface-from-outside-modules',
    },
    {
      condition: 'a feature reaches past the kernel’s surface',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../kernel/money',
          name: 'money',
        }),
        'src/kernel/money.ts': exported('money'),
      },
      rule: 'kernel-reached-through-its-surface',
    },
    {
      condition: 'a module imports its own surface',
      files: {
        'src/libs/smtp/index.ts': exported('smtp'),
        'src/libs/smtp/client.ts': importing({
          from: '.',
          name: 'smtp',
        }),
      },
      rule: 'module-never-imports-its-own-surface',
    },
    {
      condition: 'the application layer reaches past a domain role’s surface',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../domain/entities/order.entity',
          name: 'order',
        }),
        'src/features/orders/domain/entities/order.entity.ts': exported('order'),
      },
      rule: 'domain-role-reached-through-its-surface',
    },
    {
      condition: 'code imports a layer folder',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../domain',
          name: 'order',
        }),
        'src/features/orders/domain/index.ts': exported('order'),
      },
      rule: 'layer-folder-never-a-target',
    },
    {
      condition: 'a contract imports an adapter',
      files: {
        'src/adapters/mail/index.ts': exported('sendMail'),
        'src/contracts/mail/mail.port.ts': importing({
          from: '../../adapters/mail',
          name: 'sendMail',
        }),
      },
      rule: 'contract-knows-only-itself-and-kernel',
    },
    {
      condition: 'an adapter imports another adapter',
      files: {
        'src/adapters/mail/mail.adapter.ts': importing({
          from: '../sms',
          name: 'sendSms',
        }),
        'src/adapters/sms/index.ts': exported('sendSms'),
      },
      rule: 'adapters-blind-to-each-other',
    },
    {
      condition: 'an adapter imports the application layer of a feature',
      files: {
        'src/features/orders/adapters/api/order.adapter.ts': importing({
          from: '../../app/order.use-case',
          name: 'order',
        }),
        'src/features/orders/app/order.use-case.ts': exported('order'),
      },
      rule: 'adapters-know-no-caller',
    },
    {
      condition: 'a read imports a write',
      files: {
        'src/features/orders/app/use-cases/commands/cancel/cancel.use-case.ts': exported('cancel'),
        'src/features/orders/app/use-cases/queries/list/list.use-case.ts': importing({
          from: '../../commands/cancel/cancel.use-case',
          name: 'cancel',
        }),
      },
      rule: 'reads-never-reach-writes',
    },
    {
      condition: 'a write imports a read',
      files: {
        'src/features/orders/app/use-cases/commands/cancel/cancel.use-case.ts': importing({
          from: '../../queries/list/list.use-case',
          name: 'list',
        }),
        'src/features/orders/app/use-cases/queries/list/list.use-case.ts': exported('list'),
      },
      rule: 'writes-never-reach-reads',
    },
    {
      condition: 'a shared helper imports an adapter',
      files: {
        'src/adapters/api/index.ts': exported('fetchOrders'),
        'src/shared/http/index.ts': importing({
          from: '../../adapters/api',
          name: 'fetchOrders',
        }),
      },
      rule: 'shared-knows-no-feature-or-root',
    },
    {
      condition: "a module loose at a feature's root is imported",
      files: {
        'src/features/orders/app/use-cases/queries/list/list.use-case.ts': importing({
          from: '../../../../utils',
          name: 'format',
        }),
        'src/features/orders/utils.ts': exported('format'),
      },
      rule: 'feature-root-reached-only-through-its-layers',
    },
    {
      condition: 'a write reaches a read through a surface that joins both',
      files: {
        'src/features/orders/app/use-cases/commands/cancel/cancel.use-case.ts': importing({
          from: '../../../../domain/contracts',
          name: 'cancelOrder',
        }),
        'src/features/orders/domain/contracts/index.ts':
          "export { cancelOrder } from './repositories/commands/order.repository';\nexport { listOrders } from './repositories/queries/order.repository';\n",
        'src/features/orders/domain/contracts/repositories/commands/order.repository.ts':
          exported('cancelOrder'),
        'src/features/orders/domain/contracts/repositories/queries/order.repository.ts':
          exported('listOrders'),
      },
      rule: 'writes-never-reach-reads',
    },
  ])('should report $rule when $condition', ({ files, rule }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toContain(rule);
  });

  it.each([
    {
      condition: 'a component imports an adapter',
      files: {
        'src/adapters/api/index.ts': exported('fetchOrders'),
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: '../../../../adapters/api',
          name: 'fetchOrders',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
      rule: 'components-take-data-and-callbacks',
    },
    {
      condition: "a feature's adapter imports another feature's adapter",
      files: {
        'src/features/billing/adapters/api/index.ts': exported('charge'),
        'src/features/orders/adapters/api/index.ts': importing({
          from: '../../../billing/adapters/api',
          name: 'charge',
        }),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'feature-adapters-blind-to-each-other',
    },
    {
      condition: 'an adapter imports a screen',
      files: {
        'src/adapters/api/index.ts': importing({
          from: '../../routes/orders',
          name: 'OrdersScreen',
        }),
        'src/routes/orders.tsx': exported('OrdersScreen'),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'adapters-know-no-routes',
    },
    {
      condition: 'an adapter imports a mobile screen',
      files: {
        'src/adapters/api/index.ts': importing({
          from: '../../routes/orders',
          name: 'OrdersScreen',
        }),
        'src/routes/orders.tsx': exported('OrdersScreen'),
      },
      parts: [
        'typescript/architecture/expo',
        'typescript/architecture/core',
      ],
      rule: 'adapters-know-no-routes',
    },
    {
      condition: 'a shared module imports a mobile screen',
      files: {
        'src/routes/orders.tsx': exported('OrdersScreen'),
        'src/shared/navigation/index.ts': importing({
          from: '../../routes/orders',
          name: 'OrdersScreen',
        }),
      },
      parts: [
        'typescript/architecture/expo',
        'typescript/architecture/core',
      ],
      rule: 'routes-reached-only-from-expo-router',
    },
    {
      condition: 'a shared module imports a command',
      files: {
        'src/cli/sync.cli.ts': exported('sync'),
        'src/shared/jobs/index.ts': importing({
          from: '../../cli/sync.cli',
          name: 'sync',
        }),
      },
      parts: [
        'typescript/architecture/cli',
        'typescript/architecture/core',
      ],
      rule: 'commands-reached-only-from-entries',
    },
    {
      condition: 'an adapter imports a command',
      files: {
        'src/adapters/api/index.ts': importing({
          from: '../../cli/sync.cli',
          name: 'sync',
        }),
        'src/cli/sync.cli.ts': exported('sync'),
      },
      parts: [
        'typescript/architecture/cli',
        'typescript/architecture/core',
      ],
      rule: 'adapters-know-no-commands',
    },
    {
      condition: 'a component imports the HTTP client',
      files: {
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: 'ky',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/ky',
        'typescript/architecture/core',
      ],
      rule: 'components-never-fetch',
    },
    {
      condition: 'a component imports the query library',
      files: {
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: '@tanstack/react-query',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-query',
        'typescript/architecture/core',
      ],
      rule: 'components-never-query',
    },
    {
      condition: 'a widget imports an adapter',
      files: {
        'src/features/orders/adapters/api/order.adapter.ts': exported('fetchOrders'),
        'src/features/orders/ui/widgets/orders.tsx': importing({
          from: '../../adapters/api/order.adapter',
          name: 'fetchOrders',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
      rule: 'ui-reaches-no-mechanism',
    },
    {
      condition: 'a primitive imports the message library',
      files: {
        'src/libs/ui/button.tsx': importing({
          from: '@lingui/core',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/lingui',
        'typescript/architecture/core',
      ],
      rule: 'primitives-hold-no-text',
    },
    {
      condition: 'a component imports a router primitive',
      files: {
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: '@tanstack/react-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'router-primitives-only-in-screens-and-widgets',
    },
    {
      condition: 'a screen’s piece imports a router primitive',
      files: {
        'src/routes/orders/-components/order-list.tsx': importing({
          from: '@tanstack/react-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'screen-pieces-never-navigate',
    },
    {
      condition: 'a feature imports the analytics contract',
      files: {
        'src/contracts/analytics/index.ts': exported('track'),
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../contracts/analytics',
          name: 'track',
        }),
      },
      parts: [
        'typescript/architecture/analytics',
        'typescript/architecture/core',
      ],
      rule: 'features-never-track',
    },
    {
      condition: 'the application layer imports the message library',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '@lingui/core',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/lingui',
        'typescript/architecture/core',
      ],
      rule: 'application-returns-codes-not-text',
    },
    {
      condition: 'production code imports a story',
      files: {
        'src/libs/ui/button.stories.tsx': exported('primary'),
        'src/libs/ui/button.tsx': importing({
          from: './button.stories',
          name: 'primary',
        }),
      },
      parts: [
        'typescript/foundation/storybook',
        'typescript/architecture/core',
      ],
      rule: 'stories-unreachable-from-production',
    },
    {
      condition: 'the application layer imports yaml',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: 'yaml',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/yaml',
        'typescript/architecture/core',
      ],
      rule: 'yaml-only-at-the-edge',
    },
    {
      condition: 'a component imports a widget',
      files: {
        'src/features/orders/ui/widgets/orders-widget/index.ts': exported('ordersWidget'),
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: '../widgets/orders-widget',
          name: 'ordersWidget',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
      rule: 'components-never-import-widgets',
    },
    {
      condition: 'a binding unit imports an adapter',
      files: {
        'src/features/orders/adapters/api/index.ts': exported('ordersAdapter'),
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts': importing({
          from: '../../../../adapters/api',
          name: 'ordersAdapter',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
      rule: 'binding-units-reach-no-adapter-or-ui',
    },
    {
      condition: 'a binding unit imports a component',
      files: {
        'src/features/orders/ui/components/order-card.tsx': exported('orderCard'),
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts': importing({
          from: '../../../../ui/components/order-card',
          name: 'orderCard',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
      rule: 'binding-units-reach-no-adapter-or-ui',
    },
    {
      condition: 'an adapter imports the cache library',
      files: {
        'src/features/orders/adapters/api/orders.adapter.ts': importing({
          from: '@tanstack/react-query',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-query',
        'typescript/architecture/core',
      ],
      rule: 'adapters-never-cache',
    },
    {
      condition: 'a library imports the cache library',
      files: {
        'src/libs/http/client.ts': importing({
          from: '@tanstack/react-query',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-query',
        'typescript/architecture/core',
      ],
      rule: 'libs-never-cache',
    },
    {
      condition: 'a library imports the router',
      files: {
        'src/libs/http/client.ts': importing({
          from: '@tanstack/react-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'libs-never-route',
    },
    {
      condition: 'a feature imports a screen',
      files: {
        'src/features/orders/ui/widgets/orders-widget/orders-widget.tsx': importing({
          from: '../../../../../routes/orders',
          name: 'route',
        }),
        'src/routes/orders.tsx': exported('route'),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'routes-reached-only-from-the-router',
    },
    {
      condition: 'a route piece imports its route file',
      files: {
        'src/routes/orders/-components/orders-table.tsx': importing({
          from: '../index',
          name: 'route',
        }),
        'src/routes/orders/index.tsx': exported('route'),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'route-pieces-never-import-route-files',
    },
  ])(
    'should report $rule when $condition and a project extends that part',
    ({ files, parts, rule }) => {
      // Arrange
      const project = {
        files,
        parts,
      };

      // Act
      const { violations } = cruise(project);

      // Assert
      expect(violations).toContain(rule);
    },
  );

  it("should report no violation when a feature's surface re-exports its widget and a project extends the ui part", () => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/index.ts':
          "export { ordersWidget } from './ui/widgets/orders-widget';\n",
        'src/features/orders/ui/widgets/orders-widget/index.ts':
          "export { ordersWidget } from './orders-widget';\n",
        'src/features/orders/ui/widgets/orders-widget/orders-widget.tsx': exported('ordersWidget'),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toStrictEqual([]);
  });

  it('should report no violation when a widget imports an enum of its entities at run time', () => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/domain/entities/index.ts':
          "export enum OrderStatus {\n  Pending = 'pending',\n}\n",
        'src/features/orders/ui/widgets/orders-widget/orders-widget.tsx': importing({
          from: '../../../domain/entities',
          name: 'OrderStatus',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/core',
      ],
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toStrictEqual([]);
  });

  it('should report no violation when an application follows the rules of every part', () => {
    // Arrange
    const project = {
      files: {
        'src/features/orders/adapters/api/models/order.model.ts': importing({
          from: 'zod',
          name: 'value',
        }),
        'src/features/orders/adapters/yaml/order.adapter.ts': importing({
          from: 'yaml',
          name: 'value',
        }),
        'src/features/orders/domain/entities/index.ts': 'export type Order = { id: string };\n',
        'src/features/orders/ui/widgets/orders.tsx':
          "import type { Order } from '../../domain/entities';\nimport { value } from '@tanstack/react-router';\nexport const orders: Order[] = [];\nexport const link = value;\n",
        'src/libs/ui/button.stories.tsx': importing({
          from: './button',
          name: 'button',
        }),
        'src/libs/ui/button.tsx': exported('button'),
        'src/root/wiring.ts': exported('wiring'),
        'src/routes/__root.tsx': importing({
          from: '../root/wiring',
          name: 'wiring',
        }),
        'src/routes/orders/index.tsx': importing({
          from: '@tanstack/react-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/tanstack-router',
        'typescript/architecture/analytics',
        'typescript/architecture/lingui',
        'typescript/architecture/tanstack-query',
        'typescript/architecture/ky',
        'typescript/foundation/storybook',
        'typescript/architecture/yaml',
        'typescript/architecture/core',
      ],
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'a package imports another package’s file',
      files: {
        'packages/eros/typescript/core/build.ts': importing({
          from: '../nestjs/configs',
          name: 'configs',
        }),
        'packages/eros/typescript/nestjs/configs.ts': exported('configs'),
      },
      roots: [
        'packages',
      ],
      rule: 'packages-blind-to-each-other',
    },
    {
      condition: 'a package imports the common files of another product',
      files: {
        'packages/eros/typescript/core/build.ts': importing({
          from: '../../../logus/common/kinds',
          name: 'kinds',
        }),
        'packages/logus/common/kinds.ts': exported('kinds'),
      },
      roots: [
        'packages',
      ],
      rule: 'packages-blind-to-each-other',
    },
    {
      condition: 'the common area imports a package',
      files: {
        'packages/eros/common/hooks.ts': importing({
          from: '../typescript/core/build',
          name: 'build',
        }),
        'packages/eros/typescript/core/build.ts': exported('build'),
      },
      roots: [
        'packages',
      ],
      rule: 'common-imports-nothing',
    },
    {
      condition: 'a package imports a file of the repository that holds it',
      files: {
        'packages/eros/typescript/core/build.ts': importing({
          from: '../../../../scripts/release',
          name: 'release',
        }),
        'scripts/release.ts': exported('release'),
      },
      roots: [
        'packages',
        'scripts',
      ],
      rule: 'package-knows-no-consumer',
    },
    {
      condition: 'the root imports a package by its path',
      files: {
        'packages/eros/typescript/core/build.ts': exported('build'),
        'scripts/release.ts': importing({
          from: '../packages/eros/typescript/core/build',
          name: 'build',
        }),
      },
      roots: [
        'packages',
        'scripts',
      ],
      rule: 'root-takes-packages-by-name',
    },
  ])(
    'should report $rule when $condition and a repository of packages extends architecture package',
    ({ files, roots, rule }) => {
      // Arrange
      const project = {
        files,
        parts: [
          'typescript/architecture/package',
        ],
        roots,
      };

      // Act
      const { violations } = cruise(project);

      // Assert
      expect(violations).toContain(rule);
    },
  );

  it('should report no violation when a package imports its own files, the common files of its product and the runtime', () => {
    // Arrange
    const project = {
      files: {
        'packages/eros/common/kinds.ts': exported('kinds'),
        'packages/eros/typescript/core/build.ts':
          "import { readFileSync } from 'node:fs';\nimport { kinds } from '../../common/kinds';\nimport { plugins } from './plugins';\nexport const build = [readFileSync, kinds, plugins];\n",
        'packages/eros/typescript/core/plugins.ts': exported('plugins'),
        'scripts/release.ts': importing({
          from: 'yaml',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/package',
      ],
      roots: [
        'packages',
        'scripts',
      ],
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toStrictEqual([]);
  });
});

describe('the dependency-cruiser foundation parts', () => {
  it.each([
    {
      condition: 'two modules import each other',
      files: {
        'src/order.ts': "import { line } from './line';\nexport const order = line;\n",
        'src/line.ts': "import { order } from './order';\nexport const line = order;\n",
      },
      rule: 'no-circular',
    },
    {
      condition: 'production code imports a fixture',
      files: {
        'src/__tests__/order.fixtures.ts': 'export const anOrder = 1;\n',
        'src/order.ts':
          "import { anOrder } from './__tests__/order.fixtures';\nexport const order = anOrder;\n",
      },
      rule: 'no-test-code-in-production',
    },
    {
      condition: 'production code imports a fixture under tests/',
      files: {
        'src/order.ts':
          "import { shop } from '../tests/load/shop.fixtures';\nexport const order = shop;\n",
        'tests/load/shop.fixtures.ts': 'export const shop = 1;\n',
      },
      rule: 'no-test-code-in-production',
    },
    {
      condition: 'code imports a package the manifest does not declare',
      files: {
        'src/order.ts': "import { ghost } from 'ghost';\nexport const order = ghost;\n",
      },
      rule: 'no-undeclared-dependency',
    },
    {
      condition: 'code imports a module that does not exist',
      files: {
        'src/order.ts': "import { line } from './line';\nexport const order = line;\n",
      },
      rule: 'no-unresolvable',
    },
    {
      condition: 'code imports a deprecated package',
      files: {
        'src/order.ts': "import { legacy } from 'legacy';\nexport const order = legacy;\n",
      },
      rule: 'no-deprecated-dependency',
    },
    {
      condition: 'production code imports a development dependency',
      files: {
        'src/order.ts': "import { devtool } from 'devtool';\nexport const order = devtool;\n",
      },
      rule: 'no-development-dependency-in-production',
    },
    {
      condition: 'code imports a package the manifest declares twice',
      files: {
        'src/order.ts': "import { doubled } from 'doubled';\nexport const order = doubled;\n",
      },
      rule: 'no-duplicate-dep-types',
    },
    {
      condition: 'code imports a deprecated core module',
      files: {
        'src/order.ts': "import { toASCII } from 'punycode';\nexport const order = toASCII;\n",
      },
      rule: 'no-deprecated-core',
    },
  ])('should report $rule when $condition', ({ files, rule }) => {
    // Arrange
    const project = {
      files,
      roots: [
        '.',
      ],
    };

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toContain(rule);
  });

  it.each([
    {
      condition: 'production code imports a declared package and its own modules',
      files: {
        'src/line.ts': 'export const line = 1;\n',
        'src/order.ts':
          "import { kit } from 'kit';\nimport { line } from './line';\nexport const order = kit + line;\n",
      },
    },
    {
      condition: 'production code imports only the types of a development dependency',
      files: {
        'src/order.ts':
          "import type { devtool } from 'devtool';\nexport type Order = typeof devtool;\n",
      },
    },
    {
      condition: 'a hidden folder holds modules that break the rules',
      files: {
        '.cache/order.ts': "import { line } from './line';\nexport const order = line;\n",
        'src/order.ts': 'export const order = 1;\n',
      },
    },
    {
      condition:
        'code imports the tool a package configures, declared as a peer and for development',
      files: {
        'src/order.ts':
          "import { configured } from 'configured';\nexport const order = configured;\n",
      },
    },
    {
      condition: "the root imports a library's stylesheet surface by path",
      files: {
        'src/libs/ui/index.css': '.card {\n  color: inherit;\n}\n',
        'src/root/app.ts': "import '../libs/ui/index.css';\n\nexport const app = 1;\n",
      },
    },
    {
      condition: 'a spec imports a fixture and a development dependency',
      files: {
        'src/__tests__/order.fixtures.ts': 'export const anOrder = 1;\n',
        'src/__tests__/order.test.ts':
          "import { devtool } from 'devtool';\nimport { anOrder } from './order.fixtures';\nexport const checked = devtool + anOrder;\n",
      },
    },
  ])('should report no violation when $condition', ({ files }) => {
    // Arrange
    const project = {
      files,
      roots: [
        '.',
      ],
    };

    // Act
    const { cruised, violations } = cruise(project);

    // Assert
    expect({
      cruisedAny: cruised > 0,
      violations,
    }).toStrictEqual({
      cruisedAny: true,
      violations: [],
    });
  });
});
