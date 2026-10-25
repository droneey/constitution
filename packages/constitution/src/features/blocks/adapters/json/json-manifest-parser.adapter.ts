import type { ZodType } from 'zod';

import { syntaxErrorOf } from '#/kernel/utils';

import type { ManifestParser } from '../../domain/contracts';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  MarketplacePlugin,
  PluginManifest,
} from '../../domain/entities';
import { ReadStatus } from '../../domain/entities';
import type { HooksWire, MarketplaceWire, PluginWire } from './models';
import { hooksModel, marketplaceModel, pluginModel } from './models';

const GITHUB = 'github';
const GIT_SUBDIR = 'git-subdir';
// Stryker disable next-line Regex: a git URL holds GitHub's prefix only at its start
const GITHUB_URL = /^https:\/\/github\.com\/|\.git$/g;

type JsonParsed =
  | {
      readonly status: ReadStatus.Parsed;
      readonly value: unknown;
    }
  | {
      readonly reason: string;
      readonly status: ReadStatus.NotJson;
    };

const parseJson = (json: string): JsonParsed => {
  try {
    return {
      status: ReadStatus.Parsed,
      value: JSON.parse(json),
    };
  } catch (error) {
    return {
      // Stryker disable next-line StringLiteral: split always yields a first part
      reason: syntaxErrorOf(error).message.split('\n')[0] ?? '',
      status: ReadStatus.NotJson,
    };
  }
};

const readManifest = <TWire, TManifest>(input: {
  json: string;
  map: (wire: TWire) => TManifest;
  model: ZodType<TWire>;
}): ManifestRead<TManifest> => {
  const parsed = parseJson(input.json);

  if (parsed.status === ReadStatus.NotJson) {
    return parsed;
  }

  const parsing = input.model.safeParse(parsed.value);

  return parsing.success
    ? {
        status: ReadStatus.Parsed,
        value: input.map(parsing.data),
      }
    : {
        issues: parsing.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        status: ReadStatus.Mismatched,
      };
};

// A source that names no ref or repository leaves it out.
const sourceOf = (input: {
  ref: string | undefined;
  repo: string | undefined;
}): Pick<MarketplacePlugin, 'ref' | 'repo'> => ({
  ...(input.ref === undefined
    ? {}
    : {
        ref: input.ref,
      }),
  ...(input.repo === undefined
    ? {}
    : {
        repo: input.repo,
      }),
});

const marketplacePluginOf = (plugin: MarketplaceWire['plugins'][number]): MarketplacePlugin => {
  const { source } = plugin;

  // Stryker disable next-line ConditionalExpression,StringLiteral: a path has no source field either, so the test only narrows the type
  if (typeof source !== 'string' && source.source === GITHUB) {
    return {
      name: plugin.name,
      path: '',
      ...sourceOf({
        ref: source.ref,
        repo: source.repo,
      }),
    };
  }

  // Stryker disable next-line ConditionalExpression,StringLiteral: a path has no source field either, so the test only narrows the type
  return typeof source !== 'string' && source.source === GIT_SUBDIR
    ? {
        name: plugin.name,
        path: source.path ?? '',
        ...sourceOf({
          ref: source.ref,
          repo: source.url?.replaceAll(GITHUB_URL, ''),
        }),
      }
    : {
        name: plugin.name,
        path: '',
      };
};

const createJsonManifestParser = (): ManifestParser => ({
  hooks: (json: string): ManifestRead<HooksManifest> =>
    readManifest({
      json,
      map: (wire: HooksWire): HooksManifest => ({
        commands: Object.values(wire.hooks)
          .flat()
          .flatMap((group) => group.hooks)
          .flatMap((hook) =>
            hook.command === undefined
              ? []
              : [
                  hook.command,
                ],
          ),
      }),
      model: hooksModel,
    }),
  marketplace: (json: string): ManifestRead<MarketplaceManifest> =>
    readManifest({
      json,
      map: (wire: MarketplaceWire): MarketplaceManifest => ({
        plugins: wire.plugins.map((plugin) => marketplacePluginOf(plugin)),
      }),
      model: marketplaceModel,
    }),
  plugin: (json: string): ManifestRead<PluginManifest> =>
    readManifest({
      json,
      map: (wire: PluginWire): PluginManifest => ({
        name: wire.name,
        ...(wire.repository === undefined
          ? {}
          : {
              repository: wire.repository,
            }),
        skills:
          typeof wire.skills === 'string'
            ? [
                wire.skills,
              ]
            : (wire.skills ?? []),
      }),
      model: pluginModel,
    }),
});

export { createJsonManifestParser };
