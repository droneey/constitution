import { describe, expect, it } from 'bun:test';

import { ignoredOf, patternsMeetingNoPath } from './git-preset.fixtures';

const ignoredPaths = [
  '.droneey/state.json',
  '.claude/settings.local.json',
  '.claude/worktrees/feature/order.ts',
  'local/notes.md',
  '.DS_Store',
  'src/.DS_Store',
  '.vscode/settings.local.json',
  '.idea/workspace.xml',
  'debug.log',
  'apps/web/logs/today.txt',
  '.temp/order.ts',
  '.tmp/order.ts',
  'order.ts.bak',
  'order.ts.orig',
  'order.ts~',
  '.env',
  '.env.local',
  'server.pem',
  'server.key',
  'certificate.p12',
  'certificate.pfx',
  'keystore.jks',
  'config/credentials.json',
  '.ssh/id_rsa',
  'deploy.secrets',
  'mise.local.toml',
  'packages/orders/node_modules/kit/index.js',
  'unit-1.0.0.tgz',
  'apps/web/coverage/lcov.info',
  '.npmrc',
  '.complexipy_cache/cache.json',
  '.hypothesis/examples/case',
  '.import_linter_cache/cache.json',
  'mutants/src/unit/orders.py',
  '.pytest_cache/README.md',
  '.coverage',
  'htmlcov/index.html',
  'src/unit/__pycache__/orders.cpython-314.pyc',
  'src/unit/orders.pyc',
  'src/unit/orders.pyo',
  'src/unit/orders.pyd',
  'src/unit.egg-info/PKG-INFO',
  '.ruff_cache/content',
  '.rumdl_cache/content',
  '.stryker-tmp/sandbox/order.ts',
  'reports/mutation/index.html',
  '.tanstack/tmp/routes.ts',
  '.output/server/index.mjs',
  '.nitro/types/nitro.d.ts',
  'tsconfig.tsbuildinfo',
  '.tsc-cache/src/order.d.ts',
  '.venv/bin/python',
  'packages/orders/dist/index.js',
  'apps/web/build/index.js',
];

const keptPaths = [
  'src/order.ts',
  '.claude/settings.json',
  'src/local/notes.ts',
  '.vscode/settings.json',
  '.vscode/tasks.json',
  '.vscode/launch.json',
  '.vscode/extensions.json',
  '.env.example',
  'mise.toml',
  'reports/summary.md',
  'apps/web/.droneey/notes.md',
];

describe("the configuration git's presets write", () => {
  it('should ignore each path the patterns mean and keep each beside them when a unit follows every block git is configured for', () => {
    // Act
    const ignored = ignoredOf([
      ...ignoredPaths,
      ...keptPaths,
    ]);

    // Assert
    expect(ignored).toStrictEqual(ignoredPaths);
  });

  // Why: git reads every line of a .gitignore as a pattern and refuses none, so each pattern the
  // presets write meets a path of the tables above.
  it('should meet a path of the tables with each pattern when a unit follows every block git is configured for', () => {
    // Act
    const unmet = patternsMeetingNoPath([
      ...ignoredPaths,
      ...keptPaths,
    ]);

    // Assert
    expect(unmet).toStrictEqual([]);
  });
});
