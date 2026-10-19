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

// A file the plugin root or the archive is built without, or a field the
// archive's package.json is written without.
enum Breakage {
  Core = 'blocks/core/core.md',
  Format = 'constitutionFormat',
  Manifest = 'package.json',
  Resolve = 'hooks/lib/resolve.awk',
  Version = 'version',
}

interface PluginRootOptions {
  breakage?: Breakage;
  coreBody?: string;
  // the archive's constitutionFormat, a number unless a case writes it as text
  format?: number | string;
}

const INSTALLED = '1.0.0';
const REPOSITORY = join(import.meta.dir, '..', '..');
// The block format of this repository's release, the one its hooks read, found
// in its package.json as the hook finds it.
const FORMAT = Number(
  /"constitutionFormat"\s*:\s*(\d+)/u.exec(
    readFileSync(join(REPOSITORY, 'package.json'), 'utf8'),
  )?.[1],
);
const HOOKS = 'hooks';
const LIBRARY = 'hooks/lib';

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
  mkdirSync(join(root, LIBRARY), {
    recursive: true,
  });
  for (const name of readdirSync(join(REPOSITORY, HOOKS)).filter((file) => file.endsWith('.sh'))) {
    copyFileSync(join(REPOSITORY, HOOKS, name), join(root, HOOKS, name));
  }

  for (const name of readdirSync(join(REPOSITORY, LIBRARY))) {
    copyFileSync(join(REPOSITORY, LIBRARY, name), join(root, LIBRARY, name));
  }
};

const PLUGIN = 'plugin';
const ARCHIVE = 'archive';
const LINK = '.droneey/constitution';

// The archive a plugin root's hooks are tested with: the release a project pins,
// which mise unpacks and links into the project.
const archiveOf = (root: string): string => join(dirname(root), ARCHIVE);

const writeManifest = (input: {
  folder: string;
  format: number | string | undefined;
  version: boolean;
}): void => {
  writeFileSync(
    join(input.folder, 'package.json'),
    `${JSON.stringify(
      {
        name: '@droneey/constitution',
        private: true,
        ...(input.version
          ? {
              version: INSTALLED,
            }
          : {}),
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

// The plugin brings the hooks; the archive beside it, the blocks and the
// manifest that names their format, as a release packs them.
const createPluginRoot = (options: PluginRootOptions = {}): string => {
  const { breakage, coreBody, format = FORMAT } = options;
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const archive = join(folder, ARCHIVE);

  created.push(folder);
  copyHook(root);
  writeManifest({
    folder: root,
    format: undefined,
    version: true,
  });
  writeFiles({
    files: constitutionFiles(coreBody),
    root: archive,
  });

  if (breakage !== Breakage.Manifest) {
    writeManifest({
      folder: archive,
      format: breakage === Breakage.Format ? undefined : format,
      version: breakage !== Breakage.Version,
    });
  }

  if (breakage === Breakage.Resolve) {
    rmSync(join(root, breakage));
  }

  if (breakage === Breakage.Core) {
    rmSync(join(archive, breakage));
  }

  return root;
};

// The plugin root a release of this repository ships, as far as the hook reads
// it, and the archive beside it: the real blocks and the manifest.
const createRealPluginRoot = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-plugin-'));
  const root = join(folder, PLUGIN);
  const archive = join(folder, ARCHIVE);

  created.push(folder);
  copyHook(root);
  copyFileSync(join(REPOSITORY, 'package.json'), join(root, 'package.json'));
  cpSync(join(REPOSITORY, 'blocks'), join(archive, 'blocks'), {
    recursive: true,
  });
  copyFileSync(join(REPOSITORY, 'package.json'), join(archive, 'package.json'));

  return root;
};

// Links the archive into a project as mise's postinstall does, unless the
// project holds something there already; the project's git ignores the link,
// as a project's .gitignore does.
const linkArchive = (input: { archive: string; project: string }): void => {
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
  symlinkSync(input.archive, link);
};

const removeFolder = (path: string): void => {
  rmSync(path, {
    force: true,
    recursive: true,
  });
};

const LINE_BYTES = 100;

// A body of core's card of exactly `bytes` bytes, in lines of at most 100 with
// their newline and never empty, since the digest drops a blank last line, to put
// the budget's edge where a case needs it.
const coreBodyOfBytes = (bytes: number): string => {
  const lines = Math.ceil(bytes / LINE_BYTES);
  const last = bytes - (lines - 1) * LINE_BYTES;
  const sizes = Array.from(
    {
      length: lines,
    },
    (_, index) => (index < lines - 1 ? LINE_BYTES : last),
  );

  if (last === 1 && lines > 1) {
    sizes[lines - 2] = LINE_BYTES - 1;
    sizes[lines - 1] = 2;
  }

  return sizes.map((size) => `${'x'.repeat(size - 1)}\n`).join('');
};

const removePluginRoots = (): void => {
  for (const root of created.splice(0)) {
    removeFolder(root);
  }
};

export {
  archiveOf,
  Breakage,
  coreBodyOfBytes,
  createPluginRoot,
  createRealPluginRoot,
  FORMAT,
  INSTALLED,
  LINK,
  linkArchive,
  removeFolder,
  removePluginRoots,
};
