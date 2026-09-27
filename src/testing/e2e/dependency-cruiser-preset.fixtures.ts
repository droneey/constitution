import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Report {
  summary: {
    totalCruised: number;
    violations: readonly {
      rule: {
        name: string;
      };
    }[];
  };
}

interface Project {
  files: Readonly<Record<string, string>>;
}

interface Cruise {
  cruised: number;
  violations: readonly string[];
}

const REPOSITORY = join(import.meta.dir, '..', '..', '..');
const DEPCRUISE = join(REPOSITORY, 'node_modules', '.bin', 'depcruise');

// The options devkit's hygiene preset gives a repository; this spec takes the
// layer set alone, so it states them itself.
const CONFIG = `export default {
  extends: './.constitution/presets/dependency-cruiser/base.mjs',
  options: {
    parser: 'swc',
    builtInModules: { add: ['bun', 'bun:test'] },
    doNotFollow: { path: ['node_modules'] },
  },
};
`;

// What the real dependency-cruiser reports over a small project that links
// this repository as .constitution, where mise unpacks its release archive,
// and extends the layer set by path, as a consumer does.
const cruise = (project: Project): Cruise => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-depcruise-'));
  const files = {
    ...project.files,
    '.dependency-cruiser.mjs': CONFIG,
    'package.json': '{"name":"fixture","type":"module"}',
  };

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  symlinkSync(REPOSITORY, join(folder, '.constitution'));

  const cruising = spawnSync(
    DEPCRUISE,
    [
      'src',
      '--config',
      '.dependency-cruiser.mjs',
      '--output-type',
      'json',
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

  const report = JSON.parse(cruising.stdout) as Report;

  return {
    cruised: report.summary.totalCruised,
    violations: [
      ...new Set(report.summary.violations.map(({ rule }) => rule.name)),
    ],
  };
};

export type { Cruise, Project };
export { cruise };
