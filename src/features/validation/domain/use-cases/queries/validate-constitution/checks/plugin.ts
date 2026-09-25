import type { ZodType } from 'zod';
import { z } from 'zod';

import type { Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from '../check.types';

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const HOOKS = 'hooks/hooks.json';
const RELATIVE_DIRECTORY = /^\.\/.*\/$/;
const SKILL = /^((?:[^/]+\/)*)[^/]+\/SKILL\.md$/;
const PLUGIN_FILE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"'\s]+)/g;
const RELATIVE_PREFIX = './';

const pluginManifestSchema = z.looseObject({
  name: z.string().regex(/^[a-z0-9-]+$/),
  skills: z
    .union([
      z.string().regex(RELATIVE_DIRECTORY),
      z.array(z.string().regex(RELATIVE_DIRECTORY)),
    ])
    .optional(),
});

const marketplaceManifestSchema = z.looseObject({
  name: z.string().min(1),
  plugins: z
    .array(
      z.looseObject({
        name: z.string().min(1),
        source: z.string().min(1),
      }),
    )
    .min(1),
});

const hooksManifestSchema = z.looseObject({
  hooks: z.record(
    z.string(),
    z.array(
      z.looseObject({
        hooks: z.array(
          z.looseObject({
            command: z.string().optional(),
          }),
        ),
      }),
    ),
  ),
});

interface JsonParsed<T> {
  finding?: Finding;
  value?: T;
}

const firstLine = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).split('\n')[0] ?? '';

const parseJson = <T>(input: {
  path: string;
  schema: ZodType<T>;
  text: string;
}): JsonParsed<T> => {
  const raw = (() => {
    try {
      return {
        isParsed: true as const,
        value: JSON.parse(input.text) as unknown,
      };
    } catch (error) {
      return {
        error: firstLine(error),
        isParsed: false as const,
      };
    }
  })();

  if (!raw.isParsed) {
    return {
      finding: {
        message: `is not valid JSON: ${raw.error}`,
        path: input.path,
      },
    };
  }

  const result = input.schema.safeParse(raw.value);

  if (!result.success) {
    const issue = result.error.issues[0];

    return {
      finding: {
        message: `does not match its schema: ${issue?.path.join('.') ?? ''}: ${issue?.message ?? ''}`,
        path: input.path,
      },
    };
  }

  return {
    value: result.data,
  };
};

const missing = (input: { path: string; role: string }): Finding => ({
  message: `is missing; the constitution ships as a plugin and needs its ${input.role}`,
  path: input.path,
});

const findingsOf = (parsed: JsonParsed<unknown>): readonly Finding[] =>
  parsed.finding === undefined
    ? []
    : [
        parsed.finding,
      ];

const listed = (
  skills: string | readonly string[] | undefined,
): readonly string[] =>
  (typeof skills === 'string'
    ? [
        skills,
      ]
    : (skills ?? [])
  ).map((directory) => directory.slice(RELATIVE_PREFIX.length));

const skillDirectories = (paths: ReadonlySet<string>): ReadonlySet<string> =>
  new Set(
    [
      ...paths,
    ].flatMap((path) => {
      const directory = SKILL.exec(path)?.[1];

      return directory === undefined || directory === ''
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
  const text = constitution.documents.plugin;

  if (text === undefined) {
    return {
      findings: [
        missing({
          path: PLUGIN,
          role: 'manifest',
        }),
      ],
      name: undefined,
    };
  }

  const parsed = parseJson({
    path: PLUGIN,
    schema: pluginManifestSchema,
    text,
  });

  if (parsed.value === undefined) {
    return {
      findings: findingsOf(parsed),
      name: undefined,
    };
  }

  const declared = listed(parsed.value.skills);
  const present = skillDirectories(constitution.paths);

  return {
    findings: declared
      .filter((directory) => !present.has(directory))
      .map((directory) => ({
        message: `lists the skills directory "./${directory}", which holds no <skill>/SKILL.md`,
        path: PLUGIN,
      })),
    name: parsed.value.name,
  };
};

const checkMarketplace = (input: {
  constitution: Constitution;
  pluginName: string | undefined;
}): readonly Finding[] => {
  const text = input.constitution.documents.marketplace;

  if (text === undefined) {
    return [
      missing({
        path: MARKETPLACE,
        role: 'marketplace',
      }),
    ];
  }

  const parsed = parseJson({
    path: MARKETPLACE,
    schema: marketplaceManifestSchema,
    text,
  });

  if (parsed.value === undefined) {
    return findingsOf(parsed);
  }

  const entry = parsed.value.plugins.find(
    (plugin) => plugin.name === input.pluginName && plugin.source === './',
  );

  return entry === undefined
    ? [
        {
          message: `does not list the plugin "${input.pluginName ?? ''}" with source "./"`,
          path: MARKETPLACE,
        },
      ]
    : [];
};

const checkHooks = (constitution: Constitution): readonly Finding[] => {
  const text = constitution.documents.hooks;

  if (text === undefined) {
    return [];
  }

  const parsed = parseJson({
    path: HOOKS,
    schema: hooksManifestSchema,
    text,
  });

  if (parsed.value === undefined) {
    return findingsOf(parsed);
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

const pluginCheck: Check = (constitution: Constitution): readonly Finding[] => {
  const plugin = checkPlugin(constitution);

  return [
    ...plugin.findings,
    ...checkMarketplace({
      constitution,
      pluginName: plugin.name,
    }),
    ...checkHooks(constitution),
  ];
};

export { pluginCheck };
