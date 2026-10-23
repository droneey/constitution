import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  ARCHIVE,
  CORE,
  parsers,
  passportOf,
  projectTreeOf,
} from '../../../../../__tests__/project.fixtures';
import type { FakeTree } from '../../../../../__tests__/project-files.fake';
import { createFakeProjectFiles } from '../../../../../__tests__/project-files.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ProjectFiles } from '../../../../contracts';
import type { DigestPorts } from '../digest-session.use-case';

// A constitution.yaml that names every key and no block beyond core, so it gives no warning.
const QUIET_CONFIG = [
  'axes: [architecture, workflow]',
  'domains: []',
  'platforms: []',
  'languages: []',
  'implementations: []',
  'packages: {}',
  'packs: []',
  'overrides: []',
  'check: bun run check',
  '',
].join('\n');

// A project whose release holds core with its front matter, and whose constitution.yaml is config.
const sessionTreeOf = (input: { config?: string } = {}): FakeTree =>
  projectTreeOf({
    config: input.config ?? QUIET_CONFIG,
    files: {
      [CORE]: passportOf({
        id: 'core',
      }),
    },
  });

// The files of a project whose release cannot list its presets, so its wiring cannot be checked.
const uncheckableFilesOf = (tree: FakeTree): ProjectFiles => {
  const files = createFakeProjectFiles(tree);

  return {
    ...files,
    listFiles: (folder: string): readonly string[] | undefined => {
      if (folder === `${ARCHIVE}/presets`) {
        throw new Error(`cannot list ${folder}`);
      }

      return files.listFiles(folder);
    },
  };
};

// The ports a session's digest reads through: the real parsers, a clock, the files given and a
// clean working tree.
const sessionPortsOf = (files: ProjectFiles): DigestPorts => ({
  ...parsers(),
  clock: createFakeClock('2026-06-15'),
  files,
  workingTree: createFakeWorkingTree(),
});

export { QUIET_CONFIG, sessionPortsOf, sessionTreeOf, uncheckableFilesOf };
