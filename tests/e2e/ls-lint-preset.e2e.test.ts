import { describe, expect, it } from 'bun:test';

import { blockCode } from './biome-preset.fixtures';
import { failedPaths, presetWords } from './ls-lint-preset.fixtures';

const WELL_FORMED = [
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/workflows/check.yaml',
  'README.md',
  'lefthook.yaml',
  'src/main.ts',
  'src/root/index.ts',
  'src/root/wiring.ts',
  'src/kernel/index.ts',
  'src/kernel/money.types.ts',
  'src/kernel/__tests__/money.types.test.ts',
  'src/contracts/mail/index.ts',
  'src/contracts/mail/mail.port.ts',
  'src/adapters/smtp/smtp.adapter.ts',
  'src/shared/types/global.d.ts',
  'src/shared/utils/format.utils.ts',
  'src/libs/markdown/markdown.utils.ts',
  'src/entrypoints/digests-write/main.ts',
  'src/features/orders/index.ts',
  'src/features/orders/__tests__/orders.fixtures.ts',
  'src/features/orders/domain/entities/index.ts',
  'src/features/orders/domain/entities/order.entity.ts',
  'src/features/orders/domain/entities/__tests__/order.entity.test.ts',
  'src/features/orders/domain/errors/order-not-found.error.ts',
  'src/features/orders/domain/constants/limits.constants.ts',
  'src/features/orders/domain/contracts/clock.port.ts',
  'src/features/orders/domain/contracts/repositories/queries/order.repository.ts',
  'src/features/orders/domain/contracts/repositories/commands/order.repository.ts',
  'src/features/orders/domain/use-cases/commands/place-order/index.ts',
  'src/features/orders/domain/use-cases/commands/place-order/place-order.use-case.ts',
  'src/features/orders/domain/use-cases/commands/place-order/__tests__/place-order.use-case.test.ts',
  'src/features/orders/domain/use-cases/commands/place-order/__tests__/clock.fake.ts',
  'src/features/orders/adapters/json/json.adapter.ts',
  'src/features/orders/adapters/json/models/order.model.ts',
  'src/features/orders/adapters/json/__tests__/json.adapter.integration.test.ts',
  'src/features/orders/app/constants/pagination.constants.ts',
  'src/features/orders/app/use-cases/queries/list-orders/list-orders.hooks.ts',
  'src/features/orders/app/use-cases/queries/list-orders/list-orders.types.ts',
  'tests/e2e/checkout.e2e.test.ts',
  'tests/e2e/shop.fixtures.ts',
];

const PARTS = [
  'base',
  'analytics',
  'cli',
  'tanstack-router',
  'ui',
];

const WELL_FORMED_WITH_PARTS = [
  'src/router.tsx',
  'src/routeTree.gen.ts',
  'src/routes/__root.tsx',
  'src/routes/index.tsx',
  'src/routes/_auth.tsx',
  'src/routes/about.lazy.tsx',
  'src/routes/(shop)/orders/$orderId.tsx',
  'src/routes/(shop)/orders/-components/order-summary.tsx',
  'src/routes/(shop)/orders/-hooks/order.hooks.ts',
  'src/cli/commands.ts',
  'src/cli/init.cli.ts',
  'src/shared/analytics/sinks/index.ts',
  'src/shared/analytics/sinks/matomo.sink.ts',
  'src/shared/ui/assets/logo.svg',
  'src/shared/ui/components/index.ts',
  'src/shared/ui/components/app-banner/index.ts',
  'src/shared/ui/components/app-banner/app-banner.tsx',
  'src/shared/ui/components/app-banner/app-banner.types.ts',
  'src/shared/ui/components/app-banner/app-banner.variants.ts',
  'src/shared/ui/components/app-banner/app-banner.stories.tsx',
  'src/shared/ui/components/app-banner/__tests__/app-banner.test.tsx',
  'src/shared/ui/components/app-banner/components/app-banner-title/app-banner-title.tsx',
  'src/features/orders/ui/widgets/order-list-widget/index.ts',
  'src/features/orders/ui/widgets/order-list-widget/order-list-widget.tsx',
];

describe('the ls-lint preset', () => {
  it.each([
    {
      condition: 'a top-level folder is not in the tree',
      path: 'src/helpers/format.utils.ts',
      reported: 'src/helpers',
    },
    {
      condition: 'a role folder sits at the top level',
      path: 'src/types/order.types.ts',
      reported: 'src/types',
    },
    {
      condition: "a feature's domain holds a folder of no role",
      path: 'src/features/orders/domain/helpers/format.utils.ts',
      reported: 'src/features/orders/domain/helpers',
    },
    {
      condition: "a feature's domain holds a file",
      path: 'src/features/orders/domain/order.entity.ts',
      reported: 'src/features/orders/domain',
    },
    {
      condition: 'an entity has no role suffix',
      path: 'src/features/orders/domain/entities/order.ts',
      reported: 'src/features/orders/domain/entities/order.ts',
    },
    {
      condition: "a role folder holds another role's file",
      path: 'src/features/orders/domain/entities/order.types.ts',
      reported: 'src/features/orders/domain/entities',
    },
    {
      condition: 'a repository sits outside its side',
      path: 'src/features/orders/domain/contracts/repositories/order.repository.ts',
      reported: 'src/features/orders/domain/contracts/repositories',
    },
    {
      condition: 'a shared port has no role suffix',
      path: 'src/contracts/mail.ts',
      reported: 'src/contracts/mail.ts',
    },
    {
      condition: 'a file of a use-case has no role suffix',
      path: 'src/features/orders/app/use-cases/queries/list-orders/list-orders.ts',
      reported:
        'src/features/orders/app/use-cases/queries/list-orders/list-orders.ts',
    },
    {
      condition: 'a test folder holds a helper',
      path: 'src/kernel/__tests__/helpers.ts',
      reported: 'src/kernel/__tests__',
    },
    {
      condition: 'a test folder holds a mock',
      path: 'src/kernel/__tests__/money.mock.ts',
      reported: 'src/kernel/__tests__',
    },
    {
      condition: 'an end-to-end folder holds a helper',
      path: 'tests/e2e/helpers.ts',
      reported: 'tests/e2e',
    },
    {
      condition: 'a file in a layer is not in kebab-case',
      path: 'src/shared/utils/formatDate.utils.ts',
      reported: 'src/shared/utils/formatDate.utils.ts',
    },
    {
      condition: 'a YAML file ends in .yml',
      path: '.github/workflows/check.yml',
      reported: '.github/workflows/check.yml',
    },
  ])('should report the name when $condition', ({ path, reported }) => {
    // Arrange
    const project = {
      paths: [
        path,
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toContain(reported);
  });

  it.each([
    {
      condition: 'a component file is not named after its folder',
      path: 'src/shared/ui/components/app-banner/banner.tsx',
      reported: 'src/shared/ui/components/app-banner/banner.tsx',
    },
    {
      condition: "a component's types are not named after it",
      path: 'src/shared/ui/components/app-banner/props.types.ts',
      reported: 'src/shared/ui/components/app-banner/props.types.ts',
    },
    {
      condition: 'a component sits loose among the component folders',
      path: 'src/shared/ui/components/app-banner.tsx',
      reported: 'src/shared/ui/components',
    },
    {
      condition: 'a widget folder does not end in -widget',
      path: 'src/features/orders/ui/widgets/order-list/order-list.tsx',
      reported: 'src/features/orders/ui/widgets/order-list',
    },
    {
      condition: 'a sink has no role suffix',
      path: 'src/shared/analytics/sinks/matomo.ts',
      reported: 'src/shared/analytics/sinks/matomo.ts',
    },
    {
      condition: "a sinks folder holds another role's file",
      path: 'src/shared/analytics/sinks/matomo.utils.ts',
      reported: 'src/shared/analytics/sinks',
    },
    {
      condition: 'a command file is not in kebab-case',
      path: 'src/cli/initProject.cli.ts',
      reported: 'src/cli/initProject.cli.ts',
    },
    {
      condition: "a screen's private folder is not a dash folder",
      path: 'src/routes/orders/Components/order-summary.tsx',
      reported: 'src/routes/orders/Components',
    },
    {
      condition: 'a route file is in PascalCase',
      path: 'src/routes/OrderPage.tsx',
      reported: 'src/routes/OrderPage.tsx',
    },
  ])(
    'should report the name when $condition and the project takes the block parts',
    ({ path, reported }) => {
      // Arrange
      const project = {
        parts: PARTS,
        paths: [
          path,
        ],
      };

      // Act
      const failed = failedPaths(project);

      // Assert
      expect(failed).toContain(reported);
    },
  );

  it('should report nothing when every name follows the tree and the block parts', () => {
    // Arrange
    const project = {
      parts: PARTS,
      paths: [
        ...WELL_FORMED,
        ...WELL_FORMED_WITH_PARTS,
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });

  it('should report nothing when every name follows the tree', () => {
    // Arrange
    const project = {
      paths: WELL_FORMED,
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });

  it('should name only folders, files and suffixes the blocks write when the preset names them', () => {
    // Arrange
    const code = blockCode();

    // Act
    const unwritten = presetWords().filter(
      (word) => !code.some((written) => written.includes(word)),
    );

    // Assert
    expect(unwritten).toStrictEqual([]);
  });
});
