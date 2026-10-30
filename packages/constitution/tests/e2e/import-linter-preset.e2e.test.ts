import { describe, expect, it } from 'bun:test';

import { feature, lintImports, ORDERS } from './import-linter-preset.fixtures';

describe("the configuration import-linter's presets write", () => {
  it('should load in import-linter and keep every contract when a unit follows every block import-linter is configured for', async () => {
    // Act
    const lint = await lintImports();

    // Assert
    expect(lint).toStrictEqual({
      broken: [],
      status: 0,
    });
  });

  // Why: import-linter takes a key of a contract it does not know without a word, so each such key
  // the presets set has imports it must judge by it.
  it.each([
    {
      condition: 'the composition root builds a feature adapter, which its imports ignore',
      files: {
        ...feature,
        'src/unit/root/__init__.py': '',
        'src/unit/root/wiring.py':
          'from unit.features.orders.infrastructure.memory_store import MemoryStore\n\nSTORE = MemoryStore()\n',
      },
      lint: {
        broken: [],
        status: 0,
      },
    },
    {
      condition:
        'a binding unit reaches a port only through a use case, as indirect imports are allowed',
      files: feature,
      lint: {
        broken: [],
        status: 0,
      },
    },
    {
      condition:
        'a binding unit builds an adapter, which only the adapters themselves and not their packages may',
      files: {
        ...feature,
        [`${ORDERS}/presentation/orders_cli.py`]:
          'from unit.features.orders.infrastructure.memory_store import MemoryStore\n\nSTORE = MemoryStore()\n',
      },
      lint: {
        broken: [
          'adapter-imported-only-by-the-root',
        ],
        status: 1,
      },
    },
  ])('should judge the imports by the contract keys when $condition', async ({ files, lint }) => {
    // Act
    const judged = await lintImports(files);

    // Assert
    expect(judged).toStrictEqual(lint);
  });
});
