import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

type Files = Readonly<Record<string, string>>;

const REPOSITORY = join(import.meta.dir, '..', '..');

// A package laid out as the python block lays it out, with the constitution
// linked where a project links it.
const SHOP_PACKAGE: Files = {
  'src/shop/__init__.py': '',
};

// The callback runs in a temporary project, which is removed after it,
// whatever it returns or throws.
const inPythonProject = <TResult>(input: {
  files: Files;
  run: (folder: string) => TResult;
}): TResult => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-python-'));

  try {
    mkdirSync(join(folder, '.droneey'));
    symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));

    for (const [path, text] of Object.entries({
      ...SHOP_PACKAGE,
      ...input.files,
    })) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), text);
    }

    return input.run(folder);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export type { Files };
export { inPythonProject, REPOSITORY };
