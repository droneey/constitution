import { describe, expect, it } from 'bun:test';

import { blockCode } from './biome-preset.fixtures';
import { failedPaths, presetWords } from './ls-lint-preset.fixtures';

const WELL_FORMED = [
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
