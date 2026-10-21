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
  'src/composition/checkout/app/use-cases/queries/cart/cart.ts':
    "import type { Mail } from '../../../../../../kernel/contracts';\nimport { listOrders } from '../../../../../../features/orders';\nexport const cart = (mail: Mail): unknown => [mail, listOrders];\n",
  'src/composition/checkout/index.ts':
    "export { cart } from './app/use-cases/queries/cart/cart';\n",
  'src/kernel/contracts/index.ts': "export type { Mail } from './mail.port';\n",
  'src/kernel/contracts/mail.port.ts':
    "import type { Money } from '../values';\nexport interface Mail { cost: Money }\n",
  'src/features/orders/domain/entities/__tests__/order.entity.test.ts':
    "import { expect } from 'bun:test';\nimport { order } from '../order.entity';\nexpect(order).toBe(1);\n",
  'src/features/orders/adapters/api/index.ts': "export { order } from './order.adapter';\n",
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
    "import type { Mail } from '../../../../../../kernel/contracts';\nexport const countOrders = (mail: Mail): Mail => mail;\n",
  'src/features/orders/domain/use-cases/queries/count-orders/index.ts':
    "export { countOrders } from './count-orders.use-case';\n",
  'src/features/orders/domain/entities/index.ts': "export { order } from './order.entity';\n",
  'src/features/orders/domain/entities/order.entity.ts':
    "import { money } from '../../../../kernel/values';\nexport const order = money;\n",
  'src/features/orders/index.ts':
    "export { listOrders } from './app/use-cases/queries/list-orders/list-orders.use-case';\n",
  'src/kernel/values/index.ts':
    "export { money } from './money';\nexport type { Money } from './money';\n",
  'src/kernel/values/money.ts': 'export const money = 1;\nexport type Money = number;\n',
  'src/libs/smtp/index.ts': "export { smtp } from './smtp';\n",
  'src/libs/smtp/smtp.ts': exported('smtp'),
  'src/main.ts': importing({
    from: './root/wiring',
    name: 'wiring',
  }),
  'src/root/wiring.ts':
    "import { sendMail } from '../adapters/mail';\nimport { cart } from '../composition/checkout';\nimport { listOrders } from '../features/orders';\nimport { order } from '../features/orders/adapters/api';\nexport const wiring = [sendMail, cart, listOrders, order];\n",
  'src/shared/format/index.ts': "export { format } from './format';\n",
  'src/shared/format/format.ts': importing({
    from: '../../kernel/values',
    name: 'money',
  }),
};

// A workspace of six units, one of them a library whose TypeScript package
// sits beside its data in no language, each package linked by its name as a
// package manager links it, with the workspace's parts.
const UNITS: Readonly<Record<string, string>> = {
  admin: 'apps/admin',
  eros: 'packages/eros/languages/typescript',
  messages: 'packages/messages',
  money: 'packages/money',
  smtp: 'packages/smtp',
  web: 'apps/web',
};

const workspaceProject = (files: Readonly<Record<string, string>>) => ({
  files: {
    ...Object.fromEntries(
      Object.entries(UNITS).flatMap(([name, folder]) => [
        [
          `${folder}/package.json`,
          JSON.stringify({
            exports: {
              '.': './src/index.ts',
            },
            name: `@shop/${name}`,
            type: 'module',
          }),
        ],
        [
          `${folder}/src/index.ts`,
          exported('unit'),
        ],
      ]),
    ),
    'scripts/build.ts': exported('build'),
    ...files,
  },
  links: Object.fromEntries(
    Object.entries(UNITS).map(([name, folder]) => [
      `node_modules/@shop/${name}`,
      folder,
    ]),
  ),
  parts: [
    'typescript/workspace',
    'typescript/architecture/workspace',
  ],
  roots: [
    'apps',
    'packages',
    'scripts',
  ],
  workspaces: [
    'apps/*',
    'packages/*',
    'packages/*/languages/typescript',
  ],
});

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
        'src/features/orders/domain/entities/order.entity.ts': importing({
          from: 'kit',
          name: 'value',
        }),
      },
      rule: 'domain-reaches-only-itself-and-the-kernel',
    },
    {
      condition: 'shared code reads a file through the runtime',
      files: {
        'src/shared/format/format.ts':
          "import { readFileSync } from 'node:fs';\nexport const format = readFileSync;\n",
      },
      rule: 'effects-reached-only-from-the-edge',
    },
    {
      condition: "a feature's application layer reads a file through a lib",
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts': importing({
          from: '../../../../../../libs/files',
          name: 'readText',
        }),
        'src/libs/files/index.ts': "export { readText } from './read-text';\n",
        'src/libs/files/read-text.ts':
          "import { readFileSync } from 'node:fs';\nexport const readText = readFileSync;\n",
      },
      rule: 'effects-reached-only-from-the-edge',
    },
    {
      condition: "a feature's application layer opens a database through Node.js",
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts':
          "import { DatabaseSync } from 'node:sqlite';\nexport const listOrders = DatabaseSync;\n",
      },
      rule: 'effects-reached-only-from-the-edge',
    },
    {
      condition: "an entity reaches past the surface of the domain's errors",
      files: {
        'src/features/orders/domain/entities/order.entity.ts': importing({
          from: '../errors/order.error',
          name: 'orderError',
        }),
        'src/features/orders/domain/errors/index.ts':
          "export { orderError } from './order.error';\n",
        'src/features/orders/domain/errors/order.error.ts': exported('orderError'),
      },
      rule: 'domain-role-reaches-a-sibling-through-its-surface',
    },
    {
      condition: "a role of the kernel reaches past another role's surface",
      files: {
        'src/kernel/errors/base.error.ts': exported('baseError'),
        'src/kernel/errors/index.ts': "export { baseError } from './base.error';\n",
        'src/kernel/values/money.ts': importing({
          from: '../errors/base.error',
          name: 'baseError',
        }),
      },
      rule: 'kernel-role-reaches-a-sibling-through-its-surface',
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
      rule: 'domain-reaches-only-itself-and-the-kernel',
    },
    {
      condition: 'the kernel imports shared code',
      files: {
        'src/kernel/values/money.ts': importing({
          from: '../../shared/format',
          name: 'format',
        }),
        'src/shared/format/index.ts': exported('format'),
      },
      rule: 'kernel-reaches-only-itself',
    },
    {
      condition: 'a library imports the kernel',
      files: {
        'src/kernel/values/index.ts': exported('money'),
        'src/libs/smtp/smtp.ts': importing({
          from: '../../kernel/values',
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
      rule: 'shared-knows-no-feature-adapter-contract-or-root',
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
      condition: 'a module of composition imports the composition root',
      files: {
        'src/composition/checkout/app/check-out.ts': importing({
          from: '../../../root/wiring',
          name: 'wiring',
        }),
        'src/root/wiring.ts': exported('wiring'),
      },
      rule: 'root-reached-only-from-entries',
    },
    {
      condition: 'code imports an entry file its framework fixes at the top of the source',
      files: {
        'src/client.tsx': exported('hydrate'),
        'src/shared/format/format.ts': importing({
          from: '../../client',
          name: 'hydrate',
        }),
      },
      rule: 'entry-never-imported',
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
      rule: 'feature-never-imports-a-feature',
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
      condition: 'a feature reaches past the surface of a role folder of the kernel',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../kernel/values/money',
          name: 'money',
        }),
        'src/kernel/values/money.ts': exported('money'),
      },
      rule: 'kernel-role-reached-through-its-surface',
    },
    {
      condition: 'code imports the kernel as a whole',
      files: {
        'src/kernel/index.ts': exported('money'),
        'src/shared/format/format.ts': importing({
          from: '../../kernel',
          name: 'money',
        }),
      },
      rule: 'layer-folder-never-a-target',
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
      condition: 'a port the kernel shares imports an adapter',
      files: {
        'src/adapters/mail/index.ts': exported('sendMail'),
        'src/kernel/contracts/mail.port.ts': importing({
          from: '../../adapters/mail',
          name: 'sendMail',
        }),
      },
      rule: 'kernel-reaches-only-itself',
    },
    {
      condition: 'shared code imports a port the kernel shares',
      files: {
        'src/kernel/contracts/index.ts': exported('mail'),
        'src/shared/format/format.ts': importing({
          from: '../../kernel/contracts',
          name: 'mail',
        }),
      },
      rule: 'shared-knows-no-feature-adapter-contract-or-root',
    },
    {
      condition: 'a module of composition imports another',
      files: {
        'src/composition/cart/index.ts': exported('cart'),
        'src/composition/checkout/app/check-out.ts': importing({
          from: '../../cart',
          name: 'cart',
        }),
      },
      rule: 'composition-module-never-imports-another',
    },
    {
      condition: "a binding unit imports a port of its feature's domain",
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts':
          "import type { OrderQueryRepository } from '../../../../domain/contracts';\nexport type Uses = OrderQueryRepository;\n",
        'src/features/orders/domain/contracts/index.ts':
          'export interface OrderQueryRepository { list(): number }\n',
      },
      rule: 'binding-units-reach-no-port',
    },
    {
      condition: "a binding unit of composition imports a port of the module's domain",
      files: {
        'src/composition/checkout/app/check-out.ts': importing({
          from: '../domain/contracts',
          name: 'payments',
        }),
        'src/composition/checkout/domain/contracts/index.ts': exported('payments'),
      },
      rule: 'binding-units-reach-no-port',
    },
    {
      condition: 'the root wires through a container library',
      files: {
        'src/root/wiring.ts': importing({
          from: 'inversify',
          name: 'value',
        }),
      },
      rule: 'root-wires-without-a-container-library',
    },
    {
      condition: "a module of composition's adapter imports another module's adapter",
      files: {
        'src/composition/checkout/adapters/mail/mail.adapter.ts': importing({
          from: '../../../../features/orders/adapters/api',
          name: 'order',
        }),
        'src/features/orders/adapters/api/index.ts': exported('order'),
      },
      rule: 'feature-adapters-blind-to-each-other',
    },
    {
      condition: 'a feature imports the composition above it',
      files: {
        'src/composition/checkout/index.ts': exported('checkout'),
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../composition/checkout',
          name: 'checkout',
        }),
      },
      rule: 'features-know-no-composition',
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
      condition: 'a use case imports an adapter past its port',
      files: {
        'src/features/orders/adapters/api/order.adapter.ts': exported('orderAdapter'),
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts': importing({
          from: '../../../../adapters/api/order.adapter',
          name: 'orderAdapter',
        }),
      },
      rule: 'adapters-reached-only-from-the-root',
    },
    {
      condition: 'the entry file imports an adapter past the root',
      files: {
        'src/adapters/mail/index.ts': exported('sendMail'),
        'src/main.ts': importing({
          from: './adapters/mail',
          name: 'sendMail',
        }),
      },
      rule: 'adapters-reached-only-from-the-root',
    },
    {
      condition: 'a shared adapter imports the surface of a feature',
      files: {
        'src/adapters/mail/mail.adapter.ts': importing({
          from: '../../features/orders',
          name: 'listOrders',
        }),
        'src/features/orders/index.ts': exported('listOrders'),
      },
      rule: 'adapters-outside-composition-know-no-feature-or-composition',
    },
    {
      condition: "a feature's surface offers its adapter",
      files: {
        'src/features/orders/adapters/api/index.ts': exported('orderAdapter'),
        'src/features/orders/index.ts': "export { orderAdapter } from './adapters/api';\n",
      },
      rule: 'adapters-reached-only-from-the-root',
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
      rule: 'shared-knows-no-feature-adapter-contract-or-root',
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
      condition: "a feature's application layer opens a database through Bun by a lib",
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts': importing({
          from: '../../../../../../libs/db',
          name: 'open',
        }),
        'src/libs/db/index.ts':
          "import { Database } from 'bun:sqlite';\nexport const open = Database;\n",
      },
      parts: [
        'typescript/bun',
        'typescript/architecture/bun',
        'typescript/architecture/core',
      ],
      rule: 'bun-effects-reached-only-from-the-edge',
    },
    {
      condition: "a feature's application layer opens a database through Bun",
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts':
          "import { Database } from 'bun:sqlite';\nexport const listOrders = Database;\n",
      },
      parts: [
        'typescript/bun',
        'typescript/architecture/bun',
        'typescript/architecture/core',
      ],
      rule: 'bun-effects-reached-only-from-the-edge',
    },
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
      condition: 'an adapter imports a route of the root',
      files: {
        'src/adapters/api/index.ts': importing({
          from: '../../root/routes/orders',
          name: 'route',
        }),
        'src/root/routes/orders.tsx': exported('route'),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'adapters-know-no-caller',
    },
    {
      condition: 'a screen imports Expo Router',
      files: {
        'src/composition/orders/ui/screens/orders-screen/orders-screen.tsx': importing({
          from: 'expo-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/expo',
        'typescript/architecture/core',
      ],
      rule: 'ui-imports-no-expo-router',
    },
    {
      condition: 'a helper beside a command imports bunli',
      files: {
        'src/features/orders/app/helpers/tool.ts': importing({
          from: '@bunli/core',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/bunli',
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition: "a module of composition's domain imports React",
      files: {
        'src/composition/checkout/domain/entities/cart.entity.ts': importing({
          from: 'react',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/_react',
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition: 'a component imports a package no block gives a home there',
      files: {
        'src/features/orders/ui/components/order-card.tsx': importing({
          from: 'ky',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/_react',
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition: 'a binding unit imports a package no block gives a home there',
      files: {
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts': importing({
          from: 'kit',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition:
        'a component at the top of a package imports a package no block gives a home there',
      files: {
        'src/components/button/button.tsx': importing({
          from: 'kit',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition: 'shared code imports a package no block gives a home there',
      files: {
        'src/shared/format/format.ts': importing({
          from: 'kit',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'not-in-allowed',
    },
    {
      condition: 'the application imports an integration',
      files: {
        'src/features/orders/app/order.use-case.ts': importing({
          from: '../../../integrations/nestjs/eros.module',
          name: 'erosModule',
        }),
        'src/integrations/nestjs/eros.module.ts': exported('erosModule'),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'integration-never-imported',
    },
    {
      condition: 'an integration imports another',
      files: {
        'src/integrations/fastify/plugin.ts': importing({
          from: '../nestjs/eros.module',
          name: 'erosModule',
        }),
        'src/integrations/nestjs/eros.module.ts': exported('erosModule'),
      },
      parts: [
        'typescript/architecture/core',
      ],
      rule: 'integrations-blind-to-each-other',
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
      rule: 'query-library-only-in-its-home',
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
      rule: 'lingui-only-in-its-home',
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
      rule: 'router-only-in-its-home',
    },
    {
      condition: 'a widget imports a router primitive',
      files: {
        'src/features/orders/ui/widgets/orders-widget/orders-widget.tsx': importing({
          from: '@tanstack/react-router',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'router-only-in-its-home',
    },
    {
      condition: "a use case of a feature's domain sends an event through a sink",
      files: {
        'src/features/orders/domain/use-cases/commands/place/place.use-case.ts': importing({
          from: '../../../../../../shared/sinks',
          name: 'track',
        }),
        'src/shared/sinks/index.ts': exported('track'),
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
      rule: 'lingui-only-in-its-home',
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
        'typescript/storybook',
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
        'typescript/architecture/yaml-js',
        'typescript/architecture/core',
      ],
      rule: 'yaml-home-is-the-parsing-adapter-and-lib',
    },
    {
      condition: 'an adapter imports the logging library',
      files: {
        'src/adapters/files/files.adapter.ts': importing({
          from: 'pino',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/pino',
        'typescript/architecture/core',
      ],
      rule: 'only-the-root-imports-pino',
    },
    {
      condition: 'an integration imports the HTTP client',
      files: {
        'src/integrations/nestjs/client.ts': importing({
          from: 'ky',
          name: 'value',
        }),
      },
      parts: [
        'typescript/architecture/ky',
        'typescript/architecture/core',
      ],
      rule: 'ky-home-is-the-adapters-libs-root-and-its-failure-mapper',
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
      rule: 'query-library-only-in-its-home',
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
      rule: 'query-library-only-in-its-home',
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
      rule: 'router-only-in-its-home',
    },
    {
      condition: 'a widget imports a route of the root',
      files: {
        'src/features/orders/ui/widgets/orders-widget/orders-widget.tsx': importing({
          from: '../../../../../root/routes/orders',
          name: 'route',
        }),
        'src/root/routes/orders.tsx': exported('route'),
      },
      parts: [
        'typescript/architecture/tanstack-router',
        'typescript/architecture/core',
      ],
      rule: 'root-reached-only-from-entries',
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
          "import type { Order } from '../../domain/entities';\nimport { track } from '../../../../shared/sinks';\nexport const orders: Order[] = [];\nexport const tracked = track;\n",
        'src/shared/sinks/index.ts': exported('track'),
        'src/features/orders/app/use-cases/commands/sync-orders/sync-orders.cli.ts': importing({
          from: '@bunli/core',
          name: 'value',
        }),
        'src/composition/checkout/ui/screens/cart-screen/cart-screen.tsx':
          "import { useMemo } from 'react';\nimport { value } from '@lingui/core';\nexport const screen = [useMemo, value];\n",
        'src/composition/checkout/app/use-cases/queries/cart/cart.hooks.ts':
          "import { value } from '@tanstack/react-query';\nexport const cart = value;\n",
        'src/client.tsx': importing({
          from: 'kit',
          name: 'value',
        }),
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts':
          "import { value } from '@tanstack/react-query';\nimport { useMemo } from 'react';\nexport const listOrders = [value, useMemo];\n",
        'src/features/orders/ui/components/order-card.tsx':
          "import { value } from '@lingui/core';\nimport type { ReactNode } from 'react';\nexport const card: ReactNode = value;\n",
        'src/integrations/nestjs/index.ts': importing({
          from: 'kit',
          name: 'value',
        }),
        'src/shared/http/http-errors.ts': importing({
          from: 'ky',
          name: 'value',
        }),
        'src/shared/parse/parse.ts': importing({
          from: 'zod',
          name: 'value',
        }),
        'src/features/orders/app/models/order-request.model.ts': importing({
          from: 'zod',
          name: 'value',
        }),
        'src/libs/ui/button.stories.tsx':
          "import { value } from 'devtool';\nimport { button } from './button';\nexport const stories = [value, button];\n",
        'src/libs/ui/button.tsx': exported('button'),
        'src/features/orders/domain/utils/digest.utils.ts':
          "import { createHash } from 'node:crypto';\nexport const digest = createHash;\n",
        'src/kernel/utils/format.utils.ts':
          "import { format } from 'node:util';\nexport const formatted = format;\n",
        'src/index.ts': "export { readOrders } from './adapters/files';\n",
        'src/adapters/files/index.ts':
          "import { readFile } from 'node:fs/promises';\nexport const readOrders = readFile;\n",
        'src/root/wiring.ts': exported('wiring'),
        'src/root/routes/__root.tsx': importing({
          from: '../wiring',
          name: 'wiring',
        }),
        'src/root/routes/orders/index.tsx':
          "import { value } from '@tanstack/react-router';\nimport { value as kit } from 'kit';\nexport const route = [value, kit];\n",
      },
      parts: [
        'typescript/architecture/ui',
        'typescript/architecture/_react',
        'typescript/architecture/bunli',
        'typescript/architecture/tanstack-router',
        'typescript/architecture/analytics',
        'typescript/architecture/lingui',
        'typescript/architecture/tanstack-query',
        'typescript/storybook',
        'typescript/architecture/storybook',
        'typescript/architecture/yaml-js',
        'typescript/architecture/ky',
        'typescript/architecture/zod',
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
      condition: 'an app imports another by its name',
      files: {
        'apps/web/src/orders.ts': importing({
          from: '@shop/admin',
          name: 'unit',
        }),
      },
      rule: 'apps-blind-to-each-other',
    },
    {
      condition: 'a package imports an app by its name',
      files: {
        'packages/messages/src/messages.ts': importing({
          from: '@shop/web',
          name: 'unit',
        }),
      },
      rule: 'packages-know-no-app',
    },
    {
      condition: 'an app imports a unit by a path into its folder',
      files: {
        'apps/web/src/orders.ts': importing({
          from: '../../../packages/messages/src/index',
          name: 'unit',
        }),
      },
      rule: 'units-imported-by-name',
    },
    {
      condition: 'a package imports another by a path into its folder',
      files: {
        'packages/messages/src/messages.ts': importing({
          from: '../../money/src/index',
          name: 'unit',
        }),
      },
      rule: 'units-imported-by-name',
    },
    {
      condition: 'the package of a library in several languages imports another unit by a path',
      files: {
        'packages/eros/languages/typescript/src/filter.ts': importing({
          from: '../../../../smtp/src/index',
          name: 'unit',
        }),
      },
      rule: 'units-imported-by-name',
    },
    {
      condition: 'a script of the root imports a unit by a path into its folder',
      files: {
        'scripts/release.ts': importing({
          from: '../apps/web/src/index',
          name: 'unit',
        }),
      },
      rule: 'root-imports-units-by-name',
    },
  ])('should report $rule when $condition in a workspace', ({ files, rule }) => {
    // Arrange
    const project = workspaceProject(files);

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toContain(rule);
  });

  it('should report no violation when the units of a workspace import downward by name', () => {
    // Arrange
    const project = workspaceProject({
      'packages/eros/shared/schema/kinds.yaml': '- validation\n',
      'packages/eros/languages/typescript/src/kinds.ts':
        "import kinds from '../../../shared/schema/kinds.yaml';\nexport const KINDS: unknown = kinds;\n",
      'apps/web/src/orders.ts':
        "import { unit } from '@shop/messages';\nimport { unit as smtp } from '@shop/smtp';\nimport { line } from './line';\nexport const uses = [unit, smtp, line];\n",
      'apps/web/src/line.ts': exported('line'),
      'packages/eros/languages/typescript/src/send.ts': importing({
        from: '@shop/smtp',
        name: 'unit',
      }),
      'scripts/release.ts': importing({
        from: '@shop/web',
        name: 'unit',
      }),
      'packages/messages/src/messages.ts': importing({
        from: '@shop/money',
        name: 'unit',
      }),
    });

    // Act
    const { violations } = cruise(project);

    // Assert
    expect(violations).toStrictEqual([]);
  });
});

describe('the development files the parts name', () => {
  it.each([
    {
      condition: 'a story renders with a development dependency',
      file: 'src/libs/ui/button.stories.tsx',
      reported: false,
    },
    {
      condition: 'production code beside the story imports the development dependency',
      file: 'src/libs/ui/button.tsx',
      reported: true,
    },
  ])(
    'should report no-development-dependency-in-production only for production code when $condition',
    ({ file, reported }) => {
      // Arrange
      const project = {
        files: {
          [file]: "import { devtool } from 'devtool';\nexport const shown = devtool;\n",
        },
        parts: [
          'typescript/storybook',
        ],
      };

      // Act
      const { violations } = cruise(project);

      // Assert
      expect(violations.includes('no-development-dependency-in-production')).toBe(reported);
    },
  );
});

describe("the parts of dependency-cruiser's base", () => {
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
      parts: [],
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
      parts: [],
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
