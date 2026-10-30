import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import type { UnitFixture } from './applied-unit.fixtures';
import { constitutionOf } from './applied-unit.fixtures';
import { cliPath } from './cli.fixtures';
import { searchPathWith, toolEnvironment } from './package.fixtures';
import { OWN_PACK } from './project.fixtures';

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

const repository = join(import.meta.dir, '..', '..');
const bin = join(repository, 'node_modules', '.bin');
const UNITS: Readonly<Record<string, string>> = {
  '@shop/api': 'apps/api',
  '@shop/desk-web': 'apps/@desk/web',
  '@shop/eros-typescript': 'packages/@eros/typescript',
  '@shop/money': 'packages/money',
  '@shop/orders': 'packages/orders',
  '@shop/web': 'apps/web',
} as const;

const PYTHON_PACKAGES: readonly string[] = [
  'packages/@eros/python',
  'apps/reports',
  'packages/tabula',
] as const;

const SHARED_PACKAGES: Readonly<Record<string, string>> = {
  '@shop/desk-shared': 'packages/@desk/shared',
  '@shop/eros-shared': 'packages/@eros/shared',
} as const;

const jsonFileOf = (fields: unknown): string => `${JSON.stringify(fields, undefined, 2)}\n`;

const tsconfigOf = (input: { references: readonly string[] }): string =>
  jsonFileOf({
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

interface ManifestInput {
  readonly dependencies?: readonly string[];
  readonly exports?: Readonly<Record<string, string>>;
  readonly fields?: Readonly<Record<string, unknown>>;
  readonly name: string;
}

const toolPackages: Readonly<Record<string, string>> = {
  '@biomejs/biome': '1.0.0',
  'dependency-cruiser': '1.0.0',
  knip: '1.0.0',
  typescript: '1.0.0',
};

const manifestOf = (input: ManifestInput): string =>
  jsonFileOf({
    name: input.name,
    private: true,
    type: 'module',
    exports: input.exports,
    imports: {
      '#/*': './src/*',
    },
    dependencies: Object.fromEntries(
      (input.dependencies ?? []).map((name) => [
        name,
        name.startsWith('@shop/') ? 'workspace:*' : '1.0.0',
      ]),
    ),
    ...input.fields,
    devDependencies: {
      ...toolPackages,
      ...z.record(z.string(), z.string()).optional().parse(input.fields?.['devDependencies']),
    },
  });

const pyprojectOf = (input: { lines?: readonly string[]; name: string }): string =>
  [
    '[project]',
    `name = "${input.name}"`,
    'version = "0.0.0"',
    'requires-python = ">=3.14"',
    ...(input.lines ?? [
      'dependencies = []',
    ]),
    '',
    '[build-system]',
    'requires = ["uv_build>=0.13,<0.14"]',
    'build-backend = "uv_build"',
    '',
  ].join('\n');

const installed: Files = {
  'node_modules/@nestjs/common/index.d.ts':
    'export declare const Module: (metadata: { providers: readonly unknown[] }) => (target: object) => void;\n',
  'node_modules/@nestjs/common/index.js': 'export const Module = () => () => undefined;\n',
  'node_modules/@nestjs/common/package.json': jsonFileOf({
    name: '@nestjs/common',
    version: '12.1.2',
    type: 'module',
    types: 'index.d.ts',
    main: 'index.js',
  }),
  'node_modules/x-api/dist/index.js': 'export const get = () => undefined;\n',
  'node_modules/x-api/package.json': jsonFileOf({
    name: 'x-api',
    version: '1.0.0',
    type: 'module',
    main: 'dist/index.js',
  }),
};

const eros: Files = {
  'packages/@eros/shared/package.json': jsonFileOf({
    name: '@shop/eros-shared',
    private: true,
    type: 'module',
    exports: {
      './conformance/*': './shop_eros_shared/conformance/*',
      './schema/*': './shop_eros_shared/schema/*',
    },
  }),
  'packages/@eros/shared/pyproject.toml': [
    pyprojectOf({
      name: 'shop-eros-shared',
    }),
    '[tool.uv.build-backend]',
    'module-root = ""',
    'namespace = true',
    '',
  ].join('\n'),
  'packages/@eros/shared/shop_eros_shared/conformance/cases.yaml':
    '- code: validation.email\n  status: 422\n',
  'packages/@eros/shared/shop_eros_shared/schema/kinds.yaml': '- validation\n- not-found\n',
  'packages/@eros/typescript/package.json': manifestOf({
    dependencies: [
      '@shop/eros-shared',
    ],
    exports: {
      '.': './src/index.ts',
      './nestjs': './src/integrations/nestjs/index.ts',
    },
    fields: {
      devDependencies: {
        '@nestjs/common': '12.1.2',
      },
      peerDependencies: {
        '@nestjs/common': '>=11',
      },
      peerDependenciesMeta: {
        '@nestjs/common': {
          optional: true,
        },
      },
    },
    name: '@shop/eros-typescript',
  }),
  'packages/@eros/typescript/src/features/errors/domain/errors/eros.error.ts': `import type { ErrorCode } from '../value-objects';

export class ErosError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}
`,
  'packages/@eros/typescript/src/features/errors/domain/errors/index.ts':
    "export { ErosError } from './eros.error';\n",
  'packages/@eros/typescript/src/features/errors/domain/value-objects/error-code.value-object.ts': `export type ErrorCode = string & { readonly __brand: 'ErrorCode' };

export const isErrorCode = (text: string): text is ErrorCode => /^[a-z-]+\\.[a-z-]+$/u.test(text);
`,
  'packages/@eros/typescript/src/features/errors/domain/value-objects/index.ts':
    "export { type ErrorCode, isErrorCode } from './error-code.value-object';\n",
  'packages/@eros/typescript/src/features/errors/index.ts':
    "export { ErosError } from './domain/errors';\nexport { type ErrorCode, isErrorCode } from './domain/value-objects';\n",
  'packages/@eros/typescript/src/features/mapping/application/use-cases/queries/kind-of/index.ts':
    "export { kindOf } from './kind-of.use-case';\n",
  'packages/@eros/typescript/src/features/mapping/application/use-cases/queries/kind-of/kind-of.use-case.ts': `import { KINDS } from '#/kernel/constants';

export const kindOf = (code: string): string | undefined =>
  KINDS.find((kind) => code.startsWith(\`\${kind}.\`));
`,
  'packages/@eros/typescript/src/features/mapping/index.ts':
    "export { kindOf } from './application/use-cases/queries/kind-of';\n",
  'packages/@eros/typescript/src/features/problem/infrastructure/problem/index.ts':
    "export { problemOf } from './problem.adapter';\n",
  'packages/@eros/typescript/src/features/problem/infrastructure/problem/problem.adapter.ts': `import type { Problem } from '../../domain/entities';

// The wire shape of RFC 9457.
interface ProblemDocument {
  readonly code: string;
  readonly status: number;
  readonly type: 'about:blank';
}

export const problemOf = (problem: Problem): ProblemDocument => ({
  code: problem.code,
  status: problem.status,
  type: 'about:blank',
});
`,
  'packages/@eros/typescript/src/features/problem/domain/entities/index.ts':
    "export type { Problem } from './problem.entity';\n",
  'packages/@eros/typescript/src/features/problem/domain/entities/problem.entity.ts':
    'export interface Problem {\n  readonly code: string;\n  readonly status: number;\n}\n',
  'packages/@eros/typescript/src/features/problem/index.ts':
    "export type { Problem } from './domain/entities';\n",
  'packages/@eros/typescript/src/features/records/domain/entities/error-record.entity.ts':
    'export interface ErrorRecord {\n  readonly code: string;\n  readonly kind: string;\n}\n',
  'packages/@eros/typescript/src/features/records/domain/entities/index.ts':
    "export type { ErrorRecord } from './error-record.entity';\n",
  'packages/@eros/typescript/src/features/records/application/use-cases/queries/to-record/index.ts':
    "export { toRecord } from './to-record.use-case';\n",
  'packages/@eros/typescript/src/features/records/application/use-cases/queries/to-record/to-record.use-case.ts': `import type { ErrorRecord } from '../../../entities';

export const toRecord = (input: ErrorRecord): ErrorRecord => ({ code: input.code, kind: input.kind });
`,
  'packages/@eros/typescript/src/features/records/index.ts':
    "export type { ErrorRecord } from './domain/entities';\nexport { toRecord } from './application/use-cases/queries/to-record';\n",
  'packages/@eros/typescript/src/index.ts': `export { ErosError, type ErrorCode, isErrorCode } from './features/errors';
export { kindOf } from './features/mapping';
export type { Problem } from './features/problem';
export { problemOf } from './features/problem/infrastructure/problem';
export { type ErrorRecord, toRecord } from './features/records';
export { KINDS } from './kernel/constants';
`,
  'packages/@eros/typescript/src/integrations/nestjs/index.ts': `import { Module } from '@nestjs/common';

import { KINDS } from '#/kernel/constants';

export const erosModule = Module({ providers: [{ provide: 'EROS_KINDS', useValue: KINDS }] });
`,
  'packages/@eros/typescript/src/kernel/constants/index.ts':
    "export { KINDS } from './kinds.constants';\n",
  'packages/@eros/typescript/src/kernel/constants/kinds.constants.ts': `import kinds from '@shop/eros-shared/schema/kinds.yaml';

const isKinds = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((kind) => typeof kind === 'string');

// The build writes the parsed file into the bundle; a source of another shape is no kind.
export const KINDS: readonly string[] = isKinds(kinds) ? kinds : [];
`,
  'packages/@eros/typescript/tsconfig.json': tsconfigOf({
    references: [],
  }),
  'packages/@eros/python/pyproject.toml': pyprojectOf({
    lines: [
      'dependencies = ["shop-eros-shared"]',
      '',
      '[project.optional-dependencies]',
      'fastapi = ["fastapi>=0.115"]',
      'fastmcp = ["fastmcp>=2.14"]',
      '',
      '[tool.uv.sources]',
      'shop-eros-shared = { workspace = true }',
    ],
    name: 'shop-eros-python',
  }),
  'packages/@eros/python/src/shop_eros_python/__init__.py':
    "from shop_eros_python.kernel.constants import KINDS\n\n__all__ = ['KINDS']\n",
  'packages/@eros/python/src/shop_eros_python/features/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/errors/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/errors/domain/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/errors/domain/errors/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/errors/domain/errors/eros_error.py':
    'class ErosError(Exception):\n  pass\n',
  'packages/@eros/python/src/shop_eros_python/features/problem/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/problem/infrastructure/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/features/problem/infrastructure/problem/__init__.py':
    '',
  'packages/@eros/python/src/shop_eros_python/features/problem/infrastructure/problem/problem_adapter.py':
    "def problem_of(code: str) -> dict[str, str]:\n  return {'code': code, 'type': 'about:blank'}\n",
  'packages/@eros/python/src/shop_eros_python/integrations/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/integrations/fastapi/__init__.py':
    'from fastapi import APIRouter\n\nrouter = APIRouter()\n',
  'packages/@eros/python/src/shop_eros_python/integrations/fastmcp/__init__.py':
    "from fastmcp import FastMCP\n\nserver = FastMCP('eros')\n",
  'packages/@eros/python/src/shop_eros_python/kernel/__init__.py': '',
  'packages/@eros/python/src/shop_eros_python/kernel/constants/__init__.py':
    "from .kinds_constants import KINDS\n\n__all__ = ['KINDS']\n",
  'packages/@eros/python/src/shop_eros_python/kernel/constants/kinds_constants.py': `from importlib.resources import files

import shop_eros_shared

KINDS = tuple(
  line.removeprefix('- ')
  for line in files(shop_eros_shared).joinpath('schema', 'kinds.yaml').read_text(encoding='utf-8').splitlines()
)
`,
  'packages/@eros/python/src/shop_eros_python/py.typed': '',
};

const reports: Files = {
  'packages/tabula/pyproject.toml': pyprojectOf({
    name: 'shop-tabula',
  }),
  'packages/tabula/src/shop_tabula/__init__.py':
    "from shop_tabula.features.sheets import sheet\n\n__all__ = ['sheet']\n",
  'packages/tabula/src/shop_tabula/features/__init__.py': '',
  'packages/tabula/src/shop_tabula/features/sheets/__init__.py':
    "from .domain.entities import sheet\n\n__all__ = ['sheet']\n",
  'packages/tabula/src/shop_tabula/features/sheets/domain/__init__.py': '',
  'packages/tabula/src/shop_tabula/features/sheets/domain/entities/__init__.py':
    "from .sheet_entity import sheet\n\n__all__ = ['sheet']\n",
  'packages/tabula/src/shop_tabula/features/sheets/domain/entities/sheet_entity.py':
    "def sheet(rows: list[str]) -> str:\n  return '\\n'.join(rows)\n",
  'packages/tabula/src/shop_tabula/py.typed': '',
  'apps/reports/pyproject.toml': pyprojectOf({
    lines: [
      'dependencies = ["shop-tabula"]',
      '',
      '[tool.uv.sources]',
      'shop-tabula = { workspace = true }',
    ],
    name: 'shop-reports',
  }),
  'apps/reports/src/shop_reports/__init__.py': '',
  'apps/reports/src/shop_reports/features/__init__.py': '',
  'apps/reports/src/shop_reports/features/sales/__init__.py': '',
  'apps/reports/src/shop_reports/features/sales/presentation/__init__.py': '',
  'apps/reports/src/shop_reports/features/sales/presentation/sales_report.py':
    "from shop_tabula import sheet\n\n\ndef sales_report() -> str:\n  return sheet(['sales'])\n",
  'apps/reports/src/shop_reports/main.py': 'from shop_reports.root.wiring import run\n\nrun()\n',
  'apps/reports/src/shop_reports/root/__init__.py': '',
  'apps/reports/src/shop_reports/root/wiring.py':
    "import structlog\n\n\ndef run() -> None:\n  structlog.get_logger().info('reports')\n",
};

const desk: Files = {
  'packages/@desk/shared/package.json': jsonFileOf({
    name: '@shop/desk-shared',
    private: true,
    type: 'module',
    exports: {
      './schema/*': './schema/*',
    },
  }),
  'packages/@desk/shared/schema/queues.yaml': '- billing\n- returns\n',
  'apps/@desk/web/package.json': manifestOf({
    dependencies: [
      '@shop/desk-shared',
    ],
    name: '@shop/desk-web',
  }),
  'apps/@desk/web/src/kernel/constants/index.ts': "export { QUEUES } from './queues.constants';\n",
  'apps/@desk/web/src/kernel/constants/queues.constants.ts': `import queues from '@shop/desk-shared/schema/queues.yaml';

const isQueues = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((queue) => typeof queue === 'string');

export const QUEUES: readonly string[] = isQueues(queues) ? queues : [];
`,
  'apps/@desk/web/src/main.ts':
    "import { QUEUES } from '#/kernel/constants';\n\nexport const main = (): readonly string[] => QUEUES;\n",
  'apps/@desk/web/tsconfig.json': tsconfigOf({
    references: [],
  }),
};

const web: Files = {
  'apps/web/package.json': manifestOf({
    dependencies: [
      '@shop/orders',
    ],
    name: '@shop/web',
  }),
  'apps/web/src/features/labels/presentation/__tests__/label.test.ts': `import { expect, it } from 'bun:test';

import type { OrderId } from '@shop/orders';

import { label } from '../label';

it('should name the order when an order is labelled', () => {
  // Act
  const text = label('a' as OrderId);

  // Assert
  expect(text).toBe('Order order:a');
});
`,
  'apps/web/src/features/labels/presentation/label.ts': `import { describeOrder, type OrderId } from '@shop/orders';

export const label = (id: OrderId): string => \`Order \${describeOrder({ id, total: 0 })}\`;
`,
  'apps/web/src/features/labels/index.ts': "export { label } from './presentation/label';\n",
  'apps/web/src/main.ts':
    "import { label } from '#/features/labels';\n\nexport const main = label;\n",
  'apps/web/tsconfig.json': tsconfigOf({
    references: [
      '../../packages/orders',
    ],
  }),
};

const apiAndShared: Files = {
  'packages/money/package.json': manifestOf({
    exports: {
      '.': './src/index.ts',
    },
    name: '@shop/money',
  }),
  'packages/money/src/features/currency/domain/value-objects/cents.value-object.ts':
    "export type Cents = number & { readonly __brand: 'Cents' };\n",
  'packages/money/src/features/currency/domain/value-objects/index.ts':
    "export type { Cents } from './cents.value-object';\n",
  'packages/money/src/features/currency/index.ts':
    "export type { Cents } from './domain/value-objects';\n",
  'packages/money/src/index.ts': "export type { Cents } from './features/currency';\n",
  'packages/money/tsconfig.json': tsconfigOf({
    references: [],
  }),
  'apps/api/package.json': manifestOf({
    dependencies: [
      '@shop/money',
      '@shop/orders',
    ],
    name: '@shop/api',
  }),
  'apps/api/src/features/totals/presentation/__tests__/total-line.test.ts': `import { expect, it } from 'bun:test';

import type { Cents } from '@shop/money';
import type { OrderId } from '@shop/orders';

import { totalLine } from '../total-line';

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
  'apps/api/src/features/totals/presentation/total-line.ts': `import type { Cents } from '@shop/money';
import { describeOrder, type OrderId } from '@shop/orders';

import { CURRENCY } from '#/kernel/constants';

interface Totalled {
  id: OrderId;
  total: Cents;
}

export const totalLine = (order: Totalled): string => \`\${describeOrder(order)} \${CURRENCY}\`;
`,
  'apps/api/src/features/totals/index.ts':
    "export { totalLine } from './presentation/total-line';\n",
  'apps/api/src/kernel/constants/currency.constants.ts': "export const CURRENCY = 'EUR';\n",
  'apps/api/src/kernel/constants/index.ts': "export { CURRENCY } from './currency.constants';\n",
  'apps/api/src/main.ts':
    "import { totalLine } from './features/totals';\n\nexport const main = totalLine;\n",
  'apps/api/tsconfig.json': tsconfigOf({
    references: [
      '../../packages/money',
      '../../packages/orders',
    ],
  }),
  'packages/orders/package.json': manifestOf({
    exports: {
      '.': './src/index.ts',
    },
    name: '@shop/orders',
  }),
  'packages/orders/src/features/orders/domain/entities/__tests__/order.entity.test.ts': `import { expect, it } from 'bun:test';

import { describeOrder, type OrderId, refundLine } from '../order.entity.ts';

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
  'packages/orders/src/features/orders/domain/entities/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './order.entity.ts';\n",
  'packages/orders/src/features/orders/domain/entities/order.entity.ts': `import { ORDER_PREFIX } from '#/kernel/constants/index.ts';

export type OrderId = string & { readonly __brand: 'OrderId' };

export interface Order {
  readonly id: OrderId;
  readonly total: number;
}

export const describeOrder = (order: Order): string => \`\${ORDER_PREFIX}:\${order.id}\`;

export const refundLine = (id: OrderId): string => \`refund of \${ORDER_PREFIX}:\${id}\`;
`,
  'packages/orders/src/features/orders/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './domain/entities/index.ts';\n",
  'packages/orders/src/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './features/orders/index.ts';\n",
  'packages/orders/src/kernel/constants/index.ts':
    "export { ORDER_PREFIX } from './order.constants.ts';\n",
  'packages/orders/src/kernel/constants/order.constants.ts':
    "export const ORDER_PREFIX = 'order';\n",
  'packages/orders/tsconfig.json': tsconfigOf({
    references: [],
  }),
};

const typescriptTools: readonly string[] = [
  'bun',
  'bun-test',
  'tsc',
  'biome',
  'knip',
  'dependency-cruiser',
  'git',
];

const strykerPack = `stryker:
  stryker-runs-the-distribution-runner:
    typescript:
      stryker.config.json:
        plugins: !replace
          - ${fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/runner'))}
          - ${fileURLToPath(import.meta.resolve('@droneey/mutation-check-typescript/ignorers'))}
`;

const unitBlocks: Readonly<Record<string, UnitFixture>> = {
  '.': {
    domains: [
      'workspace',
    ],
    implementations: [
      'bun',
      'tsc',
      'biome',
      'knip',
      'dependency-cruiser',
      'git',
      'uv',
    ],
    languages: [
      'typescript',
      'python',
    ],
    name: 'shop',
  },
  'apps/api': {
    domains: [
      'workspace',
    ],
    implementations: [
      ...typescriptTools,
      'nestjs',
    ],
    languages: [
      'typescript',
    ],
    name: '@shop/api',
  },
  'apps/@desk/web': {
    domains: [
      'workspace',
    ],
    implementations: typescriptTools,
    languages: [
      'typescript',
    ],
    name: '@shop/desk-web',
  },
  'apps/reports': {
    domains: [
      'workspace',
    ],
    implementations: [
      'uv',
      'python-check',
      'structlog',
    ],
    languages: [
      'python',
    ],
    name: 'shop-reports',
  },
  'apps/web': {
    domains: [
      'workspace',
    ],
    implementations: [
      ...typescriptTools,
      'stryker',
    ],
    languages: [
      'typescript',
    ],
    name: '@shop/web',
    packs: [
      OWN_PACK,
    ],
    platforms: [
      'browser',
    ],
  },
  'packages/@desk/shared': {
    domains: [
      'workspace',
    ],
    languages: [
      'yaml',
    ],
    name: '@shop/desk-shared',
  },
  'packages/@eros/python': {
    domains: [
      'workspace',
    ],
    implementations: [
      'uv',
      'python-check',
      'fastapi',
      'fastmcp',
    ],
    languages: [
      'python',
    ],
    name: 'shop-eros-python',
  },
  'packages/@eros/shared': {
    domains: [
      'workspace',
    ],
    languages: [
      'yaml',
    ],
    name: '@shop/eros-shared',
  },
  'packages/@eros/typescript': {
    domains: [
      'workspace',
    ],
    implementations: typescriptTools,
    languages: [
      'typescript',
    ],
    name: '@shop/eros-typescript',
  },
  'packages/money': {
    domains: [
      'workspace',
    ],
    implementations: typescriptTools.filter((block) => block !== 'bun-test'),
    languages: [
      'typescript',
    ],
    name: '@shop/money',
  },
  'packages/orders': {
    domains: [
      'workspace',
    ],
    implementations: typescriptTools,
    languages: [
      'typescript',
    ],
    name: '@shop/orders',
  },
  'packages/tabula': {
    domains: [
      'workspace',
    ],
    implementations: [
      'uv',
      'python-check',
    ],
    languages: [
      'python',
    ],
    name: 'shop-tabula',
  },
};

const workspaceFiles: Files = {
  ...installed,
  ...eros,
  ...desk,
  ...reports,
  ...web,
  ...apiAndShared,
  ...Object.fromEntries(
    Object.entries(unitBlocks).map(([folder, unit]) => [
      join(folder, 'constitution.yaml'),
      constitutionOf(unit),
    ]),
  ),
  [`apps/web/${OWN_PACK}/presets/stryker/foundation/with/bun-test.yaml`]: strykerPack,
  'knip.jsonc': jsonFileOf({
    entry: [
      'scripts/*.ts!',
    ],
    ignoreWorkspaces: Object.values(UNITS),
    project: [
      'scripts/**/*.ts!',
    ],
  }),
  'package.json': jsonFileOf({
    devDependencies: toolPackages,
    name: 'shop',
    private: true,
    type: 'module',
    workspaces: [
      'apps/*',
      'apps/@desk/*',
      'packages/*',
      'packages/@desk/*',
      'packages/@eros/*',
    ],
  }),
  'packages/@eros/typescript/knip.jsonc': jsonFileOf({
    ignoreDependencies: [
      '@nestjs/common!',
    ],
  }),
  'pyproject.toml': [
    '[tool.uv.workspace]',
    'members = ["apps/reports", "packages/*/python", "packages/@eros/shared", "packages/tabula"]',
    '',
  ].join('\n'),
  'scripts/release.ts': "export const release = (): string => 'release';\n",
  'tsconfig.json': jsonFileOf({
    files: [],
    references: Object.values(UNITS).map((path) => ({
      path: `./${path}`,
    })),
  }),
};

interface WriteInput {
  readonly files: Files;
  readonly folder: string;
}

const write = (input: WriteInput): void => {
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

const link = (folder: string): void => {
  mkdirSync(join(folder, 'node_modules', '@shop'), {
    recursive: true,
  });

  for (const entry of readdirSync(join(repository, 'node_modules'))) {
    symlinkSync(join(repository, 'node_modules', entry), join(folder, 'node_modules', entry));
  }

  for (const [name, path] of Object.entries({
    ...UNITS,
    ...SHARED_PACKAGES,
  })) {
    symlinkSync(join(folder, path), join(folder, 'node_modules', name));
  }

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(repository, join(folder, '.droneey', 'constitution'));
  mkdirSync(join(folder, '.shims'));
  writeFileSync(join(folder, '.shims', 'node'), '#!/bin/sh\nexec bun "$@"\n');
  chmodSync(join(folder, '.shims', 'node'), EXECUTABLE);
};

const git = (input: { args: readonly string[]; folder: string }): void => {
  spawnSync('git', input.args, {
    cwd: input.folder,
    env: toolEnvironment(),
  });
};

const apply = (folder: string): void => {
  const run = spawnSync(
    cliPath,
    [
      'presets',
      'apply',
      '--no-fix',
      '--plain',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  if (run.status !== 0) {
    throw new Error(`presets apply failed in ${folder}: ${run.stdout}${run.stderr}`);
  }
};

// Why: the real path, since the compiler matches a referenced unit's files by it.
const createWorkspace = (changes: Files = {}): string => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-workspace-')));

  write({
    files: {
      ...workspaceFiles,
      ...changes,
    },
    folder,
  });
  link(folder);
  apply(folder);
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
    env: toolEnvironment(
      new Map([
        [
          'CI',
          '1',
        ],
        [
          'PATH',
          searchPathWith(join(workspace, '.shims'), bin),
        ],
      ]),
    ),
  });

  return {
    output: `${running.stdout}${running.stderr}`,
    passed: running.status === 0,
  };
};

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

export {
  commitBase,
  createWorkspace,
  manifestOf,
  PYTHON_PACKAGES,
  removeWorkspace,
  repository,
  runTool,
  UNITS,
  write,
};
