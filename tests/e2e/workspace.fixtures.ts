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

// Each TypeScript package's folder, by the name that follows its unit's folder.
const UNITS: Readonly<Record<string, string>> = {
  '@shop/api': 'packages/api',
  '@shop/eros': 'packages/eros/typescript',
  '@shop/libs-money': 'libs/money',
  '@shop/shared': 'shared',
  '@shop/web': 'packages/web',
};

// Each Python package's folder: a product in two languages, an application and
// the library of libs/ it uses.
const PYTHON_PACKAGES: readonly string[] = [
  'packages/eros/python',
  'packages/reports',
  'libs/tabula',
];

// A file symlink inside a package, then the file it points to: data a package
// takes at run time from its unit's single source.
const LINKS: Readonly<Record<string, string>> = {
  'packages/eros/python/src/shop_eros/kernel/constants/kinds.yaml':
    '../../../../../shared/schema/kinds.yaml',
};

const jsonFileOf = (fields: unknown): string => `${JSON.stringify(fields, undefined, 2)}\n`;

const tsconfigOf = (input: {
  exclude?: readonly string[];
  extra?: Readonly<Record<string, unknown>>;
  include?: readonly string[];
  parts: readonly string[];
  references: readonly string[];
  root?: string;
}): string =>
  jsonFileOf({
    extends: input.parts.map((part) => `${input.root ?? '../..'}/${PRESETS}/tsc/${part}.json`),
    compilerOptions: {
      ...input.extra,
      paths: {
        '#/*': [
          './src/*',
        ],
      },
    },
    include: input.include ?? [
      'src',
    ],
    exclude: input.exclude,
    references: input.references.map((path) => ({
      path,
    })),
  });

const manifestOf = (input: {
  dependencies?: readonly string[];
  exports?: Readonly<Record<string, string>>;
  fields?: Readonly<Record<string, unknown>>;
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
        name.startsWith('@shop/') ? 'workspace:*' : '1.0.0',
      ]),
    ),
    ...input.fields,
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
    'requires = ["uv_build>=0.12,<0.13"]',
    'build-backend = "uv_build"',
    '',
  ].join('\n');

const bunfig = readFileSync(join(TEMPLATES, 'bun', 'bunfig.toml'), 'utf8').replace(
  'coveragePathIgnorePatterns = [\n',
  'coveragePathIgnorePatterns = [\n  "../**",\n',
);
const sandbox = readFileSync(
  join(TEMPLATES, 'bun', 'src', '__tests__', 'sandbox.fixtures.ts'),
  'utf8',
);

// A package an application must not import outside the edge, built into its
// dist/ as a registry's package is, and the framework eros integrates with.
const INSTALLED: Files = {
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

// eros, a product in two languages: its data in no language once, in shared/,
// and a package for each language laid out by layers, with its integrations
// into host frameworks as entries of their own.
const EROS: Files = {
  'packages/eros/shared/conformance/cases.yaml': '- code: validation.email\n  status: 422\n',
  'packages/eros/shared/schema/kinds.yaml': '- validation\n- not-found\n',
  'packages/eros/typescript/bunfig.toml': bunfig,
  'packages/eros/typescript/src/__tests__/sandbox.fixtures.ts': sandbox,
  'packages/eros/typescript/package.json': manifestOf({
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
    name: '@shop/eros',
  }),
  'packages/eros/typescript/src/features/errors/domain/errors/eros.error.ts': `import type { ErrorCode } from '../value-objects';

export class ErosError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}
`,
  'packages/eros/typescript/src/features/errors/domain/errors/index.ts':
    "export { ErosError } from './eros.error';\n",
  'packages/eros/typescript/src/features/errors/domain/value-objects/error-code.value-object.ts': `export type ErrorCode = string & { readonly __brand: 'ErrorCode' };

export const isErrorCode = (text: string): text is ErrorCode => /^[a-z-]+\\.[a-z-]+$/u.test(text);
`,
  'packages/eros/typescript/src/features/errors/domain/value-objects/index.ts':
    "export { type ErrorCode, isErrorCode } from './error-code.value-object';\n",
  'packages/eros/typescript/src/features/errors/index.ts':
    "export { ErosError } from './domain/errors';\nexport { type ErrorCode, isErrorCode } from './domain/value-objects';\n",
  'packages/eros/typescript/src/features/mapping/domain/use-cases/queries/kind-of/index.ts':
    "export { kindOf } from './kind-of.use-case';\n",
  'packages/eros/typescript/src/features/mapping/domain/use-cases/queries/kind-of/kind-of.use-case.ts': `import { KINDS } from '#/kernel';

export const kindOf = (code: string): string | undefined =>
  KINDS.find((kind) => code.startsWith(\`\${kind}.\`));
`,
  'packages/eros/typescript/src/features/mapping/index.ts':
    "export { kindOf } from './domain/use-cases/queries/kind-of';\n",
  'packages/eros/typescript/src/features/problem/adapters/problem/index.ts':
    "export { problemOf } from './problem.adapter';\n",
  'packages/eros/typescript/src/features/problem/adapters/problem/problem.adapter.ts': `import type { Problem } from '../../domain/entities';

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
  'packages/eros/typescript/src/features/problem/domain/entities/index.ts':
    "export type { Problem } from './problem.entity';\n",
  'packages/eros/typescript/src/features/problem/domain/entities/problem.entity.ts':
    'export interface Problem {\n  readonly code: string;\n  readonly status: number;\n}\n',
  'packages/eros/typescript/src/features/problem/index.ts':
    "export { problemOf } from './adapters/problem';\nexport type { Problem } from './domain/entities';\n",
  'packages/eros/typescript/src/features/records/domain/entities/error-record.entity.ts':
    'export interface ErrorRecord {\n  readonly code: string;\n  readonly kind: string;\n}\n',
  'packages/eros/typescript/src/features/records/domain/entities/index.ts':
    "export type { ErrorRecord } from './error-record.entity';\n",
  'packages/eros/typescript/src/features/records/domain/use-cases/queries/to-record/index.ts':
    "export { toRecord } from './to-record.use-case';\n",
  'packages/eros/typescript/src/features/records/domain/use-cases/queries/to-record/to-record.use-case.ts': `import type { ErrorRecord } from '../../../entities';

export const toRecord = (input: ErrorRecord): ErrorRecord => ({ code: input.code, kind: input.kind });
`,
  'packages/eros/typescript/src/features/records/index.ts':
    "export type { ErrorRecord } from './domain/entities';\nexport { toRecord } from './domain/use-cases/queries/to-record';\n",
  'packages/eros/typescript/src/index.ts': `export { ErosError, type ErrorCode, isErrorCode } from './features/errors';
export { kindOf } from './features/mapping';
export { type Problem, problemOf } from './features/problem';
export { type ErrorRecord, toRecord } from './features/records';
export { KINDS } from './kernel';
`,
  'packages/eros/typescript/src/integrations/nestjs/index.ts': `import { Module } from '@nestjs/common';

import { KINDS } from '#/kernel';

export const erosModule = Module({ providers: [{ provide: 'EROS_KINDS', useValue: KINDS }] });
`,
  'packages/eros/typescript/src/kernel/constants/index.ts':
    "export { KINDS } from './kinds.constants';\n",
  'packages/eros/typescript/src/kernel/constants/kinds.constants.ts': `import kinds from '../../../../shared/schema/kinds.yaml';

const isKinds = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((kind) => typeof kind === 'string');

// The build writes the parsed file into the bundle; a source of another shape is no kind.
export const KINDS: readonly string[] = isKinds(kinds) ? kinds : [];
`,
  'packages/eros/typescript/src/kernel/index.ts': "export { KINDS } from './constants';\n",
  'packages/eros/typescript/tsconfig.json': tsconfigOf({
    parts: [
      'self',
      'core',
      'bun',
      'workspace',
    ],
    references: [],
    root: '../../..',
  }),
  'packages/eros/python/pyproject.toml': pyprojectOf({
    lines: [
      'dependencies = []',
      '',
      '[project.optional-dependencies]',
      'fastapi = ["fastapi>=0.115"]',
      'fastmcp = ["fastmcp>=2.14"]',
    ],
    name: 'shop-eros',
  }),
  'packages/eros/python/src/shop_eros/__init__.py':
    "from shop_eros.kernel import KINDS\n\n__all__ = ['KINDS']\n",
  'packages/eros/python/src/shop_eros/features/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/errors/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/errors/domain/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/errors/domain/errors/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/errors/domain/errors/eros_error.py':
    'class ErosError(Exception):\n  pass\n',
  'packages/eros/python/src/shop_eros/features/problem/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/problem/adapters/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/problem/adapters/problem/__init__.py': '',
  'packages/eros/python/src/shop_eros/features/problem/adapters/problem/problem_adapter.py':
    "def problem_of(code: str) -> dict[str, str]:\n  return {'code': code, 'type': 'about:blank'}\n",
  'packages/eros/python/src/shop_eros/integrations/__init__.py': '',
  'packages/eros/python/src/shop_eros/integrations/fastapi/__init__.py':
    'from fastapi import APIRouter\n\nrouter = APIRouter()\n',
  'packages/eros/python/src/shop_eros/integrations/fastmcp/__init__.py':
    "from fastmcp import FastMCP\n\nserver = FastMCP('eros')\n",
  'packages/eros/python/src/shop_eros/kernel/__init__.py':
    "from .constants import KINDS\n\n__all__ = ['KINDS']\n",
  'packages/eros/python/src/shop_eros/kernel/constants/__init__.py':
    "from .kinds_constants import KINDS\n\n__all__ = ['KINDS']\n",
  'packages/eros/python/src/shop_eros/kernel/constants/kinds_constants.py': `from importlib.resources import files

KINDS = tuple(
  line.removeprefix('- ')
  for line in files(__package__ or '').joinpath('kinds.yaml').read_text(encoding='utf-8').splitlines()
)
`,
  'packages/eros/python/src/shop_eros/py.typed': '',
};

// An application in Python alone, and the library of libs/ it takes from the workspace.
const REPORTS: Files = {
  'libs/tabula/pyproject.toml': pyprojectOf({
    name: 'shop-libs-tabula',
  }),
  'libs/tabula/src/shop_libs_tabula/__init__.py':
    "from shop_libs_tabula.features.sheets import sheet\n\n__all__ = ['sheet']\n",
  'libs/tabula/src/shop_libs_tabula/features/__init__.py': '',
  'libs/tabula/src/shop_libs_tabula/features/sheets/__init__.py':
    "from .domain.entities import sheet\n\n__all__ = ['sheet']\n",
  'libs/tabula/src/shop_libs_tabula/features/sheets/domain/__init__.py': '',
  'libs/tabula/src/shop_libs_tabula/features/sheets/domain/entities/__init__.py':
    "from .sheet_entity import sheet\n\n__all__ = ['sheet']\n",
  'libs/tabula/src/shop_libs_tabula/features/sheets/domain/entities/sheet_entity.py':
    "def sheet(rows: list[str]) -> str:\n  return '\\n'.join(rows)\n",
  'libs/tabula/src/shop_libs_tabula/py.typed': '',
  'packages/reports/pyproject.toml': pyprojectOf({
    lines: [
      'dependencies = ["shop-libs-tabula"]',
      '',
      '[tool.uv.sources]',
      'shop-libs-tabula = { workspace = true }',
      '',
      '[tool.python-check]',
      `extend = ["../../${PRESETS.replace('typescript', 'python')}/python-check/architecture/structlog.toml"]`,
    ],
    name: 'shop-reports',
  }),
  'packages/reports/src/shop_reports/__init__.py': '',
  'packages/reports/src/shop_reports/features/__init__.py': '',
  'packages/reports/src/shop_reports/features/sales/__init__.py': '',
  'packages/reports/src/shop_reports/features/sales/app/__init__.py': '',
  'packages/reports/src/shop_reports/features/sales/app/sales_report.py':
    "from shop_libs_tabula import sheet\n\n\ndef sales_report() -> str:\n  return sheet(['sales'])\n",
  'packages/reports/src/shop_reports/main.py':
    'from shop_reports.root.wiring import run\n\nrun()\n',
  'packages/reports/src/shop_reports/root/__init__.py': '',
  'packages/reports/src/shop_reports/root/wiring.py':
    "import structlog\n\n\ndef run() -> None:\n  structlog.get_logger().info('reports')\n",
};

// A browser application whose specs are checked by a configuration of their own.
const WEB: Files = {
  'packages/web/bunfig.toml': bunfig,
  'packages/web/package.json': manifestOf({
    dependencies: [
      '@shop/shared',
    ],
    name: '@shop/web',
  }),
  'packages/web/src/__tests__/sandbox.fixtures.ts': sandbox,
  'packages/web/src/features/labels/app/__tests__/label.test.ts': `import { expect, it } from 'bun:test';

import type { OrderId } from '@shop/shared';

import { label } from '../label';

it('should name the order when an order is labelled', () => {
  // Act
  const text = label('a' as OrderId);

  // Assert
  expect(text).toBe('Order order:a');
});
`,
  'packages/web/src/features/labels/app/label.ts': `import { describeOrder, type OrderId } from '@shop/shared';

export const label = (id: OrderId): string => \`Order \${describeOrder({ id, total: 0 })}\`;
`,
  'packages/web/src/features/labels/index.ts': "export { label } from './app/label';\n",
  'packages/web/src/main.ts':
    "import { label } from '#/features/labels';\n\nexport const main = label;\n",
  'packages/web/tsconfig.json': jsonFileOf({
    extends: './tsconfig.src.json',
    files: [],
    include: [],
    references: [
      {
        path: './tsconfig.src.json',
      },
      {
        path: './tsconfig.test.json',
      },
    ],
  }),
  'packages/web/tsconfig.src.json': tsconfigOf({
    exclude: [
      'src/**/__tests__',
    ],
    parts: [
      'self',
      'core',
      'browser',
      'workspace',
    ],
    references: [
      '../../shared',
    ],
  }),
  'packages/web/tsconfig.test.json': jsonFileOf({
    extends: './tsconfig.src.json',
    compilerOptions: {
      types: [
        'bun',
      ],
    },
    include: [
      'src/**/__tests__',
    ],
    exclude: [],
    references: [
      {
        path: './tsconfig.src.json',
      },
    ],
  }),
};

// A NestJS API on the compiler options of its framework, and what the products share.
const API_AND_SHARED: Files = {
  'libs/money/package.json': manifestOf({
    exports: {
      '.': './src/index.ts',
    },
    name: '@shop/libs-money',
  }),
  'libs/money/src/features/currency/domain/value-objects/cents.value-object.ts':
    "export type Cents = number & { readonly __brand: 'Cents' };\n",
  'libs/money/src/features/currency/domain/value-objects/index.ts':
    "export type { Cents } from './cents.value-object';\n",
  'libs/money/src/features/currency/index.ts':
    "export type { Cents } from './domain/value-objects';\n",
  'libs/money/src/index.ts': "export type { Cents } from './features/currency';\n",
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
  'packages/api/src/features/totals/app/__tests__/total-line.test.ts': `import { expect, it } from 'bun:test';

import type { Cents } from '@shop/libs-money';
import type { OrderId } from '@shop/shared';

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
  'packages/api/src/features/totals/app/total-line.ts': `import type { Cents } from '@shop/libs-money';
import { describeOrder, type OrderId } from '@shop/shared';

import { CURRENCY } from '#/kernel';

interface Totalled {
  id: OrderId;
  total: Cents;
}

export const totalLine = (order: Totalled): string => \`\${describeOrder(order)} \${CURRENCY}\`;
`,
  'packages/api/src/features/totals/index.ts': "export { totalLine } from './app/total-line';\n",
  'packages/api/src/kernel/index.ts': "export const CURRENCY = 'EUR';\n",
  'packages/api/src/main.ts':
    "import { totalLine } from './features/totals';\n\nexport const main = totalLine;\n",
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
  'shared/bunfig.toml': bunfig,
  'shared/package.json': manifestOf({
    exports: {
      '.': './src/index.ts',
    },
    name: '@shop/shared',
  }),
  'shared/src/__tests__/sandbox.fixtures.ts': sandbox,
  'shared/src/features/orders/domain/entities/__tests__/order.entity.test.ts': `import { expect, it } from 'bun:test';

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
  'shared/src/features/orders/domain/entities/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './order.entity.ts';\n",
  'shared/src/features/orders/domain/entities/order.entity.ts': `import { ORDER_PREFIX } from '#/kernel/index.ts';

export type OrderId = string & { readonly __brand: 'OrderId' };

export interface Order {
  readonly id: OrderId;
  readonly total: number;
}

export const describeOrder = (order: Order): string => \`\${ORDER_PREFIX}:\${order.id}\`;

export const refundLine = (id: OrderId): string => \`refund of \${ORDER_PREFIX}:\${id}\`;
`,
  'shared/src/features/orders/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './domain/entities/index.ts';\n",
  'shared/src/index.ts':
    "export { describeOrder, type Order, type OrderId, refundLine } from './features/orders/index.ts';\n",
  'shared/src/kernel/constants/index.ts': "export { ORDER_PREFIX } from './order.constants.ts';\n",
  'shared/src/kernel/constants/order.constants.ts': "export const ORDER_PREFIX = 'order';\n",
  'shared/src/kernel/index.ts': "export { ORDER_PREFIX } from './constants/index.ts';\n",
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

// The workspace's root: one workspace for each language, the parts each tool
// joins, and the configuration of each package checked by its own parts.
const WORKSPACE: Files = {
  ...INSTALLED,
  ...EROS,
  ...REPORTS,
  ...WEB,
  ...API_AND_SHARED,
  '.gitignore': [
    readFileSync(join(TEMPLATES, 'core', '.gitignore'), 'utf8'),
    readFileSync(join(TEMPLATES, 'typescript', '.gitignore'), 'utf8'),
  ].join('\n'),
  'biome.json': jsonFileOf({
    extends: [
      './.droneey/constitution/presets/common/biome/self.jsonc',
      './.droneey/constitution/presets/common/biome/git.jsonc',
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
      './.droneey/constitution/presets/common/biome/self.jsonc',
      './.droneey/constitution/presets/common/biome/git.jsonc',
      './.droneey/constitution/presets/typescript/biome/self.jsonc',
    ],
  }),
  'knip.config.mjs': `import core from './${PRESETS}/knip/core.mjs';
import architecture from './${PRESETS}/knip/architecture/core.mjs';

const unit = (entry) => ({ entry: [...core.entry, ...architecture.entry, ...entry], project: core.project });

export default {
  workspaces: {
    '.': { entry: ['scripts/*.ts!'], project: ['scripts/**/*.ts!'] },
    'packages/api': unit([]),
    'packages/web': unit([]),
    'packages/eros/typescript': { ...unit([]), ignoreDependencies: ['@nestjs/common!'] },
    shared: unit([]),
    'libs/money': unit([]),
  },
};
`,
  'package.json': jsonFileOf({
    name: 'shop',
    private: true,
    type: 'module',
    workspaces: [
      'packages/*',
      'packages/*/typescript',
      'libs/*',
      'libs/*/typescript',
      'shared',
    ],
  }),
  'pyproject.toml': [
    '[tool.uv.workspace]',
    'members = ["packages/*/python", "packages/reports", "libs/tabula"]',
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

// Each package's own parts of dependency-cruiser and ls-lint, from its folder.
const cruiserOf = (input: { depth: number; parts: readonly string[] }): string =>
  `export default {\n  extends: ${JSON.stringify(
    input.parts.map(
      (part) => `${'../'.repeat(input.depth)}${PRESETS}/dependency-cruiser/${part}.mjs`,
    ),
  )},\n};\n`;

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

  for (const [path, target] of Object.entries(LINKS)) {
    symlinkSync(target, join(folder, path));
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

export {
  commitBase,
  createWorkspace,
  cruiserOf,
  manifestOf,
  PRESETS,
  PYTHON_PACKAGES,
  REPOSITORY,
  removeWorkspace,
  runTool,
  UNITS,
  write,
};
