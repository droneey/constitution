import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPOSITORY = join(import.meta.dir, '..', '..');

const PARTS = [
  'self',
  'core',
  'bun',
  'nestjs',
];

const SPEC = [
  "import { expect, test } from 'bun:test';",
  '',
  'const seen: string[] = [];',
  '',
  'const mark = (_target: object, key: string, descriptor: PropertyDescriptor): void => {',
  '  seen.push(`${key}:${typeof descriptor.value}`);',
  '};',
  '',
  'class Orders {',
  '  @mark',
  '  public list(): string {',
  "    return 'orders';",
  '  }',
  '}',
  '',
  "test('should decorate the method when the class is declared', () => {",
  "  expect([seen, new Orders().list()]).toStrictEqual([['list:function'], 'orders']);",
  '});',
  '',
].join('\n');

// A NestJS project that takes the presets as an extends array, its options written beside it or not.
const decoratedSpecPasses = (input: { hasOwnOptions: boolean }): boolean => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-nestjs-bun-'));

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  writeFileSync(
    join(folder, 'tsconfig.json'),
    JSON.stringify({
      extends: PARTS.map(
        (part) => `./.droneey/constitution/presets/typescript/tsc/foundation/${part}.json`,
      ),
      compilerOptions: input.hasOwnOptions
        ? {
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
          }
        : {},
    }),
  );
  writeFileSync(join(folder, 'orders.test.ts'), SPEC);

  const run = spawnSync(
    process.execPath,
    [
      'test',
    ],
    {
      cwd: folder,
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return run.status === 0;
};

export { decoratedSpecPasses };
