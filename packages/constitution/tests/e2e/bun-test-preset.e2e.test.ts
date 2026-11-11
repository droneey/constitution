import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { appliedUnit } from './applied-unit.fixtures';
import { BunConfig, bunTestRun, specOf } from './bun-test-preset.fixtures';

const passing = specOf("test('should hold when run', () => {\n  expect(true).toBeTrue();\n});");
const failing = specOf("test('should fail when run', () => {\n  expect(false).toBeTrue();\n});");
// Why: the DOM preload records the socket it finds, which the sandbox replaces once it has run.
const DOM_PRELOAD =
  "Reflect.set(globalThis, 'connectSeenByTheDom', Bun.connect.name);\n\nexport {};\n";
const ORDER =
  'export const total = (price: number, tax: number): number => price + tax;\n\nexport const half = (value: number): number => value / 2;\n';
const totalSpec = specOf(
  "import { total } from '../order';\n\ntest('should add the tax when both are set', () => {\n  expect(total(10, 2)).toBe(12);\n});",
);

describe("the configuration Bun's test runner's presets write", () => {
  it.each(Object.values(BunConfig))(
    'should load %s in Bun when a unit follows every block its test runner is configured for',
    async (config) => {
      // Act
      const run = await bunTestRun({
        config,
        files: {
          'src/__tests__/hold.test.ts': passing,
        },
      });

      // Assert
      expect(run.status).toBe(0);
    },
  );

  // Why: Bun takes a key of its bunfig.toml it does not know without a word, so each setting of the
  // test runner the presets write has a run it must change.
  it.each([
    BunConfig.Unit,
    BunConfig.Mutation,
  ])(
    'should run the specs after the sandbox the presets preload when they run by %s',
    async (config) => {
      // Act
      const run = await bunTestRun({
        config,
        files: {
          'src/__tests__/sandbox.test.ts': specOf(
            "test('should refuse a socket when the sandbox is preloaded', () => {\n  expect(Bun.connect.name).toBe('refuseNetwork');\n});",
          ),
        },
      });

      // Assert
      expect(run.status).toBe(0);
    },
  );

  it.each(Object.values(BunConfig))(
    'should load the DOM preload before the sandbox when the specs run by %s',
    async (config) => {
      // Act
      const run = await bunTestRun({
        config,
        files: {
          'src/__tests__/dom.fixtures.ts': DOM_PRELOAD,
          'src/__tests__/dom.test.ts': specOf(
            "test('should find the socket untouched when the DOM preload ran', () => {\n  expect(Reflect.get(globalThis, 'connectSeenByTheDom')).toBe('connect');\n});",
          ),
        },
      });

      // Assert
      expect(run.status).toBe(0);
    },
  );

  it("should write the DOM preload when a unit runs browser code without React's DOM renderer", () => {
    // Act
    const folder = appliedUnit({
      blocks: [
        'bun-test',
        'client/browser',
        'typescript',
      ],
    });

    // Assert
    expect(existsSync(join(folder, 'src/__tests__/dom.fixtures.ts'))).toBe(true);
  });

  it.each(Object.values(BunConfig))(
    'should leave the environment file unread when the specs run by %s',
    async (config) => {
      // Act
      const run = await bunTestRun({
        config,
        files: {
          '.env': 'ORDER_TOKEN=loaded\n',
          'src/__tests__/env.test.ts': specOf(
            "test('should find no variable of the environment file when it runs', () => {\n  expect(process.env['ORDER_TOKEN']).toBeUndefined();\n});",
          ),
        },
      });

      // Assert
      expect(run.status).toBe(0);
    },
  );

  it('should run the specs in an order drawn from a seed when they run as units', async () => {
    // Act
    const run = await bunTestRun({
      config: BunConfig.Unit,
      files: {
        'src/__tests__/hold.test.ts': passing,
      },
    });

    // Assert
    expect(run.stderr).toContain('--seed=');
  });

  it.each([
    {
      condition: 'the end-to-end suite fails and the specs run as units',
      config: BunConfig.Unit,
      failing: 'tests/e2e/fail.test.ts',
    },
    {
      condition: 'an integration spec fails and the specs run as units',
      config: BunConfig.Unit,
      failing: 'src/__tests__/fail.integration.test.ts',
    },
    {
      condition: 'the end-to-end suite fails and the specs run under mutation',
      config: BunConfig.Mutation,
      failing: 'tests/e2e/fail.test.ts',
    },
  ])('should leave the failing spec out when $condition', async ({ config, failing: path }) => {
    // Act
    const run = await bunTestRun({
      config,
      files: {
        'src/__tests__/hold.test.ts': passing,
        [path]: failing,
      },
    });

    // Assert
    expect(run.status).toBe(0);
  });

  it.each([
    {
      condition: 'a function the specs load is never called',
      config: BunConfig.Integration,
      files: {
        'src/__tests__/order.test.ts': totalSpec,
        'src/order.ts': ORDER,
      },
      status: 1,
    },
    {
      condition: 'a function the specs load is never called and the specs run under mutation',
      config: BunConfig.Mutation,
      files: {
        'src/__tests__/order.test.ts': totalSpec,
        'src/order.ts': ORDER,
      },
      status: 0,
    },
    {
      condition: 'the function never called lies in generated code, which coverage leaves out',
      config: BunConfig.Integration,
      files: {
        'src/__tests__/order.test.ts': specOf(
          "import { total } from '../order';\nimport { half } from '../order.gen';\n\ntest('should add the tax when both are set', () => {\n  expect(total(10, 2)).toBe(12);\n  expect(half).toBeFunction();\n});",
        ),
        'src/order.gen.ts': 'export const half = (value: number): number => value / 2;\n',
        'src/order.ts':
          'export const total = (price: number, tax: number): number => price + tax;\n',
      },
      status: 0,
    },
  ])(
    'should end the run by $config with $status when $condition',
    async ({ config, files, status }) => {
      // Act
      const run = await bunTestRun({
        config,
        files,
      });

      // Assert
      expect(run.status).toBe(status);
    },
  );
});
