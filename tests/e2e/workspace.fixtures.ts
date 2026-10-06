import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Run {
  output: string;
  passed: boolean;
}

interface Command {
  args: readonly string[];
  folder?: string;
  program: string;
}

type Files = Readonly<Record<string, string | undefined>>;

const EXECUTABLE = 0o755;

const REPOSITORY = join(import.meta.dir, '..', '..');
const BIN = join(REPOSITORY, 'node_modules', '.bin');
const PRESETS = '.droneey/constitution/presets/typescript';
const TEMPLATES = join(REPOSITORY, 'templates', 'project');

// Each unit's folder, by the package name that follows it.
const UNITS: Readonly<Record<string, string>> = {
  '@shop/api': 'packages/api',
  '@shop/libs-money': 'libs/money',
  '@shop/shared': 'shared',
  '@shop/web': 'packages/web',
};

const jsonFileOf = (fields: unknown): string => `${JSON.stringify(fields, undefined, 2)}\n`;

const tsconfigOf = (input: {
  parts: readonly string[];
  references: readonly string[];
  root?: string;
}): string =>
  jsonFileOf({
    extends: input.parts.map(
      (part) => `${input.root ?? '../..'}/${PRESETS}/tsc/foundation/${part}.json`,
    ),
    compilerOptions: {
      paths: {
        '#/*': [
          './src/*',
        ],
      },
    },
    include: [
      'src',
    ],
    references: input.references.map((path) => ({
      path,
    })),
  });

const manifestOf = (input: {
  dependencies?: readonly string[];
  exports?: Readonly<Record<string, string>>;
  name: string;
}): string =>
  jsonFileOf({
    name: input.name,
    private: true,
    type: 'module',
    exports: input.exports,
    imports: {
      '#/*': './src/*',
    },
    scripts: {
      test: 'bun test',
    },
    dependencies: Object.fromEntries(
      (input.dependencies ?? []).map((name) => [
        name,
        'workspace:*',
      ]),
    ),
  });

const bunfig = readFileSync(join(TEMPLATES, 'bun', 'bunfig.toml'), 'utf8').replace(
  'coveragePathIgnorePatterns = [\n',
  'coveragePathIgnorePatterns = [\n  "../**",\n',
);
const sandbox = readFileSync(
  join(TEMPLATES, 'bun', 'src', '__tests__', 'sandbox.fixtures.ts'),
  'utf8',
);

// A product of an API on NestJS's compiler options and a web client, what both
// share, and a library of types alone. `shared/` writes its imports with `#/`
// and with the `.ts` extension, which the API's options refuse in its own code.
const WORKSPACE: Files = {
  '.gitignore': [
    readFileSync(join(TEMPLATES, 'core', '.gitignore'), 'utf8'),
    readFileSync(join(TEMPLATES, 'typescript', '.gitignore'), 'utf8'),
  ].join('\n'),
  'biome.json': jsonFileOf({
    extends: [
      './.droneey/constitution/presets/common/biome/foundation/self.jsonc',
      './.droneey/constitution/presets/common/biome/foundation/git.jsonc',
    ],
    files: {
      includes: [
        '**',
        '!packages/api',
      ],
    },
  }),
  'biome.packages-api.jsonc': jsonFileOf({
    extends: [
      './.droneey/constitution/presets/common/biome/foundation/self.jsonc',
      './.droneey/constitution/presets/common/biome/foundation/git.jsonc',
      './.droneey/constitution/presets/typescript/biome/foundation/self.jsonc',
    ],
  }),
  'knip.config.mjs': `import core from './${PRESETS}/knip/foundation/core.mjs';

const unit = (entry) => ({ entry: [...core.entry, ...entry], project: core.project });

export default {
  workspaces: {
    '.': { entry: ['scripts/*.ts!'], project: ['scripts/**/*.ts!'] },
    'packages/api': unit([]),
    'packages/web': unit([]),
    shared: unit(['src/contracts/index.ts!']),
    'libs/money': unit(['src/index.ts!']),
  },
};
`,
  'package.json': jsonFileOf({
    name: 'shop',
    private: true,
    type: 'module',
    workspaces: [
      'packages/*',
      'shared',
      'libs/*',
    ],
  }),
  'scripts/release.ts': "export const release = (): string => 'release';\n",
  'tsconfig.json': jsonFileOf({
    files: [],
    references: Object.values(UNITS).map((path) => ({
      path: `./${path}`,
    })),
  }),
  'libs/money/package.json': manifestOf({
    exports: {
      '.': './src/index.ts',
    },
    name: '@shop/libs-money',
  }),
  'libs/money/src/index.ts': "export type Cents = number & { readonly __brand: 'Cents' };\n",
  'libs/money/tsconfig.json': tsconfigOf({
    parts: [
      'self',
      'core',
      'workspace',
    ],
    references: [],
  }),
  'packages/api/bunfig.toml': bunfig,
  'packages/api/package.json': manifestOf({
    dependencies: [
      '@shop/libs-money',
      '@shop/shared',
    ],
    name: '@shop/api',
  }),
  'packages/api/src/__tests__/sandbox.fixtures.ts': sandbox,
  'packages/api/src/__tests__/total.test.ts': `import { expect, it } from 'bun:test';

import type { Cents } from '@shop/libs-money';
import type { OrderId } from '@shop/shared/contracts';

import { totalLine } from '../total';

it('should name the order and its currency when an order is totalled', () => {
  // Act
  const line = totalLine({
    id: 'a' as OrderId,
    total: 1 as Cents,
  });

  // Assert
  expect(line).toBe('order:a EUR');
});
`,
  'packages/api/src/kernel/index.ts': "export const currency = 'EUR';\n",
  'packages/api/src/main.ts':
    "import { totalLine } from './total';\n\nexport const main = totalLine;\n",
  'packages/api/src/total.ts': `import type { Cents } from '@shop/libs-money';
import { describeOrder, type OrderId } from '@shop/shared/contracts';

import { currency } from '#/kernel';

interface Totalled {
  id: OrderId;
  total: Cents;
}

export const totalLine = (order: Totalled): string => \`\${describeOrder(order)} \${currency}\`;
`,
  'packages/api/tsconfig.json': tsconfigOf({
    parts: [
      'self',
      'core',
      'bun',
      'nestjs',
      'workspace',
    ],
    references: [
      '../../libs/money',
      '../../shared',
    ],
  }),
  'packages/web/bunfig.toml': bunfig,
  'packages/web/package.json': manifestOf({
    dependencies: [
      '@shop/shared',
    ],
    name: '@shop/web',
  }),
  'packages/web/src/__tests__/label.test.ts': `import { expect, it } from 'bun:test';

import type { OrderId } from '@shop/shared/contracts';

import { label } from '#/label.ts';

it('should name the order when an order is labelled', () => {
  // Act
  const text = label('a' as OrderId);

  // Assert
  expect(text).toBe('Order order:a');
});
`,
  'packages/web/src/__tests__/sandbox.fixtures.ts': sandbox,
  'packages/web/src/label.ts': `import { describeOrder, type OrderId } from '@shop/shared/contracts';

export const label = (id: OrderId): string => \`Order \${describeOrder({ id, total: 0 })}\`;
`,
  'packages/web/src/main.ts': "import { label } from './label.ts';\n\nexport const main = label;\n",
  'packages/web/tsconfig.json': tsconfigOf({
    parts: [
      'self',
      'core',
      'bun',
      'workspace',
    ],
    references: [
      '../../shared',
    ],
  }),
  'shared/bunfig.toml': bunfig,
  'shared/kinds/order-kinds.yaml': '- pickup\n- delivery\n',
  'shared/package.json': manifestOf({
    exports: {
      './contracts': './src/contracts/index.ts',
      './kinds/*': './kinds/*',
    },
    name: '@shop/shared',
  }),
  'shared/src/__tests__/order.test.ts': `import { expect, it } from 'bun:test';

import { describeOrder, type OrderId, refundLine } from '#/contracts/index.ts';

it('should name the order when an order is described', () => {
  // Act
  const text = describeOrder({ id: 'a' as OrderId, total: 0 });

  // Assert
  expect(text).toBe('order:a');
});

it('should name the refund when an order is refunded', () => {
  // Act
  const text = refundLine('a' as OrderId);

  // Assert
  expect(text).toBe('refund of order:a');
});
`,
  'shared/src/__tests__/sandbox.fixtures.ts': sandbox,
  'shared/src/contracts/index.ts': "export * from './order.ts';\n",
  'shared/src/contracts/order.ts': `import { ORDER_PREFIX } from '#/kernel/index.ts';

export type OrderId = string & { readonly __brand: 'OrderId' };

export interface Order {
  readonly id: OrderId;
  readonly total: number;
}

export const describeOrder = (order: Order): string => \`\${ORDER_PREFIX}:\${order.id}\`;

export const refundLine = (id: OrderId): string => \`refund of \${ORDER_PREFIX}:\${id}\`;
`,
  'shared/src/kernel/index.ts': "export const ORDER_PREFIX = 'order';\n",
  'shared/tsconfig.json': tsconfigOf({
    parts: [
      'self',
      'core',
      'bun',
      'workspace',
    ],
    references: [],
    root: '..',
  }),
};

const write = (input: { files: Files; folder: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    if (text === undefined) {
      rmSync(join(input.folder, path), {
        force: true,
      });
    } else {
      mkdirSync(dirname(join(input.folder, path)), {
        recursive: true,
      });
      writeFileSync(join(input.folder, path), text);
    }
  }
};

// The units are linked by their names as a package manager links them, beside
// this repository's packages; `node` runs on Bun, as `bun run` makes it.
const link = (folder: string): void => {
  mkdirSync(join(folder, 'node_modules', '@shop'), {
    recursive: true,
  });

  for (const entry of readdirSync(join(REPOSITORY, 'node_modules'))) {
    symlinkSync(join(REPOSITORY, 'node_modules', entry), join(folder, 'node_modules', entry));
  }

  for (const [name, path] of Object.entries(UNITS)) {
    symlinkSync(join(folder, path), join(folder, 'node_modules', name));
  }

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  mkdirSync(join(folder, '.shims'));
  writeFileSync(join(folder, '.shims', 'node'), '#!/bin/sh\nexec bun "$@"\n');
  chmodSync(join(folder, '.shims', 'node'), EXECUTABLE);
};

const git = (input: { args: readonly string[]; folder: string }): void => {
  spawnSync('git', input.args, {
    cwd: input.folder,
  });
};

// The real path, since the compiler matches a referenced unit's files by it.
const createWorkspace = (changes: Files = {}): string => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-workspace-')));

  write({
    files: {
      ...WORKSPACE,
      ...changes,
    },
    folder,
  });
  link(folder);
  git({
    args: [
      'init',
      '--quiet',
      '--initial-branch=main',
    ],
    folder,
  });

  return folder;
};

const runTool = (workspace: string, command: Command): Run => {
  const running = spawnSync(command.program, command.args, {
    cwd: join(workspace, command.folder ?? '.'),
    encoding: 'utf8',
    env: Object.fromEntries([
      ...Object.entries(process.env),
      [
        'CI',
        '1',
      ],
      [
        'PATH',
        `${join(workspace, '.shims')}:${BIN}:${process.env['PATH'] ?? ''}`,
      ],
    ]),
  });

  return {
    output: `${running.stdout}${running.stderr}`,
    passed: running.status === 0,
  };
};

// The branch's base is committed and named `origin/main`; the change is left in the tree.
const commitBase = (workspace: string): void => {
  for (const args of [
    [
      'add',
      '.',
    ],
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.com',
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ],
    [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
  ]) {
    git({
      args,
      folder: workspace,
    });
  }
};

const removeWorkspace = (workspace: string): void => {
  rmSync(workspace, {
    force: true,
    recursive: true,
  });
};

export { commitBase, createWorkspace, PRESETS, REPOSITORY, removeWorkspace, runTool, write };
