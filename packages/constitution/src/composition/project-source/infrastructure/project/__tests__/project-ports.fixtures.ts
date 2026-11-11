import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { corePassport, PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { PresetFileReadStatus } from '#/features/presets';
import type { ProjectPorts } from '#/features/project';
import { ManifestReadStatus } from '#/features/project';
import { REQUIRED_CONFIG_KEYS } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';

import type { GateRulesPorts } from '../gate-rules.utils';

const chapterPath = `${releaseFolderPath}/blocks/core/@foundation/names.md`;
const chapterText = [
  '# Names',
  '',
  '## Vocabulary',
  '',
  'A **name** is what a thing is called.',
  '',
  '## General',
  '',
  '### name-reveals-intent · MUST',
  '',
  'A name says what the thing is for.',
  '',
  '#### Why',
  '',
  'a reader learns it from the name.',
  '',
  '#### Examples',
  '',
  '```ts title="Prefer"',
  '### not-a-rule · MUST',
  '```',
  '',
  '### name-reveals-more → name-reveals-intent',
  '',
  'A name says more.',
  '',
  '#### Why',
  '',
  'more is clearer.',
  '',
  '#### Examples',
  '',
  '```ts title="Prefer"',
  'const more = 1;',
  '```',
  '',
].join('\n');

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
        blockFormat: 5,
        version: Version.create('1.0.0'),
      },
      status: ManifestReadStatus.Read,
    }),
  },
  workspace: {
    membersOf: (): readonly UnitPath[] => [],
  },
});

const gateRulesPortsOf = (ports: ProjectPorts = projectPortsOf()): GateRulesPorts => ({
  ...ports,
  presetFiles: {
    parse: () => ({
      status: PresetFileReadStatus.Unparsed,
    }),
  },
});

export {
  CORE_TEXT,
  chapterPath,
  chapterText,
  gateRulesPortsOf,
  projectPortsOf,
  projectTreeOf,
  UNPARSED_CONFIG,
  UNPARSED_LINE,
};
