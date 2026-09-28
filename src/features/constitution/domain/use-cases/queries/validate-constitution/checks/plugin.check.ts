import type { Finding } from '#/kernel';

import { DocumentPath } from '../../../../constants';
import type {
  Constitution,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  Skill,
} from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

type Unread = Exclude<
  ManifestRead<unknown>,
  {
    status: 'parsed';
  }
>;

const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;
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
  Block = 'templates/block.md',
  Config = 'templates/constitution.yaml',
}

const missing = (input: { path: string; role: string }): Finding => ({
  message: `is missing; the constitution ships as a plugin and needs its ${input.role}`,
  path: input.path,
});

const readFindings = (input: {
  path: string;
  read: Unread;
}): readonly Finding[] => {
  if (input.read.status === 'not-json') {
    return [
      {
        message: `is not valid JSON: ${input.read.reason}`,
        path: input.path,
      },
    ];
  }

  return input.read.issues.map((issue) => ({
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
        message: `lists the skills directory "${RELATIVE_PREFIX}${directory}", which holds no <skill>/SKILL.md`,
        path: DocumentPath.Plugin,
      })),
    ...[
      ...present,
    ]
      .filter((directory) => !input.declared.includes(directory))
      .map((directory) => ({
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
      message: `holds no ${SKILL_FILE}; a skill is a folder with ${SKILL_FILE} in it`,
      path: folder,
    }));
};

const frontMatterFindings = (skill: Skill): readonly Finding[] => {
  const { frontMatter, path } = skill;

  if (frontMatter === undefined) {
    return [
      {
        message:
          'has no front matter; a skill names itself and says when to use it there',
        path,
      },
    ];
  }

  if (frontMatter.status === 'not-yaml') {
    return [
      {
        message: `front matter is not valid YAML: ${frontMatter.reason}`,
        path,
      },
    ];
  }

  return Object.values(SkillField)
    .filter((field) => frontMatter[field] === undefined)
    .map((field) => ({
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

const templateFindings = (paths: ReadonlySet<string>): readonly Finding[] =>
  Object.values(Template)
    .filter((path) => !paths.has(path))
    .map((path) => ({
      message: 'is missing; /ratify writes a project from the templates',
      path,
    }));

const checkPlugin = (
  constitution: Constitution,
): {
  findings: readonly Finding[];
  name: string | undefined;
} => {
  const read = constitution.documents.plugin;

  if (read === undefined) {
    return {
      findings: [
        missing({
          path: DocumentPath.Plugin,
          role: 'manifest',
        }),
      ],
      name: undefined,
    };
  }

  return read.status === 'parsed'
    ? {
        findings: skillFindings({
          declared: read.value.skills.map((directory) =>
            directory.slice(RELATIVE_PREFIX.length),
          ),
          paths: constitution.paths,
          skills: constitution.documents.skills,
        }),
        name: read.value.name,
      }
    : {
        findings: readFindings({
          path: DocumentPath.Plugin,
          read,
        }),
        name: undefined,
      };
};

const checkMarketplace = (input: {
  pluginName: string | undefined;
  read: ManifestRead<MarketplaceManifest> | undefined;
}): readonly Finding[] => {
  if (input.read === undefined) {
    return [
      missing({
        path: DocumentPath.Marketplace,
        role: 'marketplace',
      }),
    ];
  }

  if (input.read.status !== 'parsed') {
    return readFindings({
      path: DocumentPath.Marketplace,
      read: input.read,
    });
  }

  return input.read.value.plugins.some(
    (plugin) => plugin.name === input.pluginName && plugin.source === './',
  )
    ? []
    : [
        {
          message: `does not list the plugin "${input.pluginName ?? ''}" with source "./"`,
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

  return input.read.status === 'parsed'
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
          message: `runs "${file}", which is missing`,
          path: DocumentPath.Hooks,
        }))
    : readFindings({
        path: DocumentPath.Hooks,
        read: input.read,
      });
};

const pluginCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] => {
  const plugin = checkPlugin(constitution);

  return [
    ...plugin.findings,
    ...checkMarketplace({
      pluginName: plugin.name,
      read: constitution.documents.marketplace,
    }),
    ...checkHooks({
      paths: constitution.paths,
      read: constitution.documents.hooks,
    }),
    ...templateFindings(constitution.paths),
  ];
};

export { pluginCheck };
