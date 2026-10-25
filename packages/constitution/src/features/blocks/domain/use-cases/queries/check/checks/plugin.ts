import { RELATIVE_PREFIX, SKILL_FILE } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';

import type {
  Agent,
  Constitution,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  Skill,
} from '../../../../entities';
import { DocumentPath, ReadStatus, SkillField } from '../../../../entities';
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

interface PluginDetails {
  readonly [PluginCode.ManifestMissing]: object;
  readonly [PluginCode.MarketplaceMissing]: object;
  readonly [PluginCode.NotJson]: {
    readonly reason: string;
  };
  readonly [PluginCode.OffSchema]: {
    /** the path of the field the schema refuses, '' for the whole document */
    readonly field: string;
    readonly reason: string;
  };
  readonly [PluginCode.SkillsDirectoryEmpty]: {
    /** as the manifest lists it, without its leading ./ */
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
  readonly [PluginCode.MarketplaceOmitsPlugin]: {
    /** the name the plugin manifest gives, if it gives one */
    readonly plugin?: string;
    /** the owner/name of the GitHub repository the plugin manifest names, if it names one */
    readonly repo?: string;
  };
  readonly [PluginCode.HookFileMissing]: {
    readonly file: string;
  };
}

type PluginFinding = FindingOf<PluginDetails>;

type Unread = Exclude<
  ManifestRead<unknown>,
  {
    readonly status: ReadStatus.Parsed;
  }
>;

const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;
const GITHUB_URL = 'https://github.com/';
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;
// Claude Code scans it whether or not the manifest lists it.
const DEFAULT_SKILLS = 'skills/';
const SKILL_FOLDER = /^([^./][^/]*)\//;
enum Template {
  Project = 'templates/PROJECT.md',
  Decisions = 'templates/DECISIONS.md',
  Block = 'templates/block/block.md',
  Chapter = 'templates/block/foundation/chapter.md',
  Config = 'templates/constitution.yaml',
}

const readFindings = (input: { path: string; read: Unread }): readonly PluginFinding[] => {
  if (input.read.status === ReadStatus.NotJson) {
    return [
      {
        code: PluginCode.NotJson,
        details: {
          reason: input.read.reason,
        },
        path: input.path,
      },
    ];
  }

  return input.read.issues.map(
    (issue): PluginFinding => ({
      code: PluginCode.OffSchema,
      details: {
        field: issue.field,
        reason: issue.message,
      },
      path: input.path,
    }),
  );
};

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

// A folder directly inside a skills directory is a skill, a hidden one aside.
const folderFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
}): readonly PluginFinding[] => {
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
    .map(
      (folder): PluginFinding => ({
        code: PluginCode.SkillWithoutFile,
        details: {},
        path: folder,
      }),
    );
};

const frontMatterFindings = (skill: Skill): readonly PluginFinding[] => {
  const { frontMatter, path } = skill;

  if (frontMatter === undefined) {
    return [
      {
        code: PluginCode.SkillWithoutFrontMatter,
        details: {},
        path,
      },
    ];
  }

  if (frontMatter.status === ReadStatus.NotYaml) {
    return [
      {
        code: PluginCode.SkillFrontMatterNotYaml,
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
        code: PluginCode.SkillFieldMissing,
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
  ...input.skills.flatMap(frontMatterFindings),
];

const agentFindings = (agent: Agent): readonly PluginFinding[] => {
  const { file, frontMatter, path } = agent;

  if (frontMatter === undefined) {
    return [
      {
        code: PluginCode.AgentWithoutFrontMatter,
        details: {},
        path,
      },
    ];
  }

  if (frontMatter.status === ReadStatus.NotYaml) {
    return [
      {
        code: PluginCode.AgentFrontMatterNotYaml,
        details: {
          reason: frontMatter.reason,
        },
        path,
      },
    ];
  }

  const misnamed: readonly PluginFinding[] =
    frontMatter.name === undefined || frontMatter.name === file
      ? []
      : [
          {
            code: PluginCode.AgentNameMismatch,
            details: {
              file,
              name: frontMatter.name,
            },
            path,
          },
        ];

  return [
    ...Object.values(SkillField)
      .filter((field) => frontMatter[field] === undefined)
      .map(
        (field): PluginFinding => ({
          code: PluginCode.AgentFieldMissing,
          details: {
            field,
          },
          path,
        }),
      ),
    ...misnamed,
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

const checkPlugin = (
  constitution: Constitution,
): {
  readonly findings: readonly PluginFinding[];
  readonly name: string | undefined;
  readonly repository: string | undefined;
} => {
  const read = constitution.documents.plugin;

  if (read === undefined) {
    return {
      findings: [
        {
          code: PluginCode.ManifestMissing,
          details: {},
          path: DocumentPath.Plugin,
        },
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
}): readonly PluginFinding[] => {
  if (input.read === undefined) {
    return [
      {
        code: PluginCode.MarketplaceMissing,
        details: {},
        path: DocumentPath.Marketplace,
      },
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
          details: {
            ...(input.pluginName === undefined
              ? {}
              : {
                  plugin: input.pluginName,
                }),
            ...(repo === undefined
              ? {}
              : {
                  repo,
                }),
          },
          path: DocumentPath.Marketplace,
        },
      ];
};

const checkHooks = (input: {
  paths: ReadonlySet<string>;
  read: ManifestRead<HooksManifest> | undefined;
}): readonly PluginFinding[] => {
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
        .map(
          (file): PluginFinding => ({
            code: PluginCode.HookFileMissing,
            details: {
              file,
            },
            path: DocumentPath.Hooks,
          }),
        )
    : readFindings({
        path: DocumentPath.Hooks,
        read: input.read,
      });
};

const pluginCheck: Check<PluginFinding> = ({
  constitution,
}: CheckInput): readonly PluginFinding[] => {
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

export type { PluginDetails };
export { PluginCode, pluginCheck };
