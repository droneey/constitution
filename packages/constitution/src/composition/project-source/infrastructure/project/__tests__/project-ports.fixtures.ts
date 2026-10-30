import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { corePassport, PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { ProjectPorts } from '#/features/project';
import { ManifestReadStatus } from '#/features/project';
import { REQUIRED_CONFIG_KEYS } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';

const CORE_TEXT = '---\nid: core\n---\n\n# core\n';
const CONFIG = 'axes: []\n';
const UNPARSED_CONFIG = 'axes: [\n';
const UNPARSED_LINE = 1;

interface ProjectTreeInput {
  readonly config?: string;
  readonly files?: FakeTree['files'];
}

const projectTreeOf = (input: ProjectTreeInput = {}): FakeTree => ({
  files: {
    [corePassport]: CORE_TEXT,
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [`${PROJECT}/constitution.yaml`]: input.config ?? CONFIG,
    [`${releaseFolderPath}/package.json`]: '{}\n',
    ...input.files,
  },
});

const projectPortsOf = (tree: FakeTree = projectTreeOf()): ProjectPorts => ({
  cardParser: {
    card: () => ({
      governs: [],
      isAbstract: false,
      languages: [],
      requires: [],
    }),
  },
  clock: {
    today: (): Temporal.PlainDate => Temporal.PlainDate.from('2026-06-15'),
  },
  configParser: {
    parse: (text: string) =>
      text === UNPARSED_CONFIG
        ? {
            lines: [
              UNPARSED_LINE,
            ],
            status: ConfigReadStatus.Unparsed,
          }
        : {
            config: {
              empties: [],
              items: [],
              keys: [
                ...REQUIRED_CONFIG_KEYS,
              ],
              overrides: [],
            },
            status: ConfigReadStatus.Parsed,
          },
  },
  files: createFakeProjectFiles(tree),
  manifestParser: {
    parse: () => ({
      manifest: {
        blockFormat: 4,
        version: Version.create('1.0.0'),
      },
      status: ManifestReadStatus.Read,
    }),
  },
  workspace: {
    membersOf: (): readonly UnitPath[] => [],
  },
});

export { CORE_TEXT, projectPortsOf, projectTreeOf, UNPARSED_CONFIG, UNPARSED_LINE };
