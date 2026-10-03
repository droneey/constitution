import { describe, expect, it } from 'bun:test';

import { blockCode } from './biome-preset.fixtures';
import { failedPaths, PARTS, presetWords } from './ls-lint-preset.fixtures';

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
  'src/features/orders/domain/value-objects/email.value-object.ts',
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
  'src/features/orders/app/use-cases/queries/list-orders/list-orders.ts',
  'tests/e2e/checkout.e2e.test.ts',
  'tests/e2e/shop.fixtures.ts',
];

const BLOCK_PARTS = [
  ...PARTS,
  'typescript/architecture/analytics',
  'typescript/architecture/cli',
  'typescript/architecture/tanstack-router',
  'typescript/architecture/ui',
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
      condition: 'a value object has no role suffix',
      path: 'src/features/orders/domain/value-objects/email.ts',
      reported: 'src/features/orders/domain/value-objects/email.ts',
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
      condition: 'a file of a domain use-case has no role suffix',
      path: 'src/features/orders/domain/use-cases/queries/list-orders/list-orders.ts',
      reported:
        'src/features/orders/domain/use-cases/queries/list-orders/list-orders.ts',
    },
    {
      condition: 'a binding unit holds a file not named after its operation',
      path: 'src/features/orders/app/use-cases/queries/list-orders/helpers.ts',
      reported:
        'src/features/orders/app/use-cases/queries/list-orders/helpers.ts',
    },
    {
      condition: 'a data port folder holds a surface joining both sides',
      path: 'src/features/orders/domain/contracts/repositories/index.ts',
      reported: 'src/features/orders/domain/contracts/repositories',
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
      condition: 'a component of the root has no root- prefix',
      path: 'src/root/ui/components/app-header/app-header.tsx',
      reported: 'src/root/ui/components/app-header',
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
      condition: 'the command folder holds a file of another role',
      path: 'src/cli/init.utils.ts',
      reported: 'src/cli',
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
        parts: BLOCK_PARTS,
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
      parts: BLOCK_PARTS,
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

describe('the ls-lint tanstack-router foundation part', () => {
  it.each([
    {
      isReported: false,
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
        'typescript/foundation/tanstack-router',
      ],
    },
    {
      isReported: true,
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
    },
  ])(
    "should report the router's names $isReported when a project follows only foundation and extends $parts",
    ({ isReported, parts }) => {
      // Arrange
      const project = {
        paths: [
          'src/routes/__root.tsx',
          'src/routes/_auth.tsx',
          'src/routes/(shop)/orders/$orderId.tsx',
          'src/routes/posts_.tsx',
        ],
        parts,
      };

      // Act
      const failed = failedPaths(project);

      // Assert
      expect(failed.length > 0).toBe(isReported);
    },
  );

  it('should report a route in PascalCase when a project follows only foundation', () => {
    // Arrange
    const project = {
      paths: [
        'src/routes/Orders.tsx',
      ],
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
        'typescript/foundation/tanstack-router',
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([
      'src/routes/Orders.tsx',
    ]);
  });
});

const EXPO_FOUNDATION_PARTS = [
  'common/foundation/core',
  'typescript/foundation/typescript',
  'typescript/foundation/expo',
];

describe('the ls-lint expo parts', () => {
  it.each([
    'app',
    'src/app',
  ])(
    'should report nothing when the files of Expo Router sit under %s and the project follows only foundation',
    (root) => {
      // Arrange
      const project = {
        paths: [
          `${root}/_layout.tsx`,
          `${root}/+not-found.tsx`,
          `${root}/(tabs)/_layout.tsx`,
          `${root}/(tabs)/index.tsx`,
          `${root}/orders/[orderId].tsx`,
        ],
        parts: EXPO_FOUNDATION_PARTS,
      };

      // Act
      const failed = failedPaths(project);

      // Assert
      expect(failed).toStrictEqual([]);
    },
  );

  it('should report a screen in PascalCase when the project follows only foundation', () => {
    // Arrange
    const project = {
      paths: [
        'app/Orders.tsx',
      ],
      parts: EXPO_FOUNDATION_PARTS,
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([
      'app/Orders.tsx',
    ]);
  });

  it('should report nothing when the files of Expo Router sit under src/routes', () => {
    // Arrange
    const project = {
      paths: [
        'src/routes/_layout.tsx',
        'src/routes/+not-found.tsx',
        'src/routes/(tabs)/_layout.tsx',
        'src/routes/(tabs)/index.tsx',
        'src/routes/orders/[orderId].tsx',
        'src/routes/docs/[...slug].tsx',
      ],
      parts: [
        ...PARTS,
        'typescript/foundation/expo',
        'typescript/architecture/expo',
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'the router sits in src/app',
      parts: [
        ...PARTS,
        'typescript/foundation/expo',
        'typescript/architecture/expo',
      ],
      path: 'src/app/_layout.tsx',
      reported: [
        'src/app',
        'src/app/_layout.tsx',
      ],
    },
    {
      condition: 'the router sits in a root app folder',
      parts: [
        ...PARTS,
        'typescript/foundation/expo',
        'typescript/architecture/expo',
      ],
      path: 'app/_layout.tsx',
      reported: [
        'app',
        'app/_layout.tsx',
      ],
    },
    {
      condition: 'a project leaves the expo part out',
      parts: PARTS,
      path: 'src/routes/_layout.tsx',
      reported: [
        'src/routes',
        'src/routes/_layout.tsx',
      ],
    },
    {
      condition: 'a screen is in PascalCase',
      parts: [
        ...PARTS,
        'typescript/foundation/expo',
        'typescript/architecture/expo',
      ],
      path: 'src/routes/Orders.tsx',
      reported: [
        'src/routes/Orders.tsx',
      ],
    },
  ])(
    'should report the names it refuses when $condition',
    ({ parts, path, reported }) => {
      // Arrange
      const project = {
        paths: [
          path,
        ],
        parts,
      };

      // Act
      const failed = failedPaths(project);

      // Assert
      expect(failed).toStrictEqual(reported);
    },
  );
});

describe('the ls-lint foundation parts', () => {
  it.each([
    {
      condition: 'a folder is in snake_case',
      parts: [
        'common/foundation/core',
      ],
      path: 'assets/order_icons/order-icon.svg',
      reported: 'assets/order_icons',
    },
    {
      condition: 'a file is in camelCase',
      parts: [
        'common/foundation/core',
      ],
      path: 'assets/orderIcon.svg',
      reported: 'assets/orderIcon.svg',
    },
    {
      condition: 'a style module is in PascalCase',
      parts: [
        'common/foundation/core',
      ],
      path: 'assets/Theme.module.css',
      reported: 'assets/Theme.module.css',
    },
    {
      condition: 'an end-to-end spec is in PascalCase',
      parts: [
        'common/foundation/core',
      ],
      path: 'e2e/Checkout.e2e.test.js',
      reported: 'e2e/Checkout.e2e.test.js',
    },
    {
      condition: 'a document is in PascalCase',
      parts: [
        'common/foundation/core',
      ],
      path: 'docs/Guide.md',
      reported: 'docs/Guide.md',
    },
    {
      condition: 'a YAML file ends in .yml',
      parts: [
        'common/foundation/core',
      ],
      path: 'config/app.yml',
      reported: 'config/app.yml',
    },
    {
      condition: 'a test folder has no typescript part',
      parts: [
        'common/foundation/core',
      ],
      path: 'src/__tests__/order-view.test.ts',
      reported: 'src/__tests__',
    },
    {
      condition: 'a component file is in PascalCase',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      path: 'src/components/OrderCard.tsx',
      reported: 'src/components/OrderCard.tsx',
    },
    {
      condition: 'a spec file is in PascalCase',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      path: 'src/__tests__/OrderView.test.ts',
      reported: 'src/__tests__/OrderView.test.ts',
    },
    {
      condition: 'a test folder holds a helper',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      path: 'src/__tests__/helpers.ts',
      reported: 'src/__tests__',
    },
    {
      condition: 'an end-to-end folder holds a helper',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      path: 'tests/e2e/helpers.ts',
      reported: 'tests/e2e',
    },
    {
      condition: 'a typescript folder is in snake_case',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      path: 'src/order_views/order-view.ts',
      reported: 'src/order_views',
    },
  ])(
    'should report the name when $condition and a project extends $parts',
    ({ parts, path, reported }) => {
      // Arrange
      const project = {
        parts,
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

  it.each([
    {
      condition: 'every name is kebab-case, hidden or ignored',
      parts: [
        'common/foundation/core',
      ],
      paths: [
        '.dependency-cruiser.mjs',
        '.editorconfig',
        '.env.local',
        '.github/workflows/check.yaml',
        'assets/order-icon.svg',
        'assets/theme.module.css',
        'e2e/checkout.e2e.test.js',
        'dist/Bundle.js',
      ],
    },
    {
      condition: 'documents are kebab-case or in upper case',
      parts: [
        'common/foundation/core',
      ],
      paths: [
        'LICENSE.md',
        'README.md',
        'docs/CODE_OF_CONDUCT.md',
        'docs/order-guide.md',
      ],
    },
    {
      condition: 'typescript names are kebab-case beside a test folder',
      parts: [
        'common/foundation/core',
        'typescript/foundation/typescript',
      ],
      paths: [
        'src/__tests__/order-view.test.ts',
        'src/components/order-card.stories.tsx',
        'src/components/order-card.tsx',
        'src/order-view.ts',
        'node_modules/SomePackage/Index.js',
      ],
    },
  ])(
    'should report nothing when $condition and a project extends $parts',
    ({ parts, paths }) => {
      // Arrange
      const project = {
        parts,
        paths,
      };

      // Act
      const failed = failedPaths(project);

      // Assert
      expect(failed).toStrictEqual([]);
    },
  );
});

describe('the ls-lint parts of the tools that write folders', () => {
  it.each([
    {
      part: 'common/foundation/git',
      path: '.git/refs/remotes/Upstream/main',
      reported: '.git/refs/remotes/Upstream',
    },
    {
      part: 'common/foundation/stryker',
      path: '.stryker-tmp/sandbox-AhbDNq/package.json',
      reported: '.stryker-tmp/sandbox-AhbDNq',
    },
    {
      part: 'typescript/foundation/typescript',
      path: 'node_modules/some-package/index.js',
      reported: 'node_modules',
    },
  ])(
    'should skip the folder its tool writes only when a project extends $part',
    ({ part, path, reported }) => {
      // Arrange
      const project = {
        paths: [
          path,
        ],
      };

      // Act
      const failed = {
        with: failedPaths({
          ...project,
          parts: [
            'common/foundation/core',
            part,
          ],
        }),
        without: failedPaths({
          ...project,
          parts: [
            'common/foundation/core',
          ],
        }),
      };

      // Assert
      expect(failed).toStrictEqual({
        with: [],
        without: [
          reported,
        ],
      });
    },
  );
});
