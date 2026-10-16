interface FieldIssue {
  readonly field: string;
  readonly message: string;
}

interface PluginManifest {
  readonly name: string;
  readonly repository: string | undefined;
  readonly skills: readonly string[];
}

interface MarketplacePlugin {
  readonly name: string;
  readonly ref: string | undefined;
  readonly repo: string | undefined;
}

interface MarketplaceManifest {
  readonly plugins: readonly MarketplacePlugin[];
}

interface HooksManifest {
  readonly commands: readonly string[];
}

type ManifestRead<T> =
  | {
      readonly status: 'parsed';
      readonly value: T;
    }
  | {
      readonly reason: string;
      readonly status: 'not-json';
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: 'mismatched';
    };

export type {
  FieldIssue,
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  MarketplacePlugin,
  PluginManifest,
};
