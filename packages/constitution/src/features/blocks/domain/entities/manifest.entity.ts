import type { FieldIssue, ReadStatus } from './document-read.entity';

interface PluginManifest {
  readonly name: string;
  readonly repository?: string;
  readonly skills: readonly string[];
}

interface MarketplacePlugin {
  readonly name: string;
  /** the folder of the repository that holds the plugin, '' for its root */
  readonly path: string;
  readonly ref?: string;
  readonly repo?: string;
}

interface MarketplaceManifest {
  readonly plugins: readonly MarketplacePlugin[];
}

interface HooksManifest {
  readonly commands: readonly string[];
}

type ManifestRead<T> =
  | {
      readonly status: ReadStatus.Parsed;
      readonly value: T;
    }
  | {
      readonly reason: string;
      readonly status: ReadStatus.NotJson;
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: ReadStatus.Mismatched;
    };

export type { HooksManifest, ManifestRead, MarketplaceManifest, MarketplacePlugin, PluginManifest };
