import { PATH_SEPARATOR } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';

import type { Constitution } from '../../../../constitution/entities';
import { DocumentPath } from '../../../../constitution/entities';
import type { ManifestReadDetails } from '../../../../manifest/entities';
import { ManifestRead } from '../../../../manifest/entities';
import { RELATIVE_PREFIX, SKILL_FILE_NAME } from '../../../../shared/constants';
import { ReadStatus } from '../../../../shared/entities';
import type { Agent, Skill, SkillFrontMatterRead } from '../../../../skill/entities';
import { SkillField } from '../../../../skill/entities';
import type { Check, CheckInput } from '../check.types';

enum PluginCode {
  ManifestMissing = 'plugin-manifest-missing',
  SkillsDirectoryEmpty = 'skills-directory-without-skills',
  SkillsDirectoryUnlisted = 'skills-directory-unlisted',
  SkillWithoutFile = 'skill-without-skill-file',
  SkillWithoutFrontMatter = 'skill-without-front-matter',
  SkillFrontMatterNotYaml = 'skill-front-matter-not-yaml',
  SkillFieldMissing = 'skill-field-missing',
  AgentWithoutFrontMatter = 'agent-without-front-matter',
  AgentFrontMatterNotYaml = 'agent-front-matter-not-yaml',
  AgentFieldMissing = 'agent-field-missing',
  AgentNameMismatch = 'agent-name-mismatches-file',
  TemplateMissing = 'template-missing',
}

interface PluginDetails {
  readonly [PluginCode.ManifestMissing]: object;
  readonly [PluginCode.SkillsDirectoryEmpty]: {
    readonly directory: string;
  };
  readonly [PluginCode.SkillsDirectoryUnlisted]: {
    readonly directory: string;
  };
  readonly [PluginCode.SkillWithoutFile]: object;
  readonly [PluginCode.SkillWithoutFrontMatter]: object;
  readonly [PluginCode.SkillFrontMatterNotYaml]: {
    readonly reason: string;
  };
  readonly [PluginCode.SkillFieldMissing]: {
    readonly field: SkillField;
  };
  readonly [PluginCode.AgentWithoutFrontMatter]: object;
  readonly [PluginCode.AgentFrontMatterNotYaml]: {
    readonly reason: string;
  };
  readonly [PluginCode.AgentFieldMissing]: {
    readonly field: SkillField;
  };
  readonly [PluginCode.AgentNameMismatch]: {
    readonly file: string;
    readonly name: string;
  };
  readonly [PluginCode.TemplateMissing]: object;
}

type PluginFinding = FindingOf<ManifestReadDetails & PluginDetails>;

// Why: Claude Code scans it whether or not the manifest lists it.
const DEFAULT_SKILLS_FOLDER_PATH = 'skills/';
const SKILL_FOLDER = /^([^./][^/]*)\//;
enum Template {
  Project = 'templates/PROJECT.md',
  Decisions = 'templates/DECISIONS.md',
  Block = 'templates/block/block.md',
  Chapter = 'templates/block/foundation/chapter.md',
  Config = 'templates/constitution.yaml',
}

const listingFindings = (input: {
  declared: readonly string[];
  skills: readonly Skill[];
}): readonly PluginFinding[] => {
  const present = new Set(input.skills.map((skill) => skill.directory));

  return [
    ...input.declared
      .filter((directory) => !present.has(directory))
      .map(
        (directory): PluginFinding => ({
          code: PluginCode.SkillsDirectoryEmpty,
          details: {
            directory,
          },
          path: DocumentPath.Plugin,
        }),
      ),
    ...[
      ...present,
    ]
      .filter((directory) => !input.declared.includes(directory))
      .map(
        (directory): PluginFinding => ({
          code: PluginCode.SkillsDirectoryUnlisted,
          details: {
            directory,
          },
          path: DocumentPath.Plugin,
        }),
      ),
  ];
};

// Why: Claude Code takes a folder directly inside a skills directory for a skill, a hidden one
// aside.
const folderFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
}): readonly PluginFinding[] => {
  const folders = new Set(
    [
      DEFAULT_SKILLS_FOLDER_PATH,
      ...input.declared,
    ].flatMap((directory) =>
      [
        ...input.paths,
      ]
        .filter((path) => path.startsWith(directory))
        .flatMap((path) => {
          const folder = SKILL_FOLDER.exec(path.slice(directory.length))?.[1];

          return folder === undefined
            ? []
            : [
                `${directory}${folder}`,
              ];
        }),
    ),
  );

  return [
    ...folders,
  ]
    .filter((folder) => !input.paths.has(`${folder}${PATH_SEPARATOR}${SKILL_FILE_NAME}`))
    .map(
      (folder): PluginFinding => ({
        code: PluginCode.SkillWithoutFile,
        details: {},
        path: folder,
      }),
    );
};

interface FrontMatterCodes {
  readonly fieldMissing: PluginCode.AgentFieldMissing | PluginCode.SkillFieldMissing;
  readonly missing: PluginCode.AgentWithoutFrontMatter | PluginCode.SkillWithoutFrontMatter;
  readonly notYaml: PluginCode.AgentFrontMatterNotYaml | PluginCode.SkillFrontMatterNotYaml;
}

const SKILL_CODES = {
  fieldMissing: PluginCode.SkillFieldMissing,
  missing: PluginCode.SkillWithoutFrontMatter,
  notYaml: PluginCode.SkillFrontMatterNotYaml,
} as const satisfies FrontMatterCodes;

const AGENT_CODES = {
  fieldMissing: PluginCode.AgentFieldMissing,
  missing: PluginCode.AgentWithoutFrontMatter,
  notYaml: PluginCode.AgentFrontMatterNotYaml,
} as const satisfies FrontMatterCodes;

const frontMatterFindings = (input: {
  codes: FrontMatterCodes;
  frontMatter: SkillFrontMatterRead | undefined;
  path: string;
}): readonly PluginFinding[] => {
  const { codes, frontMatter, path } = input;

  if (frontMatter === undefined) {
    return [
      {
        code: codes.missing,
        details: {},
        path,
      },
    ];
  }

  if (frontMatter.status === ReadStatus.NotYaml) {
    return [
      {
        code: codes.notYaml,
        details: {
          reason: frontMatter.reason,
        },
        path,
      },
    ];
  }

  return Object.values(SkillField)
    .filter((field) => frontMatter[field] === undefined)
    .map(
      (field): PluginFinding => ({
        code: codes.fieldMissing,
        details: {
          field,
        },
        path,
      }),
    );
};

const skillFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
  skills: readonly Skill[];
}): readonly PluginFinding[] => [
  ...listingFindings(input),
  ...folderFindings(input),
  ...input.skills.flatMap((skill) =>
    frontMatterFindings({
      codes: SKILL_CODES,
      frontMatter: skill.frontMatter,
      path: skill.path,
    }),
  ),
];

const agentFindings = (agent: Agent): readonly PluginFinding[] => {
  const { file, frontMatter, path } = agent;
  const name = frontMatter?.status === ReadStatus.Parsed ? frontMatter.name : undefined;

  return [
    ...frontMatterFindings({
      codes: AGENT_CODES,
      frontMatter,
      path,
    }),
    ...(name === undefined || name === file
      ? []
      : [
          {
            code: PluginCode.AgentNameMismatch,
            details: {
              file,
              name,
            },
            path,
          } satisfies PluginFinding,
        ]),
  ];
};

const templateFindings = (paths: ReadonlySet<string>): readonly PluginFinding[] =>
  Object.values(Template)
    .filter((path) => !paths.has(path))
    .map(
      (path): PluginFinding => ({
        code: PluginCode.TemplateMissing,
        details: {},
        path,
      }),
    );

const manifestFindings = (constitution: Constitution): readonly PluginFinding[] => {
  const read = constitution.documents.plugin;

  if (read === undefined) {
    return [
      {
        code: PluginCode.ManifestMissing,
        details: {},
        path: DocumentPath.Plugin,
      },
    ];
  }

  if (read.status !== ReadStatus.Parsed) {
    return ManifestRead.unreadFindings({
      path: DocumentPath.Plugin,
      read,
    });
  }

  return skillFindings({
    declared: read.value.skills.map((directory) => directory.slice(RELATIVE_PREFIX.length)),
    paths: constitution.paths,
    skills: constitution.documents.skills,
  });
};

const pluginCheck: Check<PluginFinding> = ({
  constitution,
}: CheckInput): readonly PluginFinding[] => [
  ...manifestFindings(constitution),
  ...constitution.documents.agents.flatMap(agentFindings),
  ...templateFindings(constitution.paths),
];

export type { PluginDetails };
export { PluginCode, pluginCheck };
