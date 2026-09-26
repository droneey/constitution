import type { Finding } from '#/kernel';

import { DOCUMENT_PATHS } from '../../../../constants';
import type {
  Constitution,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
} from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

type Unread = Exclude<
  ManifestRead<unknown>,
  {
    status: 'parsed';
  }
>;

const SKILL = /^((?:[^./][^/]*\/)+)[^./][^/]*\/SKILL\.md$/;
const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;
const RELATIVE_PREFIX = './';

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

const skillFindings = (input: {
  declared: readonly string[];
  paths: ReadonlySet<string>;
}): readonly Finding[] => {
  const present = skillDirectories(input.paths);

  return [
    ...input.declared
      .filter((directory) => !present.has(directory))
      .map((directory) => ({
        message: `lists the skills directory "${RELATIVE_PREFIX}${directory}", which holds no <skill>/SKILL.md`,
        path: DOCUMENT_PATHS.plugin,
      })),
    ...[
      ...present,
    ]
      .filter((directory) => !input.declared.includes(directory))
      .map((directory) => ({
        message: `does not list "${RELATIVE_PREFIX}${directory}", which holds skills`,
        path: DOCUMENT_PATHS.plugin,
      })),
  ];
};

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
          path: DOCUMENT_PATHS.plugin,
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
        }),
        name: read.value.name,
      }
    : {
        findings: readFindings({
          path: DOCUMENT_PATHS.plugin,
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
        path: DOCUMENT_PATHS.marketplace,
        role: 'marketplace',
      }),
    ];
  }

  if (input.read.status !== 'parsed') {
    return readFindings({
      path: DOCUMENT_PATHS.marketplace,
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
          path: DOCUMENT_PATHS.marketplace,
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
          path: DOCUMENT_PATHS.hooks,
        }))
    : readFindings({
        path: DOCUMENT_PATHS.hooks,
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
  ];
};

export { pluginCheck };
