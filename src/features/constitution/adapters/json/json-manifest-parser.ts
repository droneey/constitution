import type { ZodType } from 'zod';

import type { ManifestParser } from '../../domain/contracts';
import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from '../../domain/entities';
import type { HooksWire, MarketplaceWire, PluginWire } from './models';
import { hooksModel, marketplaceModel, pluginModel } from './models';

type JsonParsed =
  | {
      isParsed: true;
      value: unknown;
    }
  | {
      isParsed: false;
      reason: string;
    };

const parseJson = (json: string): JsonParsed => {
  try {
    return {
      isParsed: true,
      value: JSON.parse(json),
    };
  } catch (error) {
    return {
      isParsed: false,
      reason:
        (error instanceof Error ? error.message : String(error)).split(
          '\n',
        )[0] ?? '',
    };
  }
};

const readManifest = <TWire, TManifest>(input: {
  json: string;
  map: (wire: TWire) => TManifest;
  model: ZodType<TWire>;
}): ManifestRead<TManifest> => {
  const parsed = parseJson(input.json);

  if (!parsed.isParsed) {
    return {
      reason: parsed.reason,
      status: 'not-json',
    };
  }

  const result = input.model.safeParse(parsed.value);

  return result.success
    ? {
        status: 'parsed',
        value: input.map(result.data),
      }
    : {
        issues: result.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        status: 'mismatched',
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
        plugins: wire.plugins.map((plugin) => ({
          name: plugin.name,
          source: plugin.source,
        })),
      }),
      model: marketplaceModel,
    }),
  plugin: (json: string): ManifestRead<PluginManifest> =>
    readManifest({
      json,
      map: (wire: PluginWire): PluginManifest => ({
        name: wire.name,
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
