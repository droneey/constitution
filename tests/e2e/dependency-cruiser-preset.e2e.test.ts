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
  'src/features/orders/app/use-cases/queries/list-orders/list-orders.use-case.ts':
    importing({
      from: '../../../../domain/entities',
      name: 'order',
    }),
  'src/features/orders/app/use-cases/queries/count-orders/count-orders.use-case.ts':
    importing({
      from: '../../../../domain/use-cases/queries/count-orders',
      name: 'countOrders',
    }),
  'src/features/orders/domain/use-cases/queries/count-orders/count-orders.use-case.ts':
    exported('countOrders'),
  'src/features/orders/domain/use-cases/queries/count-orders/index.ts':
    "export { countOrders } from './count-orders.use-case';\n",
  'src/features/orders/domain/entities/index.ts':
    "export { order } from './order.entity';\n",
  'src/features/orders/domain/entities/order.entity.ts':
    "import { money } from '../../../../kernel';\nexport const order = money;\n",
  'src/features/orders/index.ts':
    "export { listOrders } from './app/use-cases/queries/list-orders/list-orders.use-case';\n",
  'src/kernel/index.ts':
    "export { money } from './money';\nexport type { Money } from './money';\n",
  'src/kernel/money.ts':
    'export const money = 1;\nexport type Money = number;\n',
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
        'src/features/orders/domain/entities/order.entity.ts':
          exported('order'),
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
        'src/features/orders/app/use-cases/commands/cancel/cancel.use-case.ts':
          exported('cancel'),
        'src/features/orders/app/use-cases/queries/list/list.use-case.ts':
          importing({
            from: '../../commands/cancel/cancel.use-case',
            name: 'cancel',
          }),
      },
      rule: 'reads-never-reach-writes',
    },
    {
      condition: 'two modules import each other, a rule of devkit’s base',
      files: {
        'src/shared/format/format.ts': importing({
          from: './parse',
          name: 'parse',
        }),
        'src/shared/format/parse.ts': importing({
          from: './format',
          name: 'uses',
        }),
      },
      rule: 'no-circular',
    },
    {
      condition: 'a write imports a read',
      files: {
        'src/features/orders/app/use-cases/commands/cancel/cancel.use-case.ts':
          importing({
            from: '../../queries/list/list.use-case',
            name: 'list',
          }),
        'src/features/orders/app/use-cases/queries/list/list.use-case.ts':
          exported('list'),
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
        'ui',
        'base',
      ],
      rule: 'components-take-data-and-callbacks',
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
        'ky',
        'base',
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
        'tanstack-query',
        'base',
      ],
      rule: 'components-never-query',
    },
    {
      condition: 'a widget imports an adapter',
      files: {
        'src/features/orders/adapters/api/order.adapter.ts':
          exported('fetchOrders'),
        'src/features/orders/ui/widgets/orders.tsx': importing({
          from: '../../adapters/api/order.adapter',
          name: 'fetchOrders',
        }),
      },
      parts: [
        'ui',
        'base',
      ],
      rule: 'ui-reaches-no-mechanism',
    },
    {
      condition: 'a widget imports an entity as a value',
      files: {
        'src/features/orders/domain/entities/index.ts': exported('order'),
        'src/features/orders/ui/widgets/orders.tsx': importing({
          from: '../../domain/entities',
          name: 'order',
        }),
      },
      parts: [
        'ui',
        'base',
      ],
      rule: 'ui-takes-entities-as-types',
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
        'lingui',
        'base',
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
        'tanstack-router',
        'base',
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
        'tanstack-router',
        'base',
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
        'analytics',
        'base',
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
        'lingui',
        'base',
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
        'storybook',
        'base',
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
        'yaml',
        'base',
      ],
      rule: 'yaml-only-at-the-edge',
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
        'src/features/orders/domain/entities/index.ts':
          'export type Order = { id: string };\n',
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
        'ui',
        'tanstack-router',
        'analytics',
        'lingui',
        'tanstack-query',
        'ky',
        'storybook',
        'yaml',
        'base',
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
        'packages/typescript/libs/biome/build.ts': importing({
          from: '../tsconfig/configs',
          name: 'configs',
        }),
        'packages/typescript/libs/tsconfig/configs.ts': exported('configs'),
      },
      roots: [
        'packages',
      ],
      rule: 'packages-blind-to-each-other',
    },
    {
      condition: 'the common area imports a package',
      files: {
        'packages/common/hooks.ts': importing({
          from: '../typescript/libs/biome/build',
          name: 'build',
        }),
        'packages/typescript/libs/biome/build.ts': exported('build'),
      },
      roots: [
        'packages',
      ],
      rule: 'common-imports-nothing',
    },
    {
      condition: 'a package imports a file of the repository that holds it',
      files: {
        'packages/typescript/libs/biome/build.ts': importing({
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
        'packages/typescript/libs/biome/build.ts': exported('build'),
        'scripts/release.ts': importing({
          from: '../packages/typescript/libs/biome/build',
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
    'should report $rule when $condition and a repository of packages extends the package part',
    ({ files, roots, rule }) => {
      // Arrange
      const project = {
        files,
        parts: [
          'package',
        ],
        roots,
      };

      // Act
      const { violations } = cruise(project);

      // Assert
      expect(violations).toContain(rule);
    },
  );

  it('should report no violation when a package imports its own files and the runtime', () => {
    // Arrange
    const project = {
      files: {
        'packages/typescript/libs/biome/build.ts':
          "import { readFileSync } from 'node:fs';\nimport { plugins } from './plugins';\nexport const build = [readFileSync, plugins];\n",
        'packages/typescript/libs/biome/plugins.ts': exported('plugins'),
        'scripts/release.ts': importing({
          from: 'yaml',
          name: 'value',
        }),
      },
      parts: [
        'package',
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
