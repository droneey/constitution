import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Manifest {
  dependencies?: Readonly<Record<string, string>>;
  devDependencies?: Readonly<Record<string, string>>;
  name: string;
  peerDependencies?: Readonly<Record<string, string>>;
  version: string;
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const SYNCPACK = join(REPOSITORY, 'node_modules', '.bin', 'syncpack');

const CONFIG = `import bun from './.droneey/constitution/presets/typescript/syncpack/foundation/bun.mjs';
import packageDependencies from './.droneey/constitution/presets/typescript/syncpack/foundation/package.mjs';
import self from './.droneey/constitution/presets/typescript/syncpack/foundation/self.mjs';
import typescript from './.droneey/constitution/presets/typescript/syncpack/foundation/typescript.mjs';
import packageVersions from './.droneey/constitution/presets/typescript/syncpack/workflow/package.mjs';

export default {
  ...self,
  ...typescript,
  customTypes: packageVersions.customTypes,
  versionGroups: [
    ...packageVersions.versionGroups,
    ...bun.versionGroups,
    ...packageDependencies.versionGroups,
  ],
};
`;

const workspace = (packages: readonly Manifest[]): Readonly<Record<string, Manifest | object>> => ({
  'package.json': {
    name: 'root',
    private: true,
    version: '1.0.0',
    workspaces: [
      'packages/*',
    ],
  },
  ...Object.fromEntries(
    packages.map((manifest) => [
      `packages/${manifest.name}/package.json`,
      manifest,
    ]),
  ),
});

const versionIssues = (packages: readonly Manifest[]): readonly string[] => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-syncpack-'));

  for (const [path, manifest] of Object.entries(workspace(packages))) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), JSON.stringify(manifest));
  }
  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  writeFileSync(join(folder, '.syncpackrc.mjs'), CONFIG);

  const linting = spawnSync(
    SYNCPACK,
    [
      'lint',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return [
    ...new Set(
      [
        ...`${linting.stdout}${linting.stderr}`.matchAll(/✘ [^(]*\((\w+)\)/g),
      ].map(([, kind]) => kind ?? ''),
    ),
  ];
};

export { versionIssues };
