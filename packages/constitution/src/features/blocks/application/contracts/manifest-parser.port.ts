import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from '../../domain/manifest/entities';

interface ManifestParser {
  readonly hooks: (json: string) => ManifestRead<HooksManifest>;
  readonly marketplace: (json: string) => ManifestRead<MarketplaceManifest>;
  readonly plugin: (json: string) => ManifestRead<PluginManifest>;
}

export type { ManifestParser };
