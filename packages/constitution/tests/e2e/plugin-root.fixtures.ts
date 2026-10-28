import {
  copyFileSync,
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { Files } from './constitution.fixtures';
import { constitutionFiles } from './constitution.fixtures';

// A file the distribution is built without.
enum Breakage {
  Manifest = 'package.json',
}

interface PluginRootOptions {
  breakage?: Breakage;
}

const INSTALLED = '1.0.0';
const repository = join(import.meta.dir, '..', '..');
// The block format of this repository's release, the one its hooks read, found
// in its package.json as the hook finds it.
const releaseFormat = Number(
  /"constitutionFormat"\s*:\s*(\d+)/u.exec(
    readFileSync(join(repository, 'package.json'), 'utf8'),
  )?.[1],
);
const HOOKS = 'hooks';

const created: string[] = [];

const writeFiles = (input: { files: Readonly<Files>; root: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.root, path)), {
      recursive: true,
    });
    writeFileSync(join(input.root, path), text);
  }
};

const copyHook = (root: string): void => {
  mkdirSync(join(root, HOOKS), {
    recursive: true,
  });

  for (const name of readdirSync(join(repository, HOOKS)).filter((file) => file.endsWith('.sh'))) {
    copyFileSync(join(repository, HOOKS, name), join(root, HOOKS, name));
  }
};

const PLUGIN = 'plugin';
const DISTRIBUTION = 'distribution';
const LINK = '.droneey/constitution';

// The distribution a plugin root's hooks are tested with: the release a project pins,
// which mise unpacks and links into the project.
const distributionOf = (root: string): string => join(dirname(root), DISTRIBUTION);

const writeManifest = (input: { folder: string; format: number | undefined }): void => {
  writeFileSync(
    join(input.folder, 'package.json'),
    `${JSON.stringify(
      {
        name: '@droneey/constitution',
        private: true,
        version: INSTALLED,
        ...(input.format === undefined
          ? {}
          : {
              constitutionFormat: input.format,
            }),
      },
      undefined,
      2,
    )}\n`,
  );
};

// The plugin brings the hooks; the distribution beside it, the blocks and the
// manifest that names their format, as a release packs them.
const createPluginRoot = (options: PluginRootOptions = {}): string => {
  const { breakage } = options;
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const distribution = join(folder, DISTRIBUTION);

  created.push(folder);
  copyHook(root);
  writeManifest({
    folder: root,
    format: undefined,
  });
  writeFiles({
    files: constitutionFiles(),
    root: distribution,
  });

  if (breakage !== Breakage.Manifest) {
    writeManifest({
      folder: distribution,
      format: releaseFormat,
    });
  }

  return root;
};

// The plugin root a release of this repository ships, as far as the hook reads
// it, and the distribution beside it: the real blocks and the manifest.
const createRealPluginRoot = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const distribution = join(folder, DISTRIBUTION);

  created.push(folder);
  copyHook(root);
  copyFileSync(join(repository, 'package.json'), join(root, 'package.json'));
  cpSync(join(repository, 'blocks'), join(distribution, 'blocks'), {
    recursive: true,
  });
  copyFileSync(join(repository, 'package.json'), join(distribution, 'package.json'));

  return root;
};

interface DistributionLink {
  readonly distribution: string;
  readonly project: string;
}

// Links the distribution into a project as mise's postinstall does, unless the
// project holds something there already; the project's git ignores the link,
// as a project's .gitignore does.
const linkDistribution = (input: DistributionLink): void => {
  const link = join(input.project, LINK);

  if (
    lstatSync(link, {
      throwIfNoEntry: false,
    }) !== undefined
  ) {
    return;
  }

  mkdirSync(dirname(link), {
    recursive: true,
  });
  writeFileSync(join(dirname(link), '.gitignore'), '*\n');
  symlinkSync(input.distribution, link);
};

const removeFolder = (path: string): void => {
  rmSync(path, {
    force: true,
    recursive: true,
  });
};

const removePluginRoots = (): void => {
  for (const root of created.splice(0)) {
    removeFolder(root);
  }
};

export {
  Breakage,
  createPluginRoot,
  createRealPluginRoot,
  distributionOf,
  INSTALLED,
  LINK,
  linkDistribution,
  removeFolder,
  removePluginRoots,
};
