import { describe, expect, it } from 'bun:test';

import { blockCode } from './biome-preset.fixtures';
import { failedPaths, inPackages, PARTS, presetWords } from './ls-lint-preset.fixtures';

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
  'src/types/order.types.ts',
  'src/integrations/nestjs/index.ts',
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
  'typescript/architecture/api',
  'typescript/architecture/cli',
  'typescript/architecture/nestjs',
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
  'src/routes/(shop)/orders/-components/index.ts',
  'src/routes/(shop)/orders/-components/order-summary/index.ts',
  'src/routes/(shop)/orders/-components/order-summary/order-summary.tsx',
  'src/routes/(shop)/orders/-components/order-summary/__tests__/order-summary.test.tsx',
  'src/routes/(shop)/orders/-hooks/order.hooks.ts',
  'src/api/api.module.ts',
  'src/api/orders/orders.controller.ts',
  'src/api/__tests__/api.module.test.ts',
  'src/root/root.module.ts',
  'src/features/orders/app/orders.module.ts',
  'src/features/orders/app/orders.controller.ts',
  'src/composition/checkout/checkout.module.ts',
  'src/api/providers/auth.guard.ts',
  'src/root/providers/index.ts',
  'src/root/providers/error.filter.ts',
  'src/features/orders/app/providers/clock.provider.ts',
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
      condition: 'a file of a role folder at the top level has no role suffix',
      path: 'src/types/order.ts',
      reported: 'src/types/order.ts',
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
      reported: 'src/features/orders/domain/use-cases/queries/list-orders/list-orders.ts',
    },
    {
      condition: 'a binding unit holds a file not named after its operation',
      path: 'src/features/orders/app/use-cases/queries/list-orders/helpers.ts',
      reported: 'src/features/orders/app/use-cases/queries/list-orders/helpers.ts',
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
      condition: 'a file in a layer is not in kebab-case',
      path: 'src/shared/utils/formatDate.utils.ts',
      reported: 'src/shared/utils/formatDate.utils.ts',
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
      condition: 'a handler file is not in kebab-case',
      path: 'src/api/orders/OrdersController.ts',
      reported: 'src/api/orders/OrdersController.ts',
    },
    {
      condition: "a providers folder holds another role's file",
      path: 'src/features/orders/app/providers/orders.service.ts',
      reported: 'src/features/orders/app/providers',
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
      condition: 'a screen piece sits loose in its dash folder',
      path: 'src/routes/orders/-components/order-summary.tsx',
      reported: 'src/routes/orders/-components',
    },
    {
      condition: "a screen's hooks file has no hooks suffix",
      path: 'src/routes/orders/-hooks/use-order.ts',
      reported: 'src/routes/orders/-hooks/use-order.ts',
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
  ])('should report the names it refuses when $condition', ({ parts, path, reported }) => {
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
  });
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
      ],
    },
  ])('should report nothing when $condition and a project extends $parts', ({ parts, paths }) => {
    // Arrange
    const project = {
      parts,
      paths,
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });
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
      part: 'common/foundation/bun',
      path: 'node_modules/some-package/index.js',
      reported: 'node_modules',
    },
    {
      part: 'common/foundation/uv',
      path: '.venv/lib/python3.14/site-packages/orders.py',
      reported: '.venv/lib/python3.14',
    },
    {
      part: 'common/foundation/ruff',
      path: '.ruff_cache/cache/orders.json',
      reported: '.ruff_cache',
    },
    {
      part: 'python/foundation/python',
      path: 'scripts/__pycache__/seed.cpython-314.pyc',
      reported: 'scripts/__pycache__',
    },
    {
      part: 'common/foundation/pytest',
      path: '.pytest_cache/v/cache/lastfailed',
      reported: '.pytest_cache',
    },
    {
      part: 'common/foundation/hypothesis',
      path: '.hypothesis/unicode_data/charmap.json.gz',
      reported: '.hypothesis/unicode_data',
    },
    {
      part: 'common/foundation/mutmut',
      path: 'mutants/src/shop/__init__.py',
      reported: 'mutants/src/shop/__init__.py',
    },
    {
      part: 'common/foundation/complexipy',
      path: '.complexipy_cache/cache.json',
      reported: '.complexipy_cache',
    },
    {
      part: 'common/foundation/import-linter',
      path: '.import_linter_cache/a1b2c3.meta.json',
      reported: '.import_linter_cache',
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

describe('the ls-lint parts of the tools that write folders in each unit', () => {
  it.each([
    {
      part: 'common/foundation/stryker',
      path: '.stryker-tmp/sandbox-AhbDNq/package.json',
      reported: '.stryker-tmp/sandbox-AhbDNq',
    },
    {
      part: 'common/foundation/bun',
      path: 'node_modules/some-package/index.js',
      reported: 'node_modules',
    },
    {
      part: 'common/foundation/uv',
      path: '.venv/lib/python3.14/site-packages/orders.py',
      reported: '.venv/lib/python3.14',
    },
    {
      part: 'common/foundation/ruff',
      path: '.ruff_cache/cache/orders.json',
      reported: '.ruff_cache',
    },
    {
      part: 'common/foundation/pytest',
      path: '.pytest_cache/v/cache/lastfailed',
      reported: '.pytest_cache',
    },
    {
      part: 'common/foundation/hypothesis',
      path: '.hypothesis/unicode_data/charmap.json.gz',
      reported: '.hypothesis/unicode_data',
    },
    {
      part: 'common/foundation/mutmut',
      path: 'mutants/src/shop/__init__.py',
      reported: 'mutants/src/shop/__init__.py',
    },
    {
      part: 'common/foundation/complexipy',
      path: '.complexipy_cache/cache.json',
      reported: '.complexipy_cache',
    },
    {
      part: 'common/foundation/import-linter',
      path: '.import_linter_cache/a1b2c3.meta.json',
      reported: '.import_linter_cache',
    },
  ])(
    'should skip the folder its tool writes in a package up to four folders down only when a project extends $part',
    ({ part, path, reported }) => {
      // Arrange
      const project = {
        paths: inPackages(path),
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
        without: inPackages(reported),
      });
    },
  );
});

const PYTHON_FOUNDATION_PARTS = [
  'common/foundation/core',
  'python/foundation/python',
];

const PYTHON_PARTS = [
  ...PYTHON_FOUNDATION_PARTS,
  'python/architecture/core',
];

const WELL_FORMED_PYTHON = [
  'pyproject.toml',
  'uv.lock',
  'scripts/seed_orders.py',
  'src/shop/__init__.py',
  'src/shop/__main__.py',
  'src/shop/main.py',
  'src/shop/py.typed',
  'src/shop/root/__init__.py',
  'src/shop/root/wiring.py',
  'src/shop/kernel/__init__.py',
  'src/shop/kernel/money/money_types.py',
  'src/shop/contracts/__init__.py',
  'src/shop/contracts/mail_port.py',
  'src/shop/shared/utils/format_utils.py',
  'src/shop/libs/markdown/markdown_utils.py',
  'src/shop/entrypoints/digests_write/main.py',
  'src/shop/features/__init__.py',
  'src/shop/features/order_history/__init__.py',
  'src/shop/features/order_history/domain/__init__.py',
  'src/shop/features/order_history/domain/entities/__init__.py',
  'src/shop/features/order_history/domain/entities/order_entity.py',
  'src/shop/features/order_history/domain/value_objects/email_value_object.py',
  'src/shop/features/order_history/domain/errors/order_not_found_error.py',
  'src/shop/features/order_history/domain/constants/limits_constants.py',
  'src/shop/features/order_history/domain/contracts/clock_port.py',
  'src/shop/features/order_history/domain/contracts/repositories/__init__.py',
  'src/shop/features/order_history/domain/contracts/repositories/queries/orders_repository.py',
  'src/shop/features/order_history/domain/contracts/repositories/commands/orders_repository.py',
  'src/shop/features/order_history/domain/use_cases/commands/place_order/place_order_use_case.py',
  'src/shop/features/order_history/adapters/json/json_adapter.py',
  'src/shop/features/order_history/adapters/json/models/order_model.py',
  'src/shop/features/order_history/app/use_cases/queries/list_orders/list_orders.py',
  'tests/conftest.py',
  'tests/test_orders.py',
  'tests/clock_fake.py',
  'tests/orders_fixtures.py',
  'tests/integration/test_orders_repository.py',
  'tests/e2e/test_checkout.py',
];

// The bytecode the interpreter and the test runner write beside the modules.
const PYTHON_BYTECODE = [
  'scripts/__pycache__/seed_orders.cpython-314.pyc',
  'src/shop/__pycache__/__init__.cpython-314.pyc',
  'src/shop/features/order_history/domain/__pycache__/__init__.cpython-314.pyc',
  'src/shop/features/order_history/domain/entities/__pycache__/order_entity.cpython-314.pyc',
  'src/shop/features/order_history/domain/contracts/repositories/__pycache__/__init__.cpython-314.pyc',
  'src/shop/features/order_history/domain/use_cases/__pycache__/__init__.cpython-314.pyc',
  'tests/__pycache__/clock_fake.cpython-314.pyc',
  'tests/__pycache__/conftest.cpython-314-pytest-9.1.1.pyc',
  'tests/__pycache__/test_orders.cpython-314-pytest-9.1.1.pyc',
];

describe('the ls-lint python parts', () => {
  it('should report nothing when every name follows the python forms and the tree', () => {
    // Arrange
    const project = {
      parts: PYTHON_PARTS,
      paths: [
        ...WELL_FORMED_PYTHON,
        ...PYTHON_BYTECODE,
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'a module is in kebab-case',
      path: 'src/shop/order-history.py',
      reported: 'src/shop/order-history.py',
    },
    {
      condition: 'a package of the source root is in kebab-case',
      path: 'src/shop/order-history/orders.py',
      reported: 'src/shop/order-history',
    },
    {
      condition: 'a stub is in PascalCase',
      path: 'src/shop/Orders.pyi',
      reported: 'src/shop/Orders.pyi',
    },
    {
      condition: 'a module outside the source root is in kebab-case',
      path: 'scripts/seed-orders.py',
      reported: 'scripts/seed-orders.py',
    },
    {
      condition: 'a spec ends in _test',
      path: 'tests/orders_test.py',
      reported: 'tests/orders_test.py',
    },
    {
      condition: 'a folder of the specs holds a helper of no form',
      path: 'tests/integration/helpers.py',
      reported: 'tests/integration/helpers.py',
    },
    {
      condition: 'the specs are made a package',
      path: 'tests/__init__.py',
      reported: 'tests/__init__.py',
    },
  ])(
    'should report $reported when $condition and a project follows only foundation',
    ({ path, reported }) => {
      // Arrange
      const project = {
        parts: PYTHON_FOUNDATION_PARTS,
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
      condition: "a feature's domain holds a folder of no role",
      path: 'src/shop/features/orders/domain/helpers/format_utils.py',
      reported: 'src/shop/features/orders/domain/helpers',
    },
    {
      condition: "a feature's domain holds a module",
      path: 'src/shop/features/orders/domain/order_entity.py',
      reported: 'src/shop/features/orders/domain/order_entity.py',
    },
    {
      condition: 'a value object has no role suffix',
      path: 'src/shop/features/orders/domain/value_objects/email.py',
      reported: 'src/shop/features/orders/domain/value_objects/email.py',
    },
    {
      condition: "a role folder holds another role's module",
      path: 'src/shop/features/orders/domain/entities/order_types.py',
      reported: 'src/shop/features/orders/domain/entities/order_types.py',
    },
    {
      condition: 'a repository sits outside its side',
      path: 'src/shop/features/orders/domain/contracts/repositories/orders_repository.py',
      reported: 'src/shop/features/orders/domain/contracts/repositories/orders_repository.py',
    },
    {
      condition: 'a shared port has no role suffix',
      path: 'src/shop/contracts/mail.py',
      reported: 'src/shop/contracts/mail.py',
    },
    {
      condition: 'a folder of use-cases holds a folder of no side',
      path: 'src/shop/features/orders/domain/use_cases/other/place_order.py',
      reported: 'src/shop/features/orders/domain/use_cases/other',
    },
  ])('should report $reported when $condition', ({ path, reported }) => {
    // Arrange
    const project = {
      parts: PYTHON_PARTS,
      paths: [
        path,
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toContain(reported);
  });

  it('should leave the role suffix to the architecture part when a project follows only foundation', () => {
    // Arrange
    const project = {
      parts: PYTHON_FOUNDATION_PARTS,
      paths: [
        'src/shop/features/orders/domain/entities/order.py',
      ],
    };

    // Act
    const failed = failedPaths(project);

    // Assert
    expect(failed).toStrictEqual([]);
  });
});
