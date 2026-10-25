import type { Finding } from '#/kernel/types';

import type {
  Agent,
  Constitution,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  Skill,
} from '../../../../entities';
import { DocumentPath, ReadStatus } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum PluginCode {
  ManifestMissing = 'plugin-manifest-missing',
  MarketplaceMissing = 'marketplace-missing',
  NotJson = 'manifest-not-json',
  OffSchema = 'manifest-off-schema',
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
  MarketplaceOmitsPlugin = 'marketplace-omits-plugin',
  HookFileMissing = 'hook-runs-missing-file',
}

type Unread = Exclude<
  ManifestRead<unknown>,
  {
    readonly status: ReadStatus.Parsed;
  }
>;

const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;
const GITHUB_URL = 'https://github.com/';
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;
const RELATIVE_PREFIX = './';
// Claude Code scans it whether or not the manifest lists it.
const DEFAULT_SKILLS = 'skills/';
const SKILL_FILE = 'SKILL.md';
const SKILL_FOLDER = /^([^./][^/]*)\//;
enum SkillField {
  Name = 'name',
  Description = 'description',
}

enum Template {
  Project = 'templates/PROJECT.md',
  Decisions = 'templates/DECISIONS.md',
  Block = 'templates/block/block.md',
  Chapter = 'templates/block/foundation/chapter.md',
  Config = 'templates/constitution.yaml',
}

const missing = (input: { code: PluginCode; path: string; role: string }): Finding => ({
  code: input.code,
  message: `is missing; the Constitution ships as a plugin and needs its ${input.role}`,
  path: input.path,
});

const readFindings = (input: { path: string; read: Unread }): readonly Finding[] => {
  if (input.read.status === ReadStatus.NotJson) {
    return [
      {
        code: PluginCode.NotJson,
        message: `is not valid JSON: ${input.read.reason}`,
        path: input.path,
      },
    ];
  }

  return input.read.issues.map((issue) => ({
    code: PluginCode.OffSchema,
    message: `does not match its schema: ${issue.field === '' ? '<root>' : issue.field}: ${issue.message}`,
    path: input.path,
  }));
};

const listingFindings = (input: {
  declared: readonly string[];
  skills: readonly Skill[];
}): readonly Finding[] => {
  const present = new Set(input.skills.map((skill) => skill.directory));

  return [
    ...input.declared
      .filter((directory) => !present.has(directory))
      .map((directory) => ({
        code: PluginCode.SkillsDirectoryEmpty,
        message: `lists the skills directory "${RELATIVE_PREFIX}${directory}", which holds no <skill>/SKILL.md`,
        path: DocumentPath.Plugin,
      })),
    ...[
      ...present,
    ]
      .filter((directory) => !input.declared.includes(directory))
      .map((directory) => ({
        code: PluginCode.SkillsDirectoryUnlisted,
        message: `does not list "${RELATIVE_PREFIX}${directory}", which holds skills`,
        path: DocumentPath.Plugin,
      })),
  ];
};

// A folder directly inside a skills directory is a skill, a hidden one aside.
const folderFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
}): readonly Finding[] => {
  const folders = new Set(
    [
      DEFAULT_SKILLS,
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
    .filter((folder) => !input.paths.has(`${folder}/${SKILL_FILE}`))
    .map((folder) => ({
      code: PluginCode.SkillWithoutFile,
      message: `holds no ${SKILL_FILE}; a skill is a folder with ${SKILL_FILE} in it`,
      path: folder,
    }));
};

const frontMatterFindings = (skill: Skill): readonly Finding[] => {
  const { frontMatter, path } = skill;

  if (frontMatter === undefined) {
    return [
      {
        code: PluginCode.SkillWithoutFrontMatter,
        message: 'has no front matter; a skill names itself and says when to use it there',
        path,
      },
    ];
  }

  if (frontMatter.status === ReadStatus.NotYaml) {
    return [
      {
        code: PluginCode.SkillFrontMatterNotYaml,
        message: `front matter is not valid YAML: ${frontMatter.reason}`,
        path,
      },
    ];
  }

  return Object.values(SkillField)
    .filter((field) => frontMatter[field] === undefined)
    .map((field) => ({
      code: PluginCode.SkillFieldMissing,
      message: `front matter lacks "${field}"; a skill declares its name and description`,
      path,
    }));
};

const skillFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
  skills: readonly Skill[];
}): readonly Finding[] => [
  ...listingFindings(input),
  ...folderFindings(input),
  ...input.skills.flatMap(frontMatterFindings),
];

const agentFindings = (agent: Agent): readonly Finding[] => {
  const { file, frontMatter, path } = agent;

  if (frontMatter === undefined) {
    return [
      {
        code: PluginCode.AgentWithoutFrontMatter,
        message: 'has no front matter; an agent names itself and says when to use it there',
        path,
      },
    ];
  }

  if (frontMatter.status === ReadStatus.NotYaml) {
    return [
      {
        code: PluginCode.AgentFrontMatterNotYaml,
        message: `front matter is not valid YAML: ${frontMatter.reason}`,
        path,
      },
    ];
  }

  return [
    ...Object.values(SkillField)
      .filter((field) => frontMatter[field] === undefined)
      .map((field) => ({
        code: PluginCode.AgentFieldMissing,
        message: `front matter lacks "${field}"; an agent declares its name and description`,
        path,
      })),
    ...(frontMatter.name === undefined || frontMatter.name === file
      ? []
      : [
          {
            code: PluginCode.AgentNameMismatch,
            message: `is named "${frontMatter.name}" in its front matter; an agent is named after its file, ${file}`,
            path,
          },
        ]),
  ];
};

const templateFindings = (paths: ReadonlySet<string>): readonly Finding[] =>
  Object.values(Template)
    .filter((path) => !paths.has(path))
    .map((path) => ({
      code: PluginCode.TemplateMissing,
      message: 'is missing; /ratify writes a project from the templates',
      path,
    }));

const checkPlugin = (
  constitution: Constitution,
): {
  readonly findings: readonly Finding[];
  readonly name: string | undefined;
  readonly repository: string | undefined;
} => {
  const read = constitution.documents.plugin;

  if (read === undefined) {
    return {
      findings: [
        missing({
          code: PluginCode.ManifestMissing,
          path: DocumentPath.Plugin,
          role: 'manifest',
        }),
      ],
      name: undefined,
      repository: undefined,
    };
  }

  return read.status === ReadStatus.Parsed
    ? {
        findings: skillFindings({
          declared: read.value.skills.map((directory) => directory.slice(RELATIVE_PREFIX.length)),
          paths: constitution.paths,
          skills: constitution.documents.skills,
        }),
        name: read.value.name,
        repository: read.value.repository,
      }
    : {
        findings: readFindings({
          path: DocumentPath.Plugin,
          read,
        }),
        name: undefined,
        repository: undefined,
      };
};

const checkMarketplace = (input: {
  pluginName: string | undefined;
  read: ManifestRead<MarketplaceManifest> | undefined;
  repository: string | undefined;
  repositoryPaths: ReadonlySet<string>;
}): readonly Finding[] => {
  if (input.read === undefined) {
    return [
      missing({
        code: PluginCode.MarketplaceMissing,
        path: DocumentPath.Marketplace,
        role: 'marketplace',
      }),
    ];
  }

  if (input.read.status !== ReadStatus.Parsed) {
    return readFindings({
      path: DocumentPath.Marketplace,
      read: input.read,
    });
  }

  const repo = input.repository?.startsWith(GITHUB_URL)
    ? input.repository.slice(GITHUB_URL.length)
    : undefined;

  return input.read.value.plugins.some(
    (plugin) =>
      plugin.name === input.pluginName &&
      repo !== undefined &&
      plugin.repo === repo &&
      // Stryker disable next-line StringLiteral: no text in place of a missing ref is a release tag
      RELEASE_TAG.test(plugin.ref ?? '') &&
      input.repositoryPaths.has(
        plugin.path === '' ? DocumentPath.Plugin : `${plugin.path}/${DocumentPath.Plugin}`,
      ),
  )
    ? []
    : [
        {
          code: PluginCode.MarketplaceOmitsPlugin,
          message: `does not list the plugin "${input.pluginName ?? ''}" from the GitHub repository its manifest names (${repo ?? 'none'}), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest`,
          path: DocumentPath.Marketplace,
        },
      ];
};

const checkHooks = (input: {
  paths: ReadonlySet<string>;
  read: ManifestRead<HooksManifest> | undefined;
}): readonly Finding[] => {
  if (input.read === undefined) {
    return [];
  }

  return input.read.status === ReadStatus.Parsed
    ? input.read.value.commands
        .flatMap((command) => [
          ...command.matchAll(PLUGIN_FILE),
        ])
        .map(
          (match) =>
            // Stryker disable next-line StringLiteral: the group captures on every match
            match[1] ?? '',
        )
        .filter((file) => !input.paths.has(file))
        .map((file) => ({
          code: PluginCode.HookFileMissing,
          message: `runs "${file}", which is missing`,
          path: DocumentPath.Hooks,
        }))
    : readFindings({
        path: DocumentPath.Hooks,
        read: input.read,
      });
};

const pluginCheck: Check = ({ constitution }: CheckInput): readonly Finding[] => {
  const plugin = checkPlugin(constitution);

  return [
    ...plugin.findings,
    ...checkMarketplace({
      pluginName: plugin.name,
      read: constitution.documents.marketplace,
      repository: plugin.repository,
      repositoryPaths: constitution.repositoryPaths,
    }),
    ...checkHooks({
      paths: constitution.paths,
      read: constitution.documents.hooks,
    }),
    ...constitution.documents.agents.flatMap(agentFindings),
    ...templateFindings(constitution.paths),
  ];
};

export { pluginCheck };
