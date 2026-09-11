import type { Constitution, Finding, Rule } from '../models';
import {
  hooksManifestSchema,
  marketplaceManifestSchema,
  pluginManifestSchema,
} from '../models';
import { parseManifest } from '../parse-manifest';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';
const SKILL = /^(blocks\/.+\/skills\/)[^/]+\/SKILL\.md$/;
const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;

const missing = (path: string, role: string): Finding => ({
  message: `is missing; the constitution ships as a plugin and needs its ${role}`,
  path,
});

const listed = (
  skills: string | readonly string[] | undefined,
): readonly string[] =>
  (typeof skills === 'string'
    ? [
        skills,
      ]
    : (skills ?? [])
  ).map((directory) => directory.slice('./'.length));

const skillDirectories = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set(
    [
      ...paths,
    ].flatMap((path) => {
      const directory = SKILL.exec(path)?.[1];

      return directory === undefined
        ? []
        : [
            directory,
          ];
    }),
  );

const checkPlugin = (
  constitution: Constitution,
): {
  findings: readonly Finding[];
  name: string | undefined;
} => {
  if (constitution.plugin === undefined) {
    return {
      findings: [
        missing(PLUGIN, 'manifest'),
      ],
      name: undefined,
    };
  }

  const parsed = parseManifest({
    format: 'JSON',
    parse: JSON.parse,
    path: PLUGIN,
    schema: pluginManifestSchema,
    text: constitution.plugin,
  });

  if (parsed.value === undefined) {
    return {
      findings:
        parsed.finding === undefined
          ? []
          : [
              parsed.finding,
            ],
      name: undefined,
    };
  }

  const declared = listed(parsed.value.skills);
  const present = skillDirectories(constitution.paths);

  return {
    findings: [
      ...declared
        .filter((directory) => !present.has(directory))
        .map((directory) => ({
          message: `lists the skills directory "./${directory}", which holds no <skill>/SKILL.md`,
          path: PLUGIN,
        })),
      ...[
        ...present,
      ]
        .filter((directory) => !declared.includes(directory))
        .map((directory) => ({
          message: `does not list "./${directory}", which holds skills`,
          path: PLUGIN,
        })),
    ],
    name: parsed.value.name,
  };
};

const checkMarketplace = (
  constitution: Constitution,
  pluginName: string | undefined,
): readonly Finding[] => {
  if (constitution.marketplace === undefined) {
    return [
      missing(MARKETPLACE, 'marketplace'),
    ];
  }

  const parsed = parseManifest({
    format: 'JSON',
    parse: JSON.parse,
    path: MARKETPLACE,
    schema: marketplaceManifestSchema,
    text: constitution.marketplace,
  });

  if (parsed.value === undefined) {
    return parsed.finding === undefined
      ? []
      : [
          parsed.finding,
        ];
  }

  const entry = parsed.value.plugins.find(
    (plugin) => plugin.name === pluginName && plugin.source === './',
  );

  return entry === undefined
    ? [
        {
          message: `does not list the plugin "${pluginName ?? ''}" with source "./"`,
          path: MARKETPLACE,
        },
      ]
    : [];
};

const checkHooks = (constitution: Constitution): readonly Finding[] => {
  if (constitution.hooks === undefined) {
    return [];
  }

  const parsed = parseManifest({
    format: 'JSON',
    parse: JSON.parse,
    path: HOOKS,
    schema: hooksManifestSchema,
    text: constitution.hooks,
  });

  if (parsed.value === undefined) {
    return parsed.finding === undefined
      ? []
      : [
          parsed.finding,
        ];
  }

  return Object.values(parsed.value.hooks)
    .flat()
    .flatMap((group) => group.hooks)
    .flatMap((hook) => [
      ...(hook.command ?? '').matchAll(PLUGIN_FILE),
    ])
    .map((match) => match[1] ?? '')
    .filter((file) => !constitution.paths.has(file))
    .map((file) => ({
      message: `runs "${file}", which is missing`,
      path: HOOKS,
    }));
};

const pluginRule: Rule = (constitution: Constitution): readonly Finding[] => {
  const plugin = checkPlugin(constitution);

  return [
    ...plugin.findings,
    ...checkMarketplace(constitution, plugin.name),
    ...checkHooks(constitution),
  ];
};

export { pluginRule };
