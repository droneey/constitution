import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/** entered from its site's folder, as the build enters it */
interface TemporaryRepository {
  /** goes back to the folder the case started in and removes the repository */
  leave: () => void;
  root: string;
}

export const enterRepository = (input: {
  files?: Readonly<Record<string, string>>;
  folders?: readonly string[];
}): TemporaryRepository => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-')));
  const started = process.cwd();

  for (const folder of [
    'apps/docs',
    ...(input.folders ?? []),
  ]) {
    mkdirSync(join(root, folder), {
      recursive: true,
    });
  }
  for (const [path, text] of Object.entries(input.files ?? {})) {
    mkdirSync(dirname(join(root, path)), {
      recursive: true,
    });
    writeFileSync(join(root, path), text);
  }
  process.chdir(join(root, 'apps/docs'));

  return {
    leave: (): void => {
      process.chdir(started);
      rmSync(root, {
        force: true,
        recursive: true,
      });
    },
    root,
  };
};
